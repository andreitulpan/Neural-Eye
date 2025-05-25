
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
  const [imageKey, setImageKey] = useState(0); // Add key for forcing re-renders
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  const updateImage = useCallback((imageUrl: string) => {
    console.log('Updating image with new data, URL type:', imageUrl.startsWith('blob:') ? 'blob' : 'data', 'length:', imageUrl.length);
    
    // Clean up previous object URL if it exists
    if (imageUrlRef.current && imageUrlRef.current.startsWith('blob:')) {
      console.log('Cleaning up previous blob URL');
      URL.revokeObjectURL(imageUrlRef.current);
    }
    
    // Store the new image URL and update state
    imageUrlRef.current = imageUrl;
    setCurrentImage(imageUrl);
    setImageKey(prev => prev + 1); // Force re-render
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
      
      // Set binary type to handle byte arrays properly
      ws.binaryType = 'blob';
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully, binaryType:', ws.binaryType);
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
        console.log('Received WebSocket message, data type:', typeof event.data, 'constructor:', event.data.constructor.name);
        
        try {
          if (event.data instanceof Blob) {
            console.log('Processing Blob data, size:', event.data.size, 'type:', event.data.type);
            
            // Create object URL directly from blob - this should handle byte[] data properly
            const imageUrl = URL.createObjectURL(event.data);
            console.log('Created blob URL:', imageUrl.substring(0, 50) + '...');
            updateImage(imageUrl);
            
          } else if (event.data instanceof ArrayBuffer) {
            console.log('Processing ArrayBuffer data, byteLength:', event.data.byteLength);
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            updateImage(imageUrl);
            
          } else if (typeof event.data === 'string') {
            console.log('Processing string data, length:', event.data.length);
            
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'image' && data.data) {
                // Handle base64 encoded image in JSON
                const imageUrl = data.data.startsWith('data:') ? data.data : `data:image/jpeg;base64,${data.data}`;
                console.log('JSON image data processed, data URL created');
                updateImage(imageUrl);
              } else {
                console.log('Received non-image JSON message:', data);
              }
            } catch (jsonError) {
              // If not JSON, treat as raw base64 data
              console.log('Treating string as raw base64 data');
              const imageUrl = event.data.startsWith('data:') ? event.data : `data:image/jpeg;base64,${event.data}`;
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

  // Cleanup on unmount
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
    imageKey, // Export the key for forcing re-renders
    connect,
    disconnect
  };
};
