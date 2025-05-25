
import React, { useState } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSidebar } from './SidebarContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    title: 'Device Offline',
    description: 'Backyard Camera is offline',
    time: '2 hours ago',
    read: false
  },
  {
    id: 2,
    title: 'Motion Detected',
    description: 'Motion detected on Front Door Camera',
    time: '4 hours ago',
    read: false
  },
  {
    id: 3,
    title: 'System Update',
    description: 'New system update available',
    time: 'Yesterday',
    read: true
  }
];

const Navbar = () => {
  const { setIsOpen } = useSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    // Call the logout function from auth context
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  return (
    <nav className="bg-dashboard-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(prev => !prev)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">NeuralEye</h1>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-80 overflow-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 text-sm rounded-md ${notification.read ? 'bg-transparent' : 'bg-muted'}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-muted-foreground">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
