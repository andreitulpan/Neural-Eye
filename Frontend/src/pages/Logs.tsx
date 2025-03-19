
import React, { useState } from 'react';
import { Download, Filter, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import AppLayout from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';

// Mock log data for demo purposes
const mockLogs = Array.from({ length: 50 }).map((_, i) => {
  const types = ['info', 'warning', 'error', 'detection'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  const baseTime = new Date();
  baseTime.setMinutes(baseTime.getMinutes() - i * 5);
  
  let message = '';
  switch (type) {
    case 'info':
      message = [
        'Stream started',
        'Motion detected in zone 2',
        'Processing resumed',
        'Configuration updated',
        'User login successful'
      ][Math.floor(Math.random() * 5)];
      break;
    case 'warning':
      message = [
        'Low light conditions',
        'High CPU usage detected',
        'Network latency increased',
        'Stream quality reduced',
        'Battery level low on device'
      ][Math.floor(Math.random() * 5)];
      break;
    case 'error':
      message = [
        'Frame processing error',
        'Connection lost to device',
        'Failed to update configuration',
        'MQTT connection timeout',
        'Authentication failed'
      ][Math.floor(Math.random() * 5)];
      break;
    case 'detection':
      const objects = ['Person', 'Vehicle', 'Animal', 'Package', 'Unknown object'];
      const confidence = Math.floor(70 + Math.random() * 30);
      message = `${objects[Math.floor(Math.random() * objects.length)]} detected (Confidence: ${confidence}%)`;
      break;
  }

  // Random device IDs
  const deviceIds = ['Front Door Camera', 'Backyard Camera', 'Garage Camera', 'Driveway Camera', 'Kitchen Camera'];
  const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];

  return {
    id: i + 1,
    timestamp: baseTime.toISOString(),
    type,
    message,
    deviceId
  };
});

const LogsPage = () => {
  const [logs, setLogs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Filter logs based on search term, type filter, and device filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesDevice = deviceFilter === 'all' || log.deviceId === deviceFilter;
    
    return matchesSearch && matchesType && matchesDevice;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  
  // Unique device IDs for the filter
  const uniqueDevices = Array.from(new Set(logs.map(log => log.deviceId)));
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDeviceFilter('all');
    setCurrentPage(1);
  };
  
  // Export logs (mock functionality)
  const handleExportLogs = () => {
    // In a real app, this would generate a CSV or JSON file
    console.log('Exporting logs:', filteredLogs);
    alert('Logs exported successfully! (This is a mock functionality)');
  };
  
  return (
    <SidebarProvider>
      <AppLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">System Logs</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
          
          <Card className="border-border bg-dashboard-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Log Events
                <Badge variant="outline" className="ml-2 bg-secondary/50 text-secondary-foreground">
                  {filteredLogs.length} entries
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="detection">Detection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Filter by device" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Devices</SelectItem>
                          {uniqueDevices.map(device => (
                            <SelectItem key={device} value={device}>{device}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-320px)] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[150px]">Device</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentLogs.length > 0 ? (
                        currentLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {formatTime(log.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  log.type === 'info' && "bg-secondary/50 text-secondary-foreground border-secondary/20",
                                  log.type === 'warning' && "bg-status-warning/10 text-status-warning border-status-warning/20",
                                  log.type === 'error' && "bg-status-error/10 text-status-error border-status-error/20",
                                  log.type === 'detection' && "bg-primary/10 text-primary border-primary/20",
                                )}
                              >
                                {log.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.deviceId}</TableCell>
                            <TableCell>{log.message}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No logs found matching the current filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                {filteredLogs.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNumber;
                        
                        // Logic to show relevant page numbers based on current page
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </SidebarProvider>
  );
};

export default LogsPage;
