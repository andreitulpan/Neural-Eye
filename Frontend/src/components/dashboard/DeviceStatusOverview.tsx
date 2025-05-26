
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Single camera device
const devices = [
  { id: 1, name: 'Camera', location: 'Entrance', status: 'online', alerts: 0 },
];

const DeviceStatusOverview = () => {
  return (
    <div className="space-y-3">
      {devices.map((device) => (
        <Link 
          key={device.id} 
          to={`/stream-view/${device.id}`}
          className="block"
        >
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                device.status === 'online' && "bg-status-online/20 text-status-online",
                device.status === 'offline' && "bg-status-offline/20 text-status-offline",
                device.status === 'warning' && "bg-status-warning/20 text-status-warning",
              )}>
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{device.name}</h3>
                <p className="text-xs text-muted-foreground">{device.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {device.alerts > 0 && (
                <div className="flex items-center gap-1 text-status-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-medium">{device.alerts}</span>
                </div>
              )}
              
              <div className={cn(
                "status-badge",
                device.status === 'online' && "status-online",
                device.status === 'offline' && "status-offline",
                device.status === 'warning' && "status-warning",
              )}>
                {device.status === 'online' && <Wifi className="h-3 w-3" />}
                {device.status === 'offline' && <WifiOff className="h-3 w-3" />}
                {device.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
                <span>{device.status}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DeviceStatusOverview;
