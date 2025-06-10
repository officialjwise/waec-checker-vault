
import React from 'react';
import StatCard from '@/components/StatCard';
import { Archive, TrendingUp, Users, DollarSign } from 'lucide-react';

const Summary = () => {
  // Mock inventory data
  const inventoryData = {
    BECE: { total: 5000, sold: 1755, available: 3245 },
    WASSCE: { total: 8000, sold: 3108, available: 4892 },
    NOVDEC: { total: 1200, sold: 745, available: 455 }
  };

  const calculatePercentage = (sold: number, total: number) => {
    return ((sold / total) * 100).toFixed(1);
  };

  const totalStats = Object.values(inventoryData).reduce(
    (acc, curr) => ({
      total: acc.total + curr.total,
      sold: acc.sold + curr.sold,
      available: acc.available + curr.available
    }),
    { total: 0, sold: 0, available: 0 }
  );

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
          title="Sold Checkers"
          value={totalStats.sold.toLocaleString()}
          subtitle={`${calculatePercentage(totalStats.sold, totalStats.total)}% of total`}
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
          value="₵285,400"
          subtitle="Total earnings"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* WAEC Type Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">WAEC Types Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(inventoryData).map(([type, data]) => (
            <div key={type} className="border border-gray-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{type}</h3>
                <p className="text-sm text-gray-500">Checker Inventory</p>
              </div>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Sold</span>
                    <span>{calculatePercentage(data.sold, data.total)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${calculatePercentage(data.sold, data.total)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{data.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sold:</span>
                    <span className="font-medium text-green-600">{data.sold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium text-blue-600">{data.available.toLocaleString()}</span>
                  </div>
                </div>

                {/* Revenue Estimate */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Est. Revenue:</span>
                    <span className="font-medium text-purple-600">
                      ₵{(data.sold * (type === 'BECE' ? 50 : type === 'WASSCE' ? 75 : 60)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h3>
          <div className="space-y-3">
            {[
              { day: 'Today', sales: 45, change: '+12%' },
              { day: 'Yesterday', sales: 38, change: '+8%' },
              { day: '2 days ago', sales: 52, change: '+15%' },
              { day: '3 days ago', sales: 41, change: '+5%' },
              { day: '4 days ago', sales: 36, change: '-2%' },
              { day: '5 days ago', sales: 48, change: '+18%' },
              { day: '6 days ago', sales: 33, change: '-5%' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.day}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.sales} checkers</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.change.startsWith('+') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-yellow-900">NOVDEC Running Low</p>
                  <p className="text-sm text-yellow-700">Only 455 checkers remaining</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-green-900">WASSCE Well Stocked</p>
                  <p className="text-sm text-green-700">4,892 checkers available</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-blue-900">BECE Good Stock</p>
                  <p className="text-sm text-blue-700">3,245 checkers available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
