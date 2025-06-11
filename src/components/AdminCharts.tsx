
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Package } from 'lucide-react';

interface ChartData {
  waecType: string;
  revenue: number;
  orders: number;
  available: number;
  total: number;
}

interface AdminChartsProps {
  data: ChartData[];
}

const AdminCharts: React.FC<AdminChartsProps> = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const revenueData = data.map(item => ({
    name: item.waecType,
    revenue: item.revenue,
    orders: item.orders
  }));

  const inventoryData = data.map(item => ({
    name: item.waecType,
    available: item.available,
    total: item.total,
    assigned: item.total - item.available
  }));

  const pieData = data.map((item, index) => ({
    name: item.waecType,
    value: item.revenue,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue by WAEC Type</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Distribution Pie Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Distribution</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, 'Revenue']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Status Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="available" stackId="a" fill="#10B981" name="Available" />
            <Bar dataKey="assigned" stackId="a" fill="#F59E0B" name="Assigned" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Trend Line Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Orders by Type</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminCharts;
