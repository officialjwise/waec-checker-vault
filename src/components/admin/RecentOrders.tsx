
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp } from 'lucide-react';

const RecentOrders = () => {
  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      examNumber: 'WAEC123456',
      status: 'completed',
      amount: '₦2,000',
      date: '2024-06-08',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      examNumber: 'WAEC789012',
      status: 'pending',
      amount: '₦2,000',
      date: '2024-06-08',
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      examNumber: 'WAEC345678',
      status: 'failed',
      amount: '₦2,000',
      date: '2024-06-07',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Recent Orders
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Last 7 days activity</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50 hover:shadow-md transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-foreground">{order.customer}</div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{order.examNumber}</div>
                <div className="text-xs text-muted-foreground">{order.date}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground">{order.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
