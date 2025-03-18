
import React from 'react';
import { Camera, Server, Cpu, Database, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import AppLayout from '@/components/layout/AppLayout';

const About = () => {
  return (
    <SidebarProvider>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">About LiveVue.io</h1>
            <p className="text-muted-foreground mt-2">
              Advanced video monitoring and object detection platform for IoT devices.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-dashboard-card">
              <CardHeader>
                <CardTitle>Our Platform</CardTitle>
                <CardDescription>
                  LiveVue.io provides a seamless interface between ESP32-CAM devices and advanced video processing capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our system leverages the power of ASP.NET for backend processing and Next.js for the responsive frontend,
                  creating a modern and efficient platform for real-time video monitoring and analysis.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                      <Camera className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">IoT Integration</h3>
                    <p className="text-sm text-muted-foreground">Seamless device connectivity</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                      <Server className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">Cloud Processing</h3>
                    <p className="text-sm text-muted-foreground">Scalable backend architecture</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">AI Detection</h3>
                    <p className="text-sm text-muted-foreground">Advanced object recognition</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                      <Database className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium">Data Analytics</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive event logging</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border bg-dashboard-card">
              <CardHeader>
                <CardTitle>Technical Information</CardTitle>
                <CardDescription>
                  Learn about the technologies powering the LiveVue.io platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Frontend</h3>
                  <p className="text-sm text-muted-foreground">
                    Built with Next.js, React, and Tailwind CSS, our frontend delivers a responsive and 
                    intuitive user experience across all devices.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Backend</h3>
                  <p className="text-sm text-muted-foreground">
                    Powered by ASP.NET, our backend handles complex video processing, object detection, 
                    and secure API communications.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Communication</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time data is transmitted using MQTT protocol, ensuring efficient and 
                    reliable delivery of video streams and sensor data.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Hardware</h3>
                  <p className="text-sm text-muted-foreground">
                    Compatible with ESP32-CAM modules and other IoT devices, extending your
                    monitoring capabilities with affordable hardware.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-border bg-dashboard-card">
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>
                Meet the people behind LiveVue.io
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">
                  The team section will be expanded as the project grows. We're a group of passionate 
                  developers and engineers dedicated to creating innovative IoT solutions.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground pt-6 pb-10">
            <p>© 2023 LiveVue.io. All rights reserved.</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </AppLayout>
    </SidebarProvider>
  );
};

export default About;
