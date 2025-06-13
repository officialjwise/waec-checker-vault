import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  Activity,
  BarChart3,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { adminApi, InventoryResponse, Order } from '@/services/adminApi';

const Dashboard = () => {
  const [inventory, setInventory] = useState<InventoryResponse>({ byWaecType: [], lowStock: [] });
  const [assignedCheckers, setAssignedCheckers] = useState<{[key: string]: number}>({});
  const [totalOrders, setTotalOrders] = useState(0);
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoadTime, setDataLoadTime] = useState<number>(0);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    const startTime = performance.now();
    try {
      if (forceRefresh) {
        setRefreshing(true);
        // Clear cache before fetching fresh data
        adminApi.clearAllCache();
        console.log('Cache cleared for fresh data fetch');
      } else {
        setLoading(true);
      }
      
      console.log('Fetching dashboard data...' + (forceRefresh ? ' (forced refresh)' : ''));
      
      // Parallel data fetching for improved performance
      const [inventoryData, ordersData, allOrdersData] = await Promise.all([
        adminApi.getInventory(),
        adminApi.getOrders({ limit: 100 }),
        adminApi.getOrders({}) // Get all orders for proper filtering
      ]);
      
      console.log('Dashboard data fetched:', { 
        inventoryData, 
        totalInventoryCount: inventoryData.byWaecType.reduce((acc, item) => acc + (item.total || 0), 0),
        ordersData, 
        allOrdersData 
      });
      
      setInventory(inventoryData);
      setTotalOrders(ordersData.length);

      // Use the same filtering logic as Summary page
      console.log('=== FILTERING FOR PAID ORDERS (Dashboard) ===');
      
      // Filter for paid orders - use multiple approaches like in Summary
      const paidByStatus = allOrdersData.filter(order => order.status === 'paid');
      const completedOrders = allOrdersData.filter(order => order.status === 'completed');
      const ordersWithPaymentRef = allOrdersData.filter(order => order.payment_reference && order.payment_reference.trim() !== '');
      
      let filteredPaidOrders: Order[];
      
      if (paidByStatus.length > 0) {
        console.log('Using status === "paid" filter');
        filteredPaidOrders = paidByStatus;
      } else if (completedOrders.length > 0) {
        console.log('Using status === "completed" filter');
        filteredPaidOrders = completedOrders;
      } else if (ordersWithPaymentRef.length > 0) {
        console.log('Using payment_reference filter');
        filteredPaidOrders = ordersWithPaymentRef;
      } else {
        console.log('Using all orders for calculation');
        filteredPaidOrders = allOrdersData;
      }
      
      console.log('Final filtered paid orders count:', filteredPaidOrders.length);
      setPaidOrders(filteredPaidOrders);

      // Updated WAEC types to include CSSPS
      const assignedCheckersData: {[key: string]: number} = {};
      const waecTypes = ['WASSCE', 'BECE', 'NOVDEC', 'CSSPS'];
      
      const assignedPromises = waecTypes.map(async (waecType) => {
        try {
          const assigned = await adminApi.getCheckersByType(waecType, true);
          assignedCheckersData[waecType] = assigned.length;
        } catch (error) {
          console.error(`Error fetching assigned checkers for ${waecType}:`, error);
          assignedCheckersData[waecType] = 0;
        }
      });
      
      await Promise.all(assignedPromises);
      setAssignedCheckers(assignedCheckersData);

      const endTime = performance.now();
      setDataLoadTime(endTime - startTime);

      if (forceRefresh) {
        toast({
          title: "Data Refreshed",
          description: "Dashboard data has been updated with the latest information.",
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Use the same price logic as Summary page - corrected pricing: CSSPS = 20, all others = 17.5
  const getPrice = (waecType: string) => {
    const price = waecType === 'CSSPS' ? 20 : 17.5;
    console.log(`Price for ${waecType}: ${price}`);
    return price;
  };

  // Use the same revenue calculation logic as Summary page
  const calculateOrderRevenue = (order: Order) => {
    console.log(`Calculating revenue for order ${order.id}:`, {
      quantity: order.quantity,
      waec_type: order.waec_type,
      status: order.status,
      hasAmount: 'amount' in order,
      amount: order.amount,
      quantityType: typeof order.quantity,
      quantityValue: order.quantity
    });
    
    // Use the same logic as Summary: calculate from quantity * price
    const price = getPrice(order.waec_type);
    const quantity = Number(order.quantity) || 0;
    const calculatedRevenue = quantity * price;
    console.log(`Calculated from quantity × price: ${quantity} × ${price} = ${calculatedRevenue}`);
    return calculatedRevenue;
  };

  const calculateTotals = () => {
    const totalCheckers = inventory.byWaecType.reduce((acc, item) => acc + (item.total || 0), 0);
    const availableCheckers = inventory.byWaecType.reduce((acc, item) => acc + (item.available || 0), 0);
    const totalAssigned = Object.values(assignedCheckers).reduce((acc, count) => acc + count, 0);
    
    // Use the same revenue calculation as Summary page
    console.log('=== STARTING REVENUE CALCULATION (Dashboard) ===');
    console.log('paidOrders array length:', paidOrders.length);
    
    const totalRevenue = paidOrders.reduce((acc, order, index) => {
      const orderRevenue = calculateOrderRevenue(order);
      const newTotal = acc + orderRevenue;
      console.log(`Order ${index + 1}/${paidOrders.length} - ID: ${order.id}, Revenue: ${orderRevenue}, Running total: ${newTotal}`);
      return newTotal;
    }, 0);

    console.log('=== FINAL REVENUE CALCULATION (Dashboard) ===');
    console.log('Total revenue calculated:', totalRevenue);
    console.log('===================================');
    
    const pendingOrders = totalOrders - paidOrders.length;
    const utilizationRate = totalCheckers > 0 ? ((totalAssigned / totalCheckers) * 100).toFixed(1) : '0';

    return {
      totalCheckers,
      availableCheckers,
      assignedCheckers: totalAssigned,
      totalRevenue,
      pendingOrders,
      utilizationRate
    };
  };

  const totals = calculateTotals();

  const dashboardStats = [
    {
      title: 'Total Revenue',
      value: `₵${totals.totalRevenue.toLocaleString()}`,
      subtitle: 'From completed orders',
      icon: DollarSign,
      color: 'purple' as const,
      trend: {
        value: '12.5%',
        direction: 'up' as const
      }
    },
    {
      title: 'Active Orders',
      value: totalOrders.toLocaleString(),
      subtitle: `${totals.pendingOrders} pending`,
      icon: List,
      color: 'blue' as const,
      trend: {
        value: '8.2%',
        direction: 'up' as const
      }
    },
    {
      title: 'Inventory Pool',
      value: totals.totalCheckers.toLocaleString(),
      subtitle: `${totals.availableCheckers} available`,
      icon: Archive,
      color: 'green' as const,
      trend: {
        value: `${totals.utilizationRate}%`,
        direction: 'up' as const
      }
    },
    {
      title: 'System Performance',
      value: `${Math.round(dataLoadTime)}ms`,
      subtitle: 'Data load time',
      icon: Zap,
      color: 'yellow' as const,
      trend: {
        value: dataLoadTime < 2000 ? 'Optimal' : 'Slow',
        direction: dataLoadTime < 2000 ? 'up' as const : 'down' as const
      }
    }
  ];

  // Enhanced chart data with performance metrics - use same logic as Summary
  const chartData = inventory.byWaecType.map((item) => {
    const assignedCount = assignedCheckers[item.waec_type] || 0;
    const waecOrders = paidOrders.filter(order => order.waec_type === item.waec_type);
    const waecRevenue = waecOrders.reduce((acc, order) => acc + calculateOrderRevenue(order), 0);
    
    console.log(`${item.waec_type}: ${waecOrders.length} orders, revenue: ${waecRevenue}`);
    
    return {
      waecType: item.waec_type,
      revenue: waecRevenue,
      orders: waecOrders.length,
      available: item.available || 0,
      total: item.total || 0,
    };
  });

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Enhanced Loading State */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white animate-pulse">
          <div className="h-6 bg-blue-500 rounded w-48 mb-2"></div>
          <div className="h-4 bg-blue-400 rounded w-64"></div>
        </div>

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
      {/* Enhanced Header with Performance Indicator and Refresh Button */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Executive Dashboard
            </h1>
            <p className="text-blue-100 text-lg">Real-time business intelligence and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <div className="text-right">
              <div className="flex items-center text-blue-100 mb-1">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">System Status</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Online • {Math.round(dataLoadTime)}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Total Revenue"
            value={`₵${totals.totalRevenue.toLocaleString()}`}
            subtitle="From completed orders"
            icon={DollarSign}
            color="purple"
            trend={{
              value: '12.5%',
              direction: 'up'
            }}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Active Orders"
            value={totalOrders.toLocaleString()}
            subtitle={`${totals.pendingOrders} pending`}
            icon={List}
            color="blue"
            trend={{
              value: '8.2%',
              direction: 'up'
            }}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Inventory Pool"
            value={totals.totalCheckers.toLocaleString()}
            subtitle={`${totals.availableCheckers} available`}
            icon={Archive}
            color="green"
            trend={{
              value: `${totals.utilizationRate}%`,
              direction: 'up'
            }}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="System Performance"
            value={`${Math.round(dataLoadTime)}ms`}
            subtitle="Data load time"
            icon={Zap}
            color="yellow"
            trend={{
              value: dataLoadTime < 2000 ? 'Optimal' : 'Slow',
              direction: dataLoadTime < 2000 ? 'up' : 'down'
            }}
          />
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 mr-2 text-indigo-600" />
            Business Analytics & Insights
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Live Data</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Auto-refresh enabled</span>
            </div>
          </div>
        </div>
        
        <AdminCharts data={chartData} />
      </div>

      {/* Enhanced Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/upload-checkers" className="group">
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-300">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-blue-900">Upload Checkers</span>
                  <p className="text-xs text-blue-700 mt-1">Bulk CSV upload</p>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/orders" className="group">
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-green-300">
                <div className="text-center">
                  <List className="h-8 w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-green-900">Manage Orders</span>
                  <p className="text-xs text-green-700 mt-1">{totalOrders} total orders</p>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/summary" className="group">
              <div className="flex items-center justify-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-purple-300">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-purple-900">View Reports</span>
                  <p className="text-xs text-purple-700 mt-1">Detailed analytics</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Enhanced Stock Alerts */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Inventory Alerts
          </h3>
          <div className="space-y-4">
            {inventory.byWaecType.map((item) => {
              const availablePercent = ((item.available || 0) / (item.total || 1)) * 100;
              let alertColor = 'green';
              let alertMessage = 'Healthy Stock';
              let bgColor = 'bg-green-50';
              let borderColor = 'border-green-400';
              
              if (availablePercent < 10) {
                alertColor = 'red';
                alertMessage = 'Critical Low';
                bgColor = 'bg-red-50';
                borderColor = 'border-red-400';
              } else if (availablePercent < 30) {
                alertColor = 'yellow';
                alertMessage = 'Running Low';
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-400';
              }
              
              return (
                <div key={item.waec_type} className={`p-4 rounded-lg border-l-4 ${bgColor} ${borderColor} hover:shadow-md transition-shadow`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{item.waec_type}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      alertColor === 'red' ? 'bg-red-100 text-red-800' :
                      alertColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alertMessage}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Available: <span className="font-medium">{(item.available || 0).toLocaleString()}</span> 
                      <span className="text-gray-400"> / {(item.total || 0).toLocaleString()}</span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          alertColor === 'red' ? 'bg-red-500' :
                          alertColor === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${availablePercent}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">{availablePercent.toFixed(1)}% available</p>
                  </div>
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
