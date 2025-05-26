
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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  const updateImage = useCallback((imageUrl: string) => {
    console.log('Updating image with new data, URL type:', imageUrl.startsWith('blob:') ? 'blob' : 'data');
    
    // Clean up previous object URL if it exists
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      console.log('Cleaning up previous blob URL');
      URL.revokeObjectURL(imageUrlRef.current);
    }
    
    // Store the new image URL
    imageUrlRef.current = imageUrl;
    
    // Update state with the new image
    setCurrentImage(imageUrl);
    setImageKey(prev => prev + 1);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connecting or connected, skipping');
      return;
    }

    try {
      console.log('Connecting to WebSocket:', url);
      const ws = new WebSocket(url);
      
      ws.binaryType = 'blob';
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        
        if (deviceId) {
          console.log('Sending device subscription:', deviceId);
          ws.send(JSON.stringify({ 
            type: 'subscribe', 
            deviceId: deviceId 
          }));
        }
      };

      ws.onmessage = (event) => {
        console.log('Received WebSocket message, data type:', typeof event.data);
        
        try {
          if (event.data instanceof Blob) {
            console.log('Processing Blob data, size:', event.data.size);
            
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              updateImage(base64);
            };
            reader.onerror = (error) => {
              console.error('FileReader error:', error);
            };
            reader.readAsDataURL(event.data);
            
          } else if (event.data instanceof ArrayBuffer) {
            console.log('Processing ArrayBuffer data, byteLength:', event.data.byteLength);
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              updateImage(base64);
            };
            reader.onerror = (error) => {
              console.error('FileReader error for ArrayBuffer:', error);
            };
            reader.readAsDataURL(blob);
            
          } else if (typeof event.data === 'string') {
            console.log('Processing string data');
            
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'image' && data.data) {
                const imageUrl = data.data.startsWith('data:') ? data.data : `data:image/jpeg;base64,${data.data}`;
                updateImage(imageUrl);
              } else {
                console.log('Received non-image JSON message:', data);
              }
            } catch (jsonError) {
              const imageUrl = event.data.startsWith('data:') ? event.data : `data:image/jpeg;base64,${event.data}`;
              updateImage(imageUrl);
            }
          } else {
            console.warn('Unknown message format:', typeof event.data);
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
        wsRef.current = null;
        
        if (event.code !== 1000 && autoConnect) {
          console.log('Scheduling reconnection in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect to WebSocket');
    }
  }, [url, deviceId, autoConnect, updateImage]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket...');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      console.log('Cleaning up blob URL on disconnect');
      URL.revokeObjectURL(imageUrlRef.current);
    }
    
    setIsConnected(false);
    setCurrentImage(null);
    setImageKey(0);
    imageUrlRef.current = null;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  useEffect(() => {
    return () => {
      if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
        console.log('Cleaning up blob URL on unmount');
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    currentImage,
    connectionError,
    imageKey,
    connect,
    disconnect
  };
};
