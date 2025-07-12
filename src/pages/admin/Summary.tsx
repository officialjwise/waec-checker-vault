import React, { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import AdminCharts from '@/components/AdminCharts';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/shimmer';
import { Archive, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi, InventoryResponse, Order } from '@/services/adminApi';

const Summary = () => {
  const [inventory, setInventory] = useState<InventoryResponse>({ byWaecType: [], lowStock: [] });
  const [assignedCheckers, setAssignedCheckers] = useState<{[key: string]: number}>({});
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('=== STARTING DATA FETCH ===');
      console.log('Fetching summary data...');
      
      // Get all orders and inventory data
      const [inventoryData, allOrdersData] = await Promise.all([
        adminApi.getInventory(),
        adminApi.getOrders({}) // Get all orders
      ]);
      
      console.log('Summary data fetched:', inventoryData);
      console.log('=== ALL ORDERS ANALYSIS ===');
      console.log('Total orders fetched:', allOrdersData.length);
      console.log('All orders raw data:', allOrdersData);
      
      // Analyze order statuses
      const statusCount = allOrdersData.reduce((acc, order) => {
        const status = order.status || 'no_status';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as {[key: string]: number});
      
      console.log('Order status breakdown:', statusCount);
      
      // Analyze a few sample orders in detail
      console.log('=== SAMPLE ORDERS ANALYSIS ===');
      allOrdersData.slice(0, 5).forEach((order, index) => {
        console.log(`Sample Order ${index + 1}:`, {
          id: order.id,
          status: order.status,
          quantity: order.quantity,
          waec_type: order.waec_type,
          phone: order.phone,
          email: order.email,
          created_at: order.created_at,
          amount: order.amount,
          payment_status: order.payment_status,
          payment_reference: order.payment_reference,
          allFields: Object.keys(order)
        });
      });
      
      // Filter for paid orders - try multiple approaches
      console.log('=== FILTERING FOR PAID ORDERS ===');
      
      // Approach 1: status === 'paid'
      const paidByStatus = allOrdersData.filter(order => order.status === 'paid');
      console.log('Orders with status === "paid":', paidByStatus.length);
      
      // Approach 2: payment_status === 'paid' (if field exists)
      const paidByPaymentStatus = allOrdersData.filter(order => order.payment_status === 'paid');
      console.log('Orders with payment_status === "paid":', paidByPaymentStatus.length);
      
      // Approach 3: completed orders
      const completedOrders = allOrdersData.filter(order => order.status === 'completed');
      console.log('Orders with status === "completed":', completedOrders.length);
      
      // Approach 4: orders with payment_reference (indicating payment was made)
      const ordersWithPaymentRef = allOrdersData.filter(order => order.payment_reference && order.payment_reference.trim() !== '');
      console.log('Orders with payment_reference:', ordersWithPaymentRef.length);
      
      // Use the most appropriate filtering approach
      let filteredPaidOrders: Order[];
      
      if (paidByStatus.length > 0) {
        console.log('Using status === "paid" filter');
        filteredPaidOrders = paidByStatus;
      } else if (completedOrders.length > 0) {
        console.log('Using status === "completed" filter (no paid status found)');
        filteredPaidOrders = completedOrders;
      } else if (ordersWithPaymentRef.length > 0) {
        console.log('Using payment_reference filter (no status-based filter worked)');
        filteredPaidOrders = ordersWithPaymentRef;
      } else {
        console.log('No clear paid orders found, using all orders for calculation');
        filteredPaidOrders = allOrdersData;
      }
      
      console.log('Final filtered paid orders count:', filteredPaidOrders.length);
      console.log('Sample filtered orders:', filteredPaidOrders.slice(0, 3));
      
      setInventory(inventoryData);
      setPaidOrders(filteredPaidOrders);

      // Fetch assigned checkers for each WAEC type - updated to include CTVET
      const assignedCheckersData: {[key: string]: number} = {};
      const waecTypes = ['WASSCE', 'BECE', 'NOVDEC', 'CSSPS', 'CTVET'];
      
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
      console.error('Error fetching summary data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (assigned: number, total: number) => {
    if (total === 0) return '0.0';
    return ((assigned / total) * 100).toFixed(1);
  };

  const totalStats = inventory.byWaecType.reduce(
    (acc, curr) => ({
      total: acc.total + (curr.total || 0),
      assigned: acc.assigned + (assignedCheckers[curr.waec_type] || 0),
      available: acc.available + (curr.available || 0)
    }),
    { total: 0, assigned: 0, available: 0 }
  );

  // Updated tiered pricing calculation
  const getPrice = (quantity: number) => {
    if (quantity >= 50) return 15.0;
    if (quantity >= 20) return 16.0;
    if (quantity >= 10) return 16.5;
    return 17.5; // 1-9 checkers
  };

  // Calculate revenue for an order using tiered pricing
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
    
    // Use tiered pricing calculation
    const quantity = Number(order.quantity) || 0;
    const price = getPrice(quantity);
    const calculatedRevenue = quantity * price;
    console.log(`Calculated from quantity × tiered price: ${quantity} × ${price} = ${calculatedRevenue}`);
    return calculatedRevenue;
  };

  // Calculate total revenue from ONLY paid orders
  console.log('=== STARTING REVENUE CALCULATION ===');
  console.log('paidOrders array length:', paidOrders.length);
  console.log('paidOrders sample:', paidOrders.slice(0, 2));
  
  const totalRevenue = paidOrders.reduce((acc, order, index) => {
    const orderRevenue = calculateOrderRevenue(order);
    const newTotal = acc + orderRevenue;
    console.log(`Order ${index + 1}/${paidOrders.length} - ID: ${order.id}, Revenue: ${orderRevenue}, Running total: ${newTotal}`);
    return newTotal;
  }, 0);

  console.log('=== FINAL REVENUE CALCULATION ===');
  console.log('Total revenue calculated:', totalRevenue);
  console.log('Number of paid orders processed:', paidOrders.length);
  console.log('Revenue breakdown by order:', paidOrders.map(order => ({
    id: order.id,
    quantity: order.quantity,
    waec_type: order.waec_type,
    status: order.status,
    calculated: calculateOrderRevenue(order)
  })));
  console.log('===================================');

  // Prepare chart data - only use paid orders for revenue calculation
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
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white animate-pulse">
          <div className="h-8 w-64 bg-white/20 rounded mb-2"></div>
          <div className="h-4 w-96 bg-white/10 rounded"></div>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <BarChart3 className="h-6 w-6 mr-3" />
          Analytics Summary
        </h1>
        <p className="text-green-100">Comprehensive overview of your WAEC checker business performance.</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Checkers"
          value={totalStats.total.toLocaleString()}
          subtitle="All WAEC types"
          icon={Archive}
          color="blue"
        />
        <StatCard
          title="Assigned Checkers"
          value={totalStats.assigned.toLocaleString()}
          subtitle={`${calculatePercentage(totalStats.assigned, totalStats.total)}% of total`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Available"
          value={totalStats.available.toLocaleString()}
          subtitle="Ready for assignment"
          icon={Users}
          color="yellow"
        />
        <StatCard
          title="Total Revenue"
          value={`₵${totalRevenue.toLocaleString()}`}
          subtitle={`From ${paidOrders.length} paid orders`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
        <AdminCharts data={chartData} />
      </div>

      {/* WAEC Type Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">WAEC Types Detailed Breakdown</h2>
        
        {inventory.byWaecType.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No inventory data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inventory.byWaecType.map((item) => {
              const assignedCount = assignedCheckers[item.waec_type] || 0;
              const waecOrders = paidOrders.filter(order => order.waec_type === item.waec_type);
              const waecRevenue = waecOrders.reduce((acc, order) => acc + calculateOrderRevenue(order), 0);
              
              return (
                <div key={item.waec_type} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.waec_type}</h3>
                    <p className="text-sm text-gray-500">Checker Inventory</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Assigned</span>
                        <span>{calculatePercentage(assignedCount, item.total)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${calculatePercentage(assignedCount, item.total)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{item.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assigned:</span>
                        <span className="font-medium text-green-600">{assignedCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium text-blue-600">{item.available.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium text-purple-600">
                          ₵{waecRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Orders:</span>
                        <span>{waecOrders.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
