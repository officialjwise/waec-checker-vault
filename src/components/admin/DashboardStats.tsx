
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Package, TrendingUp } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+5%',
      changeType: 'positive',
      icon: FileText,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Available Results',
      value: '45,678',
      change: '+234',
      changeType: 'positive',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Revenue',
      value: '₦1.2M',
      change: '+18%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
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
              <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
