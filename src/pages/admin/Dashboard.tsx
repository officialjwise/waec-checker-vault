
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
import { adminApi, AdminStats, InventoryResponse, Order, LogEntry } from '@/services/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [inventory, setInventory] = useState<InventoryResponse>({ byWaecType: [], lowStock: [] });
  const [assignedCheckers, setAssignedCheckers] = useState<{[key: string]: number}>({});
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
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
      
      // Fetch multiple data sources
      const [inventoryData, ordersData, paidOrdersData, logsData] = await Promise.all([
        adminApi.getInventory(),
        adminApi.getOrders({ limit: 100 }),
        adminApi.getOrders({ payment_status: 'paid' }),
        adminApi.getLogs({ limit: 4 })
      ]);
      
      console.log('Dashboard data fetched:', { inventoryData, ordersData, paidOrdersData, logsData });
      
      setInventory(inventoryData);
      setTotalOrders(ordersData.length);
      setPaidOrders(paidOrdersData);
      setRecentLogs(logsData);

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

  // Calculate totals from inventory
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
      title: 'Active Orders',
      value: totalOrders.toLocaleString(),
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
      title: 'Total Revenue',
      value: `₵${totals.totalRevenue.toLocaleString()}`,
      subtitle: 'From paid orders',
      icon: DollarSign,
      color: 'purple' as const,
    }
  ];

  const formatLogActivity = (log: LogEntry) => {
    const action = log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let details = 'Activity performed';
    
    if (log.details) {
      if (typeof log.details === 'string') {
        details = log.details;
      } else if (typeof log.details === 'object') {
        details = Object.entries(log.details)
          .slice(0, 2)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
    }
    
    return { action, details };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
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
            {recentLogs.length > 0 ? (
              recentLogs.map((log, index) => {
                const { action, details } = formatLogActivity(log);
                const timeAgo = new Date(log.created_at).toLocaleDateString();
                
                return (
                  <div key={log.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{action}</p>
                      <p className="text-sm text-gray-500">{details}</p>
                      <p className="text-xs text-gray-400">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* WAEC Types Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">WAEC Types Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inventory.byWaecType.map((item) => {
            const assignedCount = assignedCheckers[item.waec_type] || 0;
            const waecRevenue = paidOrders
              .filter(order => order.waec_type === item.waec_type)
              .reduce((acc, order) => acc + (order.amount || (order.quantity * getPrice(item.waec_type))), 0);
            
            return (
              <div key={item.waec_type} className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">{item.waec_type}</h4>
                <p className="text-2xl font-bold text-blue-600 mt-2">{(item.available || 0).toLocaleString()}</p>
                <p className="text-sm text-blue-700">Available</p>
                <p className="text-xs text-blue-600 mt-1">₵{getPrice(item.waec_type)} per checker</p>
                <p className="text-xs text-purple-600 mt-1">Revenue: ₵{waecRevenue.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
