
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketImageStreamOptions {
  url: string;
  deviceId?: string;
  autoConnect?: boolean;
}

export const useWebSocketImageStream = ({ 
  url, 
  deviceId, 
  autoConnect = true 
}: UseWebSocketImageStreamOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateImage = useCallback((imageUrl: string) => {
    setCurrentImage(imageUrl);
    setLastImage(imageUrl);
  }, []);

  const connect = useCallback(() => {
    try {
      console.log('Connecting to WebSocket:', url);
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        
        // Send device identification if provided
        if (deviceId) {
          ws.send(JSON.stringify({ 
            type: 'subscribe', 
            deviceId: deviceId 
          }));
        }
      };

      ws.onmessage = (event) => {
        console.log('Received WebSocket message, type:', typeof event.data, 'data:', event.data);
        
        try {
          if (event.data instanceof Blob) {
            // Handle binary image data (Blob)
            console.log('Processing Blob data, size:', event.data.size);
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log('Blob converted to data URL, length:', result.length);
              updateImage(result);
            };
            reader.readAsDataURL(event.data);
          } else if (event.data instanceof ArrayBuffer) {
            // Handle ArrayBuffer data
            console.log('Processing ArrayBuffer data, byteLength:', event.data.byteLength);
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log('ArrayBuffer converted to data URL, length:', result.length);
              updateImage(result);
            };
            reader.readAsDataURL(blob);
          } else if (typeof event.data === 'string') {
            // Handle string data (could be JSON or base64)
            console.log('Processing string data, length:', event.data.length);
            
            // Try to parse as JSON first
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'image' && data.data) {
                // Assume base64 encoded image
                const imageUrl = `data:image/jpeg;base64,${data.data}`;
                console.log('JSON image data processed');
                updateImage(imageUrl);
              }
            } catch (jsonError) {
              // If not JSON, treat as raw base64 data
              console.log('Treating string as raw base64 data');
              const imageUrl = `data:image/jpeg;base64,${event.data}`;
              updateImage(imageUrl);
            }
          } else {
            console.warn('Unknown message format:', typeof event.data, event.data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setCurrentImage(lastImage); // Restore last image when connection closes
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds if not manually closed
        if (event.code !== 1000 && autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect to WebSocket');
    }
  }, [url, deviceId, autoConnect, updateImage, lastImage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setCurrentImage(null);
    setLastImage(null);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    isConnected,
    currentImage: currentImage || lastImage, // Return last image if current is null
    connectionError,
    connect,
    disconnect
  };
};
