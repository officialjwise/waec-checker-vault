
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLogs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const logs = [
    {
      id: 1,
      timestamp: '2024-06-08 14:30:25',
      level: 'info',
      action: 'User Login',
      user: 'admin@example.com',
      details: 'Successful admin login from IP 192.168.1.100',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      timestamp: '2024-06-08 14:28:15',
      level: 'success',
      action: 'CSV Upload',
      user: 'admin@example.com',
      details: 'WAEC 2024 May/June results uploaded successfully - 15,420 records',
      ip: '192.168.1.100',
    },
    {
      id: 3,
      timestamp: '2024-06-08 14:25:33',
      level: 'warning',
      action: 'Failed Login Attempt',
      user: 'unknown@example.com',
      details: 'Failed login attempt with invalid credentials',
      ip: '203.0.113.45',
    },
    {
      id: 4,
      timestamp: '2024-06-08 14:20:12',
      level: 'info',
      action: 'User Registration',
      user: 'john.doe@example.com',
      details: 'New user account created',
      ip: '198.51.100.25',
    },
    {
      id: 5,
      timestamp: '2024-06-08 14:15:44',
      level: 'error',
      action: 'Database Error',
      user: 'system',
      details: 'Connection timeout while querying results database',
      ip: 'localhost',
    },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'info':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || log.level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                System Logs
              </h1>
              <p className="text-muted-foreground mt-2">Monitor system activities and security events</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Admin Activity Logs
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-0 bg-background/50"
                    />
                  </div>
                  <select 
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background/50 border-0"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="info">Info</option>
                  </select>
                  <Button variant="outline" className="bg-background/50 border-0">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" className="bg-background/50 border-0">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Timestamp</TableHead>
                      <TableHead className="font-semibold">Level</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Details</TableHead>
                      <TableHead className="font-semibold">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log, index) => (
                      <TableRow key={log.id} className={index % 2 === 0 ? 'bg-muted/10' : 'bg-background'}>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={`${getLevelColor(log.level)} flex items-center gap-1 w-fit`}>
                            {getLevelIcon(log.level)}
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell className="text-sm">{log.user}</TableCell>
                        <TableCell className="text-sm max-w-md truncate">{log.details}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
