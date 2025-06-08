
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
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+5%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      title: 'Available Results',
      value: '45,678',
      change: '+234',
      changeType: 'positive',
      icon: Package,
    },
    {
      title: 'Revenue',
      value: '₦1.2M',
      change: '+18%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-green-600 mt-1">
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
