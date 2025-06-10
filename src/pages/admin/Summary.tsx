
import React, { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import { Archive, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi, InventoryItem } from '@/services/adminApi';

const Summary = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log('Fetching inventory data...');
      const data = await adminApi.getInventory();
      console.log('Inventory data fetched:', data);
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
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

  const totalStats = inventory.reduce(
    (acc, curr) => ({
      total: acc.total + curr.total,
      assigned: acc.assigned + curr.assigned,
      available: acc.available + curr.available
    }),
    { total: 0, assigned: 0, available: 0 }
  );

  // Calculate estimated revenue based on WAEC type pricing
  const getPrice = (waecType: string) => {
    switch (waecType) {
      case 'BECE': return 50;
      case 'WASSCE': return 75;
      case 'NOVDEC': return 60;
      default: return 65;
    }
  };

  const totalRevenue = inventory.reduce((acc, item) => {
    return acc + (item.assigned * getPrice(item.waec_type));
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          title="Revenue"
          value={`₵${totalRevenue.toLocaleString()}`}
          subtitle="Total earnings"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* WAEC Type Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">WAEC Types Breakdown</h2>
        
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No inventory data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <div key={item.waec_type} className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.waec_type}</h3>
                  <p className="text-sm text-gray-500">Checker Inventory</p>
                </div>
                
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Assigned</span>
                      <span>{calculatePercentage(item.assigned, item.total)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${calculatePercentage(item.assigned, item.total)}%` }}
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
                      <span className="font-medium text-green-600">{item.assigned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium text-blue-600">{item.available.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Revenue Estimate */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Est. Revenue:</span>
                      <span className="font-medium text-purple-600">
                        ₵{(item.assigned * getPrice(item.waec_type)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
        <div className="space-y-4">
          {inventory.map((item) => {
            const availablePercent = (item.available / item.total) * 100;
            let alertType = 'good';
            let alertColor = 'green';
            let alertMessage = 'Well Stocked';
            
            if (availablePercent < 10) {
              alertType = 'critical';
              alertColor = 'red';
              alertMessage = 'Critical Low Stock';
            } else if (availablePercent < 30) {
              alertType = 'warning';
              alertColor = 'yellow';
              alertMessage = 'Running Low';
            }
            
            return (
              <div key={item.waec_type} className={`bg-${alertColor}-50 border border-${alertColor}-200 rounded-lg p-4`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 bg-${alertColor}-500 rounded-full mr-3`}></div>
                  <div>
                    <p className={`font-medium text-${alertColor}-900`}>
                      {item.waec_type} {alertMessage}
                    </p>
                    <p className={`text-sm text-${alertColor}-700`}>
                      {item.available.toLocaleString()} checkers available ({availablePercent.toFixed(1)}% of total)
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Summary;
