
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">{order.customer}</div>
                <div className="text-sm text-muted-foreground">{order.examNumber}</div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                <div className="text-sm font-medium mt-1">{order.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
