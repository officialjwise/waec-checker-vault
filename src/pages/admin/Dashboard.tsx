
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import AdminCharts from '@/components/AdminCharts';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/shimmer';
import { 
  Archive, 
  List, 
  Upload, 
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi, InventoryResponse, Order } from '@/services/adminApi';

const Dashboard = () => {
  const [inventory, setInventory] = useState<InventoryResponse>({ byWaecType: [], lowStock: [] });
  const [assignedCheckers, setAssignedCheckers] = useState<{[key: string]: number}>({});
  const [totalOrders, setTotalOrders] = useState(0);
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const [inventoryData, ordersData, paidOrdersData] = await Promise.all([
        adminApi.getInventory(),
        adminApi.getOrders({ limit: 100 }),
        adminApi.getOrders({ payment_status: 'paid' })
      ]);
      
      console.log('Dashboard data fetched:', { inventoryData, ordersData, paidOrdersData });
      
      setInventory(inventoryData);
      setTotalOrders(ordersData.length);
      setPaidOrders(paidOrdersData);

      // Fetch assigned checkers for each WAEC type
      const assignedCheckersData: {[key: string]: number} = {};
      const waecTypes = ['WASSCE', 'BECE', 'NOVDEC'];
      
      for (const waecType of waecTypes) {
        try {
          const assigned = await adminApi.getCheckersByType(waecType, true);
          assignedCheckersData[waecType] = assigned.length;
        } catch (error) {
          console.error(`Error fetching assigned checkers for ${waecType}:`, error);
          assignedCheckersData[waecType] = 0;
        }
      }
      
      setAssignedCheckers(assignedCheckersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (waecType: string) => {
    switch (waecType) {
      case 'BECE': return 50;
      case 'WASSCE': return 75;
      case 'NOVDEC': return 60;
      default: return 65;
    }
  };

  const calculateTotals = () => {
    const totalCheckers = inventory.byWaecType.reduce((acc, item) => acc + (item.total || 0), 0);
    const availableCheckers = inventory.byWaecType.reduce((acc, item) => acc + (item.available || 0), 0);
    const totalAssigned = Object.values(assignedCheckers).reduce((acc, count) => acc + count, 0);
    const totalRevenue = paidOrders.reduce((acc, order) => acc + (order.amount || (order.quantity * getPrice(order.waec_type))), 0);

    return {
      totalCheckers,
      availableCheckers,
      assignedCheckers: totalAssigned,
      totalRevenue
    };
  };

  const totals = calculateTotals();

  const dashboardStats = [
    {
      title: 'Total Checkers',
      value: totals.totalCheckers.toLocaleString(),
      subtitle: 'All WAEC types',
      icon: Archive,
      color: 'blue' as const,
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      subtitle: 'All time',
      icon: List,
      color: 'green' as const,
    },
    {
      title: 'Available Checkers',
      value: totals.availableCheckers.toLocaleString(),
      subtitle: 'Ready for assignment',
      icon: Users,
      color: 'yellow' as const
    },
    {
      title: 'Total Revenue',
      value: `₵${totals.totalRevenue.toLocaleString()}`,
      subtitle: 'From paid orders',
      icon: DollarSign,
      color: 'purple' as const,
    }
  ];

  // Prepare chart data
  const chartData = inventory.byWaecType.map((item) => {
    const assignedCount = assignedCheckers[item.waec_type] || 0;
    const waecRevenue = paidOrders
      .filter(order => order.waec_type === item.waec_type)
      .reduce((acc, order) => acc + (order.amount || (order.quantity * getPrice(item.waec_type))), 0);
    const waecOrders = paidOrders.filter(order => order.waec_type === item.waec_type).length;
    
    return {
      waecType: item.waec_type,
      revenue: waecRevenue,
      orders: waecOrders,
      available: item.available || 0,
      total: item.total || 0,
    };
  });

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">Welcome back! Here's what's happening with your WAEC checker business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Real-time data</span>
          </div>
        </div>
        
        <AdminCharts data={chartData} />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link to="/admin/upload-checkers" className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <div className="text-center">
                <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-900">Upload Checkers</span>
              </div>
            </Link>
            
            <Link to="/admin/orders" className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <div className="text-center">
                <List className="h-6 w-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-900">View Orders</span>
              </div>
            </Link>
            
            <Link to="/admin/summary" className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-900">Analytics</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Stock Alerts
          </h3>
          <div className="space-y-3">
            {inventory.byWaecType.map((item) => {
              const availablePercent = ((item.available || 0) / (item.total || 1)) * 100;
              let alertColor = 'green';
              let alertMessage = 'Well Stocked';
              
              if (availablePercent < 10) {
                alertColor = 'red';
                alertMessage = 'Critical Low';
              } else if (availablePercent < 30) {
                alertColor = 'yellow';
                alertMessage = 'Running Low';
              }
              
              return (
                <div key={item.waec_type} className={`p-3 rounded-lg border-l-4 ${
                  alertColor === 'red' ? 'bg-red-50 border-red-400' :
                  alertColor === 'yellow' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-green-50 border-green-400'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.waec_type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alertColor === 'red' ? 'bg-red-100 text-red-800' :
                      alertColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alertMessage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {(item.available || 0).toLocaleString()} available ({availablePercent.toFixed(1)}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
