import os
import datetime
import threading
from collections import defaultdict

import paho.mqtt.client as mqtt

BROKER   = '157.180.66.252'
PORT     = 1883
TOPIC    = 'esp32-cam/jpeg/#'
USERNAME = 'mqtt_admin'
PASSWORD = '' # Redacted
SAVE_DIR = '..\\captured_frames'

client = mqtt.Client()
client.username_pw_set(USERNAME, PASSWORD)

os.makedirs(SAVE_DIR, exist_ok=True)

# frame_buffers[frame_id] = { 'total': int,
#                            'received': {chunkIdx: bytes, ...},
#                            'lock': threading.Lock() }
frame_buffers = defaultdict(lambda: {
    'total':      None,
    'received':   {},
    'lock':       threading.Lock(),
})

@client.connect_callback()
def on_connect(cl, userdata, flags, rc): # pylint: disable=unused-argument
    print("Connected, subscribing...")
    client.subscribe(TOPIC)

def try_save_frame(frame_id):
    buf = frame_buffers[frame_id]
    if buf['total'] is None:
        return

    current = len(buf['received'])
    total   = buf['total']
    with buf['lock']:
        if current != total:
            print(f"\rReconstructing frame {frame_id} ({total} chunks " +\
                  f"[{'#' * current}{' ' * (total - current)}])", end='', flush=True)
            return  # still waiting for chunks

        # all chunks in order
        data = b''.join(buf['received'][i] for i in range(buf['total']))
        ts   = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        img_name = f"frame_{frame_id}_{ts}.jpg"
        fn   = os.path.join(SAVE_DIR, img_name)
        with open(fn, 'wb') as f:
            f.write(data)
        print(f"\rSaved reconstructed frame {frame_id} -> {fn}", flush=True)
        # send_image_to_server(data, img_name)
        # clean up
        del frame_buffers[frame_id]

@client.message_callback()
def on_message(cl, userdata, msg): # pylint: disable=unused-argument
    # topic: esp32-cam/jpeg/{frameId}/{chunkIdx}/{totalChunks}
    parts = msg.topic.split('/')
    if len(parts) != 5:
        return
    _, _, frame_id_s, idx_s, total_s = parts
    frame_id     = int(frame_id_s)
    idx         = int(idx_s)
    total_chunks = int(total_s)

    entry = frame_buffers[frame_id]
    with entry['lock']:
        entry['total'] = total_chunks
        entry['received'][idx] = msg.payload

    try_save_frame(frame_id)
    
def config_publisher():
    print("\nConfig publisher ready. Type commands like:")
    print("quality=10")
    print("frame_size=FRAMESIZE_VGA")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            config = input("Enter config: ").strip()
            if config.lower() == 'exit':
                print("Exiting...")
                client.disconnect()
                break
            if '=' not in config:
                print("Invalid format. Use key=value.")
                continue
            client.publish("esp32-cam/config", config, qos=1, retain=False)
            print(f"Published config → {config}")
        except (KeyboardInterrupt, EOFError):
            print("\nInterrupted. Disconnecting...")
            client.disconnect()
            break

# def send_image_to_server(image_bytes: bytes, img_name: str):
#     url = "http://your-server.com/upload"

#     try:
#         response = requests.post(url, files={
#             'file': (img_name, image_bytes, 'image/jpeg')
#         }, timeout=5)
#         print(f"Server responded with status {response.status_code}")
#         if response.ok:
#             print("Upload successful.")
#         else:
#             print("Upload failed:", response.text)
#     except Exception as e:      # pylint: disable=broad-exception-caught
#         print("Error sending image to server:", e)

def main():
    client.connect(BROKER, PORT, keepalive=60)
    client.loop_start()
    config_publisher()

if __name__ == '__main__':
    main()
