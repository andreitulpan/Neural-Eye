
import React, { useState } from 'react';
import { PlusCircle, Settings, Trash2, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import AppLayout from '@/components/layout/AppLayout';

// Mock device data
const mockDevices = [
  {
    id: '1',
    name: 'Front Door Camera',
    type: 'ESP32-CAM',
    status: 'online',
    lastSeen: new Date().toISOString(),
    location: 'Front Entrance',
    ipAddress: '192.168.1.101',
    firmware: 'v1.2.0',
  },
  {
    id: '2',
    name: 'Backyard Camera',
    type: 'ESP32-CAM',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    location: 'Backyard',
    ipAddress: '192.168.1.102',
    firmware: 'v1.1.8',
  },
  {
    id: '3',
    name: 'Garage Camera',
    type: 'ESP32-CAM',
    status: 'online',
    lastSeen: new Date().toISOString(),
    location: 'Garage',
    ipAddress: '192.168.1.103',
    firmware: 'v1.2.0',
  },
  {
    id: '4',
    name: 'Kitchen Camera',
    type: 'ESP32-CAM',
    status: 'maintenance',
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    location: 'Kitchen',
    ipAddress: '192.168.1.104',
    firmware: 'v1.1.9',
  },
  {
    id: '5',
    name: 'Living Room Camera',
    type: 'ESP32-CAM',
    status: 'online',
    lastSeen: new Date().toISOString(),
    location: 'Living Room',
    ipAddress: '192.168.1.105',
    firmware: 'v1.2.0',
  },
];

const DevicesPage = () => {
  const [devices, setDevices] = useState(mockDevices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter devices based on search query and status filter
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         device.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format the last seen timestamp
  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">Online</Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error/20">Offline</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/20">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <SidebarProvider>
      <AppLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Devices</h1>
            <Link to="/devices/add">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Device
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDevices.map((device) => (
              <Card key={device.id} className="overflow-hidden hover:shadow-md transition-shadow border-border bg-dashboard-card">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{device.name}</CardTitle>
                      <CardDescription>{device.location}</CardDescription>
                    </div>
                    <div>{getStatusBadge(device.status)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Device Type:</span>
                      <span>{device.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="font-mono">{device.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Firmware:</span>
                      <span>{device.firmware}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Seen:</span>
                      <span>{formatLastSeen(device.lastSeen)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 pt-2">
                  <Link to={`/stream-view/${device.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      View Stream
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Link to={`/devices/${device.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" className="text-status-error hover:text-status-error">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            {filteredDevices.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <p className="text-muted-foreground">No devices found matching your filters</p>
                  <Button variant="link" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </SidebarProvider>
  );
};

export default DevicesPage;
