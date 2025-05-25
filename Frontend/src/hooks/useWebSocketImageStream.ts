
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  const updateImage = useCallback((imageUrl: string) => {
    console.log('Updating image with new data, length:', imageUrl.length);
    
    // Clean up previous object URL if it exists
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    
    // Store the new image URL
    imageUrlRef.current = imageUrl;
    setCurrentImage(imageUrl);
  }, []);

  const connect = useCallback(() => {
    // Don't create a new connection if one already exists and is connecting/open
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connecting or connected, skipping');
      return;
    }

    try {
      console.log('Connecting to WebSocket:', url);
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        
        // Send device identification if provided
        if (deviceId) {
          console.log('Sending device subscription:', deviceId);
          ws.send(JSON.stringify({ 
            type: 'subscribe', 
            deviceId: deviceId 
          }));
        }
      };

      ws.onmessage = (event) => {
        console.log('Received WebSocket message, type:', typeof event.data);
        
        try {
          if (event.data instanceof Blob) {
            // Handle binary image data (Blob) - create object URL for better performance
            console.log('Processing Blob data, size:', event.data.size);
            const imageUrl = URL.createObjectURL(event.data);
            updateImage(imageUrl);
          } else if (event.data instanceof ArrayBuffer) {
            // Handle ArrayBuffer data
            console.log('Processing ArrayBuffer data, byteLength:', event.data.byteLength);
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            updateImage(imageUrl);
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
              } else {
                console.log('Received non-image JSON message:', data);
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
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds if not manually closed
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
    
    // Clean up object URL
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrlRef.current);
    }
    
    setIsConnected(false);
    setCurrentImage(null);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    currentImage,
    connectionError,
    connect,
    disconnect
  };
};
