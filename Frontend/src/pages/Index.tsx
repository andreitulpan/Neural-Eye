
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, AlertCircle, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardStatsCard from '@/components/dashboard/DashboardStatsCard';
import RecentEventsCard from '@/components/dashboard/RecentEventsCard';
import DeviceStatusOverview from '@/components/dashboard/DeviceStatusOverview';
import AppLayout from '@/components/layout/AppLayout';
import { SidebarProvider } from '@/components/layout/SidebarContext';

const Index = () => {
  return (
    <SidebarProvider>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Monitor your IoT devices and video streams.</p>
            </div>
            <Button asChild>
              <Link to="/devices/add">Add New Device</Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatsCard 
              title="Total Devices"
              value="12"
              description="+2 from last week"
              icon={<Camera className="h-4 w-4" />}
              trend="up"
            />
            <DashboardStatsCard 
              title="Active Streams"
              value="8"
              description="66% of devices"
              icon={<Activity className="h-4 w-4" />}
              trend="neutral"
            />
            <DashboardStatsCard 
              title="Alerts Today"
              value="3"
              description="-2 from yesterday"
              icon={<AlertCircle className="h-4 w-4" />}
              trend="down"
              trendColor="positive"
            />
            <DashboardStatsCard 
              title="Security Status"
              value="Secure"
              description="All systems normal"
              icon={<Shield className="h-4 w-4" />}
              trend="neutral"
              valueClassName="text-status-online"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4 border-border bg-dashboard-card">
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
                <CardDescription>Overview of all connected devices</CardDescription>
              </CardHeader>
              <CardContent>
                <DeviceStatusOverview />
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/devices">View All Devices</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-3 border-border bg-dashboard-card">
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest detected events from your devices</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentEventsCard />
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/logs">View All Logs</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </AppLayout>
    </SidebarProvider>
  );
};

export default Index;
