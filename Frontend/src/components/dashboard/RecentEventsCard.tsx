
import React from 'react';
import { Camera, User, Package, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demo purposes
const events = [
  { 
    id: 1, 
    deviceId: 2, 
    deviceName: 'Backyard Camera',
    eventType: 'person', 
    timestamp: '2023-08-15T14:22:30Z', 
    confidence: 0.89
  },
  { 
    id: 2, 
    deviceId: 5, 
    deviceName: 'Kitchen Camera',
    eventType: 'motion', 
    timestamp: '2023-08-15T13:45:12Z', 
    confidence: 0.76
  },
  { 
    id: 3, 
    deviceId: 2, 
    deviceName: 'Backyard Camera',
    eventType: 'vehicle', 
    timestamp: '2023-08-15T12:30:05Z', 
    confidence: 0.92
  },
  { 
    id: 4, 
    deviceId: 1, 
    deviceName: 'Front Door Camera',
    eventType: 'package', 
    timestamp: '2023-08-15T10:15:45Z', 
    confidence: 0.84
  },
];

const EventIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'person':
      return <User className="h-4 w-4" />;
    case 'vehicle':
      return <Car className="h-4 w-4" />;
    case 'package':
      return <Package className="h-4 w-4" />;
    default:
      return <Camera className="h-4 w-4" />;
  }
};

const RecentEventsCard = () => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div 
          key={event.id}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <EventIcon type={event.eventType} />
            </div>
            <div>
              <h3 className="font-medium capitalize">{event.eventType} Detected</h3>
              <p className="text-xs text-muted-foreground">{event.deviceName}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium">{formatTime(event.timestamp)}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round(event.confidence * 100)}% confidence
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentEventsCard;
