
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import { 
  Archive, 
  List, 
  Upload, 
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi, AdminStats, InventoryItem } from '@/services/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      // Fetch both stats and inventory
      const [statsData, inventoryData] = await Promise.all([
        adminApi.getAdminStats(),
        adminApi.getInventory()
      ]);
      
      console.log('Stats data:', statsData);
      console.log('Inventory data:', inventoryData);
      
      setStats(statsData);
      setInventory(inventoryData);
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

  // Calculate totals from inventory if stats are not available
  const calculateTotals = () => {
    if (!inventory || inventory.length === 0) {
      return {
        totalCheckers: 0,
        availableCheckers: 0,
        assignedCheckers: 0,
        totalRevenue: 0
      };
    }

    return inventory.reduce((acc, item) => ({
      totalCheckers: acc.totalCheckers + (item.total || 0),
      availableCheckers: acc.availableCheckers + (item.available || 0),
      assignedCheckers: acc.assignedCheckers + (item.assigned || 0),
      totalRevenue: acc.totalRevenue + (item.assigned || 0) * getPrice(item.waec_type)
    }), {
      totalCheckers: 0,
      availableCheckers: 0,
      assignedCheckers: 0,
      totalRevenue: 0
    });
  };

  const getPrice = (waecType: string) => {
    switch (waecType) {
      case 'BECE': return 50;
      case 'WASSCE': return 75;
      case 'NOVDEC': return 60;
      default: return 65;
    }
  };

  const totals = calculateTotals();

  const dashboardStats = [
    {
      title: 'Total Checkers',
      value: (stats?.total_checkers || totals.totalCheckers).toLocaleString(),
      subtitle: 'All WAEC types',
      icon: Archive,
      color: 'blue' as const,
    },
    {
      title: 'Active Orders',
      value: (stats?.total_orders || 0).toLocaleString(),
      subtitle: 'All orders',
      icon: List,
      color: 'green' as const,
    },
    {
      title: 'Available Checkers',
      value: totals.availableCheckers.toLocaleString(),
      subtitle: 'Ready for assignment',
      icon: Upload,
      color: 'yellow' as const
    },
    {
      title: 'Revenue',
      value: `₵${(stats?.total_revenue || totals.totalRevenue).toLocaleString()}`,
      subtitle: 'From checker sales',
      icon: DollarSign,
      color: 'purple' as const,
    }
  ];

  const recentActivity = [
    { action: 'CSV Upload', time: '2 hours ago', details: '500 WASSCE checkers added' },
    { action: 'Order Completed', time: '4 hours ago', details: 'Order #1234 - 10 BECE checkers' },
    { action: 'Bulk Assignment', time: '6 hours ago', details: '50 checkers assigned to Order #1233' },
    { action: 'CSV Upload', time: '1 day ago', details: '300 NOVDEC checkers added' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/admin/upload-checkers" className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Upload className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Upload New Checkers</span>
              </div>
              <span className="text-blue-600">→</span>
            </Link>
            
            <Link to="/admin/orders" className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <List className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">View All Orders</span>
              </div>
              <span className="text-green-600">→</span>
            </Link>
            
            <Link to="/admin/summary" className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">View Analytics</span>
              </div>
              <span className="text-purple-600">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WAEC Types Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">WAEC Types Overview</h3>
        {inventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <div key={item.waec_type} className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">{item.waec_type}</h4>
                <p className="text-2xl font-bold text-blue-600 mt-2">{(item.available || 0).toLocaleString()}</p>
                <p className="text-sm text-blue-700">Available</p>
                <p className="text-xs text-blue-600 mt-1">₵{getPrice(item.waec_type)} per checker</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">BECE</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">Loading...</p>
              <p className="text-sm text-blue-700">Available</p>
              <p className="text-xs text-blue-600 mt-1">₵50 per checker</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">WASSCE</h4>
              <p className="text-2xl font-bold text-green-600 mt-2">Loading...</p>
              <p className="text-sm text-green-700">Available</p>
              <p className="text-xs text-green-600 mt-1">₵75 per checker</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">NOVDEC</h4>
              <p className="text-2xl font-bold text-purple-600 mt-2">Loading...</p>
              <p className="text-sm text-purple-700">Available</p>
              <p className="text-xs text-purple-600 mt-1">₵60 per checker</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
