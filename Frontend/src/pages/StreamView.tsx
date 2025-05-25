import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Maximize2, Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import AppLayout from '@/components/layout/AppLayout';
import { useWebSocketImageStream } from '@/hooks/useWebSocketImageStream';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

// Mock device data
const mockDevices = [
  {
    id: '1',
    name: 'Front Door Camera',
    type: 'ESP32-CAM',
    status: 'online',
    location: 'Front Entrance',
  },
  {
    id: '2',
    name: 'Backyard Camera',
    type: 'ESP32-CAM',
    status: 'offline',
    location: 'Backyard',
  },
  {
    id: '3',
    name: 'Garage Camera',
    type: 'ESP32-CAM',
    status: 'online',
    location: 'Garage',
  },
  {
    id: '4',
    name: 'Kitchen Camera',
    type: 'ESP32-CAM',
    status: 'maintenance',
    location: 'Kitchen',
  },
  {
    id: '5',
    name: 'Living Room Camera',
    type: 'ESP32-CAM',
    status: 'online',
    location: 'Living Room',
  },
];

const StreamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // WebSocket connection for Front Door Camera (id: '1')
  const { 
    isConnected: wsConnected, 
    currentImage, 
    connectionError 
  } = useWebSocketImageStream({
    url: 'wss://neuraleye.thezion.one/ws',
    deviceId: id === '1' ? 'front-door-camera' : undefined,
    autoConnect: id === '1' && activeTab === 'live'
  });
  
  useEffect(() => {
    // Simulate API call to get device details
    const foundDevice = mockDevices.find(d => d.id === id);
    
    if (foundDevice) {
      setDevice(foundDevice);
    } else {
      toast.error("Device not found");
      navigate('/devices');
    }
    
    setLoading(false);
  }, [id, navigate]);
  
  if (loading) {
    return (
      <SidebarProvider>
        <AppLayout>
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <p>Loading stream...</p>
            </div>
          </div>
        </AppLayout>
      </SidebarProvider>
    );
  }
  
  if (!device) {
    return (
      <SidebarProvider>
        <AppLayout>
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <p>Device not found</p>
              <Button onClick={() => navigate('/devices')} className="mt-4">
                Go back to devices
              </Button>
            </div>
          </div>
        </AppLayout>
      </SidebarProvider>
    );
  }
  
  const handleFullscreen = () => {
    const videoElement = document.getElementById('streamVideo');
    if (videoElement && videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    }
  };
  
  const handleSaveAndExtract = async () => {
    if (!currentImage || !user) {
      toast.error("No image available or user not authenticated");
      return;
    }

    setIsExtracting(true);
    try {
      // Extract base64 data from data URL
      const base64Data = currentImage.split(',')[1] || currentImage;
      
      const response = await authService.saveImage(base64Data, user.id);
      
      toast.success("Image saved and text extracted!", {
        description: response.text ? `Extracted: ${response.text.substring(0, 100)}...` : "No text found in image"
      });
      
      console.log('Extracted text:', response.text);
    } catch (error) {
      console.error('Error saving image and extracting text:', error);
      toast.error("Failed to save image and extract text");
    } finally {
      setIsExtracting(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/devices/${id}/edit`);
  };
  
  const getStreamContent = () => {
    // For Front Door Camera (id: '1'), show WebSocket stream
    if (id === '1') {
      if (device.status !== 'online') {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <p className="text-xl font-semibold text-white">
              {device.status === 'offline' ? 'Camera Offline' : 'Camera in Maintenance Mode'}
            </p>
          </div>
        );
      }

      if (connectionError) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white">
              <p className="text-xl font-semibold">Connection Error</p>
              <p className="text-sm text-gray-300 mt-2">{connectionError}</p>
            </div>
          </div>
        );
      }

      if (!wsConnected) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white">
              <p className="text-xl font-semibold">Connecting...</p>
              <p className="text-sm text-gray-300 mt-2">Establishing WebSocket connection</p>
            </div>
          </div>
        );
      }

      if (currentImage) {
        return (
          <img 
            src={currentImage} 
            alt="Live camera feed" 
            className="w-full h-full object-cover"
          />
        );
      }

      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white">
            <p className="text-xl font-semibold">Waiting for Images</p>
            <p className="text-sm text-gray-300 mt-2">Connected, waiting for camera data...</p>
          </div>
        </div>
      );
    }

    // For other cameras, show placeholder
    return (
      <>
        <div 
          className="flex items-center justify-center h-full w-full text-white"
          style={{ 
            backgroundImage: 'url(https://placehold.co/1280x720/1e1e2e/e0e0e0?text=Live+Stream)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {device.status !== 'online' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <p className="text-xl font-semibold text-white">
              {device.status === 'offline' ? 'Camera Offline' : 'Camera in Maintenance Mode'}
            </p>
          </div>
        )}
      </>
    );
  };
  
  return (
    <SidebarProvider>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/devices')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{device.name}</h1>
              <p className="text-muted-foreground">{device.location}</p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="live">Live View</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
              <TabsTrigger value="events">Detected Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="live" className="space-y-4">
              <Card className="border-border bg-dashboard-card">
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video w-full">
                    <div id="streamVideo" className="relative h-full w-full">
                      {getStreamContent()}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={() => setMuted(!muted)}
                          >
                            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <div className="text-white text-sm">
                            {id === '1' && wsConnected ? (
                              <>
                                Live
                                <span className="ml-2 px-1.5 py-0.5 bg-green-500/80 rounded-sm animate-pulse">●</span>
                              </>
                            ) : (
                              <>
                                Live
                                <span className="ml-2 px-1.5 py-0.5 bg-red-500/80 rounded-sm">●</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={handleSaveAndExtract}
                            disabled={isExtracting || !currentImage}
                            title="Save image and extract text"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={handleFullscreen}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={handleEdit}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-border bg-dashboard-card">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Device Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{device.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={device.status === 'online' ? 'text-status-online' : 'text-status-error'}>
                          {device.status === 'online' ? 'Online' : device.status === 'offline' ? 'Offline' : 'Maintenance'}
                        </span>
                      </div>
                      {id === '1' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">WebSocket:</span>
                          <span className={wsConnected ? 'text-status-online' : 'text-status-error'}>
                            {wsConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span>1280x720</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">FPS:</span>
                        <span>15</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border bg-dashboard-card">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Stream Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bitrate:</span>
                        <span>1.2 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latency:</span>
                        <span>150ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dropped Frames:</span>
                        <span>0.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span>13h 24m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border bg-dashboard-card">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Recent Events</h3>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-2 border-status-warning pl-2">
                        <p className="font-medium">Motion Detected</p>
                        <p className="text-muted-foreground">Today, 14:32</p>
                      </div>
                      <div className="border-l-2 border-status-info pl-2">
                        <p className="font-medium">Person Detected</p>
                        <p className="text-muted-foreground">Today, 12:15</p>
                      </div>
                      <div className="border-l-2 border-status-info pl-2">
                        <p className="font-medium">Person Detected</p>
                        <p className="text-muted-foreground">Today, 09:47</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="recordings">
              <Card className="border-border bg-dashboard-card">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Recording functionality will be available in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="events">
              <Card className="border-border bg-dashboard-card">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Event tracking and classification will be available in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </SidebarProvider>
  );
};

export default StreamView;
