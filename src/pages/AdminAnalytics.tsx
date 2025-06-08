
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, FileText, Calendar, Download } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  const analyticsData = [
    {
      title: 'Total Searches',
      value: '4,892',
      change: '+12.5%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Success Rate',
      value: '89.2%',
      change: '+3.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Active Users',
      value: '1,249',
      change: '+8.3%',
      changeType: 'positive',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Failed Searches',
      value: '528',
      change: '-5.2%',
      changeType: 'negative',
      icon: FileText,
      color: 'from-red-500 to-red-600',
    },
  ];

  const recentActivity = [
    { time: '2 minutes ago', event: 'New user registration', user: 'john@example.com' },
    { time: '5 minutes ago', event: 'Result search completed', user: 'jane@example.com' },
    { time: '12 minutes ago', event: 'CSV upload completed', user: 'Admin' },
    { time: '18 minutes ago', event: 'Payment processed', user: 'mike@example.com' },
    { time: '25 minutes ago', event: 'Result search failed', user: 'sarah@example.com' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-2">Monitor platform performance and user behavior</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTimeRange('7d')} className={timeRange === '7d' ? 'bg-primary text-primary-foreground' : ''}>
                    7 Days
                  </Button>
                  <Button variant="outline" onClick={() => setTimeRange('30d')} className={timeRange === '30d' ? 'bg-primary text-primary-foreground' : ''}>
                    30 Days
                  </Button>
                  <Button variant="outline" onClick={() => setTimeRange('90d')} className={timeRange === '90d' ? 'bg-primary text-primary-foreground' : ''}>
                    90 Days
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {analyticsData.map((stat) => (
                <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
                          : 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">from last period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.event}</div>
                          <div className="text-xs text-muted-foreground">{activity.user}</div>
                          <div className="text-xs text-muted-foreground">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Export Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                    <Download className="h-4 w-4 mr-2" />
                    User Analytics Report
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0">
                    <Download className="h-4 w-4 mr-2" />
                    Search Performance Report
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0">
                    <Download className="h-4 w-4 mr-2" />
                    Revenue Analytics
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">
                    <Download className="h-4 w-4 mr-2" />
                    System Health Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
