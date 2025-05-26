import React, { useState } from 'react';
import { Bell, ChevronRight, Lock, ShieldCheck, User, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

// Form schema for user profile
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(1, {
    message: "Name is required.",
  }),
});

// Form schema for notifications
const notificationFormSchema = z.object({
  deviceOffline: z.boolean().default(true),
  detectionAlerts: z.boolean().default(true),
  systemUpdates: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
});

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [videoQuality, setVideoQuality] = useState([720]);
  const [retentionDays, setRetentionDays] = useState([7]);
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.name?.toLowerCase().replace(/\s+/g, '_') || "user",
      email: user?.email || "",
      name: user?.name || "",
    },
  });
  
  // Notification form
  const notificationForm = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      deviceOffline: true,
      detectionAlerts: true,
      systemUpdates: true,
      emailNotifications: false,
      pushNotifications: true,
    },
  });
  
  const onProfileSubmit = (data) => {
    toast.success("Profile settings saved successfully");
    console.log("Profile data:", data);
  };
  
  const onNotificationSubmit = (data) => {
    toast.success("Notification settings saved successfully");
    console.log("Notification data:", data);
  };
  
  const handleSystemSettingsSave = () => {
    toast.success("System settings saved successfully");
    console.log("Video quality:", videoQuality[0], "Retention days:", retentionDays[0]);
  };
  
  const handleSecuritySettingsSave = () => {
    toast.success("Security settings saved successfully");
  };
  
  return (
    <SidebarProvider>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 gap-4 md:w-full md:max-w-lg">
              <TabsTrigger value="account" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Account Tab */}
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Manage your profile information and email address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Save changes</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>
                    Manage API keys for accessing the system programmatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-4">
                      <div className="font-mono text-sm">
                        <div className="mb-2 font-semibold">Your API Key:</div>
                        <div className="break-all">••••••••••••••••••••••••••••••••</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Regenerate API Key</Button>
                      <Button variant="outline">Copy API Key</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what events you want to be notified about
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
                      <div className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="deviceOffline"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Device Offline Alerts</FormLabel>
                                <FormDescription>
                                  Receive notifications when devices go offline
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="detectionAlerts"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Detection Alerts</FormLabel>
                                <FormDescription>
                                  Receive notifications for object detection events
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="systemUpdates"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">System Updates</FormLabel>
                                <FormDescription>
                                  Receive notifications about system updates
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Separator className="my-4" />
                        
                        <h3 className="text-lg font-medium">Notification Methods</h3>
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Push Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications in the browser
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Save notification settings</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* System Tab */}
            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide settings for your devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Video Quality</h3>
                      <div className="mb-2 flex justify-between">
                        <span>SD (480p)</span>
                        <span>HD (720p)</span>
                        <span>Full HD (1080p)</span>
                      </div>
                      <Slider
                        value={videoQuality}
                        min={480}
                        max={1080}
                        step={240}
                        onValueChange={setVideoQuality}
                        className="mb-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        Current quality: {videoQuality[0]}p
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Higher quality requires more bandwidth and processing power
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Log Retention Period</h3>
                      <div className="mb-2 flex justify-between">
                        <span>1 Day</span>
                        <span>7 Days</span>
                        <span>30 Days</span>
                      </div>
                      <Slider
                        value={retentionDays}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={setRetentionDays}
                        className="mb-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        Current retention: {retentionDays[0]} days
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Longer retention periods require more storage space
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="mb-2 text-lg font-medium">MQTT Broker</h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Broker URL</label>
                            <Input defaultValue="mqtt://broker.example.com:1883" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Broker Port</label>
                            <Input type="number" defaultValue="1883" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input defaultValue="mqttuser" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input type="password" defaultValue="password" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleSystemSettingsSave}>Save system settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input type="password" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">
                        Enable
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Security Log</h4>
                        <p className="text-sm text-muted-foreground">
                          View recent security activity on your account
                        </p>
                      </div>
                      <Button variant="outline">
                        View Log
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Device Sessions</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage or sign out from other devices
                        </p>
                      </div>
                      <Button variant="outline">
                        Manage
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button onClick={handleSecuritySettingsSave}>Save security settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </SidebarProvider>
  );
};

export default SettingsPage;
