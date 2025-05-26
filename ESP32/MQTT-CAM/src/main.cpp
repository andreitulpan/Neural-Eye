#include <WiFi.h>
#include <AsyncMqttClient.h>
#include <Arduino.h>
#include "esp_camera.h"
#include "Ticker.h"

constexpr char WIFI_SSID[] = ""; // Redacted
constexpr char WIFI_PASS[] = ""; // Redacted
const IPAddress MQTT_HOST{157, 180, 66, 252};
constexpr uint16_t MQTT_PORT = 1883;
constexpr char MQTT_USER[] = "mqtt_admin";
constexpr char MQTT_PASS[] = ""; // Redacted

static const size_t CHUNK_SIZE = 4096;

AsyncMqttClient mqttClient;
Ticker wifiReconnectTimer, mqttReconnectTimer;

// Frame‐sending state machine
camera_fb_t *currentFb = nullptr;
size_t         totalBytes = 0;
uint16_t       totalChunks = 0;
uint16_t       nextChunkIdx = 0;
uint16_t       currFrameId = 0;
bool           sendingInProgress = false;

void connectToWifi();
void connectToMqtt();
void sendNextChunk();

void initCamera() {

	camera_config_t cfg = {
		.pin_pwdn     = 32,
		.pin_reset    = -1,
		.pin_xclk     = 0,
		.pin_sccb_sda = 26,
		.pin_sccb_scl = 27,
		.pin_d7       = 35,
		.pin_d6       = 34,
		.pin_d5       = 39,
		.pin_d4       = 36,
		.pin_d3       = 21,
		.pin_d2       = 19,
		.pin_d1       = 18,
		.pin_d0       = 5,
		.pin_vsync    = 25,
		.pin_href     = 23,
		.pin_pclk     = 22,
		.xclk_freq_hz = 20000000,
		.ledc_timer   = LEDC_TIMER_0,
		.ledc_channel = LEDC_CHANNEL_0,
		.pixel_format = PIXFORMAT_JPEG,
		.frame_size   = FRAMESIZE_SVGA,
		.jpeg_quality = 4,
		.fb_count     = 1
	};
	esp_err_t err = esp_camera_init(&cfg);
	if (err != ESP_OK) {
		Serial.printf("Camera init failed: 0x%x\n", err);
		while(true) delay(1000);
	}
}

void WiFiEvent(WiFiEvent_t event) {
	if (event == ARDUINO_EVENT_WIFI_STA_GOT_IP) {
		Serial.print("Wi-Fi connected, IP=");
		Serial.println(WiFi.localIP());
		connectToMqtt();
	}
	else if (event == ARDUINO_EVENT_WIFI_STA_DISCONNECTED) {
		Serial.println("Wi-Fi lost; retrying in 2s");
		mqttReconnectTimer.detach();
		wifiReconnectTimer.once(2, connectToWifi);
	}
}

void onMqttConnect(bool sessionPresent) {
	Serial.println("MQTT connected; ready to publish frames.");
    mqttClient.subscribe("esp32-cam/config", 1);
	sendNextChunk();
}

void onMqttDisconnect(AsyncMqttClientDisconnectReason r) {
	Serial.printf("MQTT disconnected (reason=%d)\n", (int)r);
	sendingInProgress = false;
	if (WiFi.isConnected()) {
		mqttReconnectTimer.once(2, connectToMqtt);
	}
}

void onMqttPublish(uint16_t packetId) {
	// if we’re in the middle of a frame, push next chunk
	if (sendingInProgress) {
		if (nextChunkIdx < totalChunks) {
            mqttReconnectTimer.once(0, sendNextChunk);
		}
		else {
			// all chunks sent
			Serial.println("\nFrame complete, cleaning up");
			esp_camera_fb_return(currentFb);
			currentFb = nullptr;
			sendingInProgress = false;
			currFrameId = millis() / 512;
			wifiReconnectTimer.once(2, sendNextChunk);
		}
	}
}

void sendNextChunk() {
	if (!sendingInProgress) {
		// first call: grab a fresh frame
		currentFb = esp_camera_fb_get();
		if (!currentFb) {
			Serial.println("Frame capture failed");
			wifiReconnectTimer.once(2, sendNextChunk);
			return;
		}
		totalBytes      = currentFb->len;
		totalChunks     = (totalBytes + CHUNK_SIZE - 1) / CHUNK_SIZE;
		nextChunkIdx    = 0;
		sendingInProgress = true;
		Serial.printf("Captured %u bytes (%u chunks)\n", totalBytes, totalChunks);
	}

	// compute this chunk’s bounds
	size_t offset = nextChunkIdx * CHUNK_SIZE;
	size_t len    = min(CHUNK_SIZE, totalBytes - offset);

	// topic: esp32-cam/jpeg/{frameId}/{chunkIdx}/{totalChunks}
	char topic[64];
	snprintf(topic, sizeof(topic), "esp32-cam/jpeg/%u/%u/%u",
			 currFrameId, nextChunkIdx, totalChunks);

	uint16_t pid = mqttClient.publish(topic, 1, false, reinterpret_cast<const char*>(currentFb->buf) + offset, len);
	if (pid == 0) {
		Serial.printf("Chunk %u/%u publish failed\n", nextChunkIdx, totalChunks);
		sendingInProgress = false;
		esp_camera_fb_return(currentFb);
		currentFb = nullptr;
		return;
	}

	Serial.printf("\rSent chunk %2u/%u, pid=%u, %u bytes", nextChunkIdx, totalChunks, pid, len);
	nextChunkIdx++;
}

void onMqttMessage(char* topic, char* payload, AsyncMqttClientMessageProperties properties,
                   size_t len, size_t index, size_t total) {
    if (strcmp(topic, "esp32-cam/config") != 0) return;

    String msg = String(payload).substring(0, len);
    Serial.printf("Received config message: %s\n", msg.c_str());

    // Parse key=value format (e.g. "quality=10", "frame_size=FRAMESIZE_VGA")
    if (msg.startsWith("quality=")) {
        int q = msg.substring(8).toInt();
        if (q >= 0 && q <= 63) {
            sensor_t* s = esp_camera_sensor_get();
            s->set_quality(s, q);
            Serial.printf("Set quality to %d\n", q);
        }
    } else if (msg.startsWith("frame_size=")) {
        String val = msg.substring(11);
        sensor_t* s = esp_camera_sensor_get();

        // Map string to enum (extend this list as needed)
        if (val == "QQVGA") s->set_framesize(s, FRAMESIZE_QQVGA);
        else if (val == "QVGA") s->set_framesize(s, FRAMESIZE_QVGA);
        else if (val == "VGA") s->set_framesize(s, FRAMESIZE_VGA);
        else if (val == "SVGA") s->set_framesize(s, FRAMESIZE_SVGA);
        else if (val == "XGA") s->set_framesize(s, FRAMESIZE_XGA);
        else Serial.println("Unknown frame_size value");
        
        Serial.printf("Set frame_size to %s\n", val.c_str());
    }
}

void connectToWifi() {
	Serial.println("Connecting to Wi-Fi...");
	WiFi.begin(WIFI_SSID, WIFI_PASS);
}

void connectToMqtt() {
	Serial.println("Connecting to MQTT...");
	mqttClient.connect();
}

void setup() {
	Serial.begin(115200);
	initCamera();

	WiFi.onEvent(WiFiEvent);
	connectToWifi();

	mqttClient.setServer(MQTT_HOST, MQTT_PORT);
	mqttClient.setCredentials(MQTT_USER, MQTT_PASS);
	mqttClient.onConnect(onMqttConnect);
	mqttClient.onDisconnect(onMqttDisconnect);
	mqttClient.onPublish(onMqttPublish);
    mqttClient.onMessage(onMqttMessage);
}

void loop() {
}
