
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock device data for editing
const mockDevices = [
  { id: 1, name: 'Front Door Camera', location: 'Entrance', model: 'ESP32-CAM', description: 'Monitors front entrance', mqttTopic: 'home/entrance/cam1', sampleRate: '15', resolution: '640x480' },
  { id: 2, name: 'Backyard Camera', location: 'Garden', model: 'ESP32-CAM', description: 'Monitors backyard and garden area', mqttTopic: 'home/garden/cam1', sampleRate: '10', resolution: '800x600' },
];

const DeviceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = id !== 'add';
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    model: 'ESP32-CAM',
    description: '',
    mqttTopic: '',
    sampleRate: '15',
    resolution: '640x480',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      // In a real app, this would be an API call
      const device = mockDevices.find(d => d.id === Number(id));
      if (device) {
        setFormData({
          name: device.name,
          location: device.location,
          model: device.model,
          description: device.description,
          mqttTopic: device.mqttTopic,
          sampleRate: device.sampleRate,
          resolution: device.resolution,
        });
      }
    }
  }, [id, isEditMode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would be replaced with actual API call
      console.log('Saving device:', formData);
      
      // Mock successful save
      setTimeout(() => {
        toast({
          title: isEditMode ? "Device updated" : "Device added",
          description: `${formData.name} has been ${isEditMode ? 'updated' : 'added'} successfully.`,
        });
        navigate('/devices');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving device:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} device. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // This would be replaced with actual API call
      console.log('Deleting device with ID:', id);
      
      // Mock successful deletion
      setTimeout(() => {
        toast({
          title: "Device deleted",
          description: "The device has been deleted successfully.",
        });
        navigate('/devices');
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete device. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/devices')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? 'Edit Device' : 'Add New Device'}
          </h1>
        </div>
        {isEditMode && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the device
                  and all associated data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <Card className="border-border bg-dashboard-card mt-6">
            <TabsContent value="basic" className="m-0">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Device Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Front Door Camera"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Entrance, Kitchen, etc."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Device Model</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => handleSelectChange('model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESP32-CAM">ESP32-CAM</SelectItem>
                      <SelectItem value="ESP32-CAM-MB">ESP32-CAM with Motion Board</SelectItem>
                      <SelectItem value="AI-THINKER">AI-Thinker ESP32-CAM</SelectItem>
                      <SelectItem value="CUSTOM">Custom ESP32 Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add a description for this device..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="connection" className="m-0">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mqttTopic">MQTT Topic</Label>
                  <Input
                    id="mqttTopic"
                    name="mqttTopic"
                    value={formData.mqttTopic}
                    onChange={handleChange}
                    placeholder="e.g. home/entrance/cam1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The MQTT topic this device will publish video frames to.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sampleRate">Frame Rate</Label>
                    <Select
                      value={formData.sampleRate}
                      onValueChange={(value) => handleSelectChange('sampleRate', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frame rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 FPS</SelectItem>
                        <SelectItem value="10">10 FPS</SelectItem>
                        <SelectItem value="15">15 FPS</SelectItem>
                        <SelectItem value="20">20 FPS</SelectItem>
                        <SelectItem value="25">25 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select
                      value={formData.resolution}
                      onValueChange={(value) => handleSelectChange('resolution', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="320x240">320x240</SelectItem>
                        <SelectItem value="640x480">640x480</SelectItem>
                        <SelectItem value="800x600">800x600</SelectItem>
                        <SelectItem value="1280x720">1280x720</SelectItem>
                        <SelectItem value="1920x1080">1920x1080</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="advanced" className="m-0">
              <CardContent className="p-6">
                <div className="rounded-md bg-secondary/50 p-4">
                  <p className="text-sm">
                    Advanced settings will be available in a future update. These will include:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                    <li>Object detection sensitivity</li>
                    <li>Video encoding options</li>
                    <li>Motion detection zones</li>
                    <li>Alert notifications configuration</li>
                  </ul>
                </div>
              </CardContent>
            </TabsContent>
            
            <CardFooter className="p-6 pt-0 flex justify-end gap-4">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => navigate('/devices')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Device'}
              </Button>
            </CardFooter>
          </Card>
        </Tabs>
      </form>
    </div>
  );
};

export default DeviceForm;
