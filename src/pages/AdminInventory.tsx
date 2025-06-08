
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Plus, Edit, Trash2, Package } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminInventory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const inventory = [
    {
      id: 'INV-001',
      examType: 'SSCE',
      year: '2024',
      session: 'May/June',
      totalResults: 15420,
      availableResults: 15420,
      status: 'active',
      lastUpdated: '2024-06-08 10:30',
    },
    {
      id: 'INV-002',
      examType: 'GCE',
      year: '2024',
      session: 'Nov/Dec',
      totalResults: 8965,
      availableResults: 8965,
      status: 'active',
      lastUpdated: '2024-06-07 14:15',
    },
    {
      id: 'INV-003',
      examType: 'SSCE',
      year: '2023',
      session: 'May/June',
      totalResults: 12580,
      availableResults: 12580,
      status: 'archived',
      lastUpdated: '2024-05-15 09:20',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-muted-foreground mt-2">Manage WAEC result datasets and availability</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Result Inventory
                  </span>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Dataset
                  </Button>
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-0 bg-background/50"
                    />
                  </div>
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
                      <TableHead className="font-semibold">Dataset ID</TableHead>
                      <TableHead className="font-semibold">Exam Type</TableHead>
                      <TableHead className="font-semibold">Year & Session</TableHead>
                      <TableHead className="font-semibold">Total Results</TableHead>
                      <TableHead className="font-semibold">Available</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Last Updated</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item, index) => (
                      <TableRow key={item.id} className={index % 2 === 0 ? 'bg-muted/10' : 'bg-background'}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.examType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.year}</div>
                            <div className="text-sm text-muted-foreground">{item.session}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.totalResults.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{item.availableResults.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.lastUpdated}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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

export default AdminInventory;
