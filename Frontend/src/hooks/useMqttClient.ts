
import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';

interface UseMqttClientOptions {
  brokerUrl: string;
  topic: string;
  enabled?: boolean;
}

export const useMqttClient = ({ brokerUrl, topic, enabled = true }: UseMqttClientOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    if (!enabled) return;

    console.log(`Attempting to connect to MQTT broker: ${brokerUrl}`);
    
    try {
      const client = mqtt.connect(brokerUrl);
      clientRef.current = client;

      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        setIsConnected(true);
        setError(null);
        
        client.subscribe(topic, (err) => {
          if (err) {
            console.error('Failed to subscribe to topic:', err);
            setError(`Failed to subscribe to topic: ${err.message}`);
          } else {
            console.log(`Subscribed to topic: ${topic}`);
          }
        });
      });

      client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
          console.log('Received image data from MQTT');
          // Convert buffer to base64 data URL for display
          const base64 = message.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64}`;
          setLastMessage(dataUrl);
        }
      });

      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('MQTT connection closed');
        setIsConnected(false);
      });

    } catch (err) {
      console.error('Failed to create MQTT client:', err);
      setError(`Failed to create MQTT client: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      if (clientRef.current) {
        console.log('Disconnecting from MQTT broker');
        clientRef.current.end();
        clientRef.current = null;
      }
    };
  }, [brokerUrl, topic, enabled]);

  return {
    isConnected,
    lastMessage,
    error,
    disconnect: () => {
      if (clientRef.current) {
        clientRef.current.end();
        clientRef.current = null;
        setIsConnected(false);
      }
    }
  };
};
