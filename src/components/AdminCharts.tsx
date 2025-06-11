
import React, { useState } from 'react';
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
import { TrendingUp, DollarSign, Package, BarChart3, Eye, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const revenueData = data.map(item => ({
    name: item.waecType,
    revenue: item.revenue,
    orders: item.orders
  }));

  const inventoryData = data.map(item => ({
    name: item.waecType,
    available: item.available,
    total: item.total,
    assigned: item.total - item.available,
    utilizationRate: item.total > 0 ? ((item.total - item.available) / item.total * 100).toFixed(1) : 0
  }));

  const pieData = data.map((item, index) => ({
    name: item.waecType,
    value: item.revenue,
    color: COLORS[index % COLORS.length],
    percentage: data.reduce((sum, d) => sum + d.revenue, 0) > 0 ? 
      ((item.revenue / data.reduce((sum, d) => sum + d.revenue, 0)) * 100).toFixed(1) : 0
  }));

  const performanceData = data.map(item => ({
    name: item.waecType,
    efficiency: item.total > 0 ? ((item.total - item.available) / item.total * 100) : 0,
    profitability: item.orders > 0 ? (item.revenue / item.orders) : 0,
    demand: item.orders
  }));

  const ChartDetailModal = ({ chartType, data: chartData }: { chartType: string, data: any[] }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          {chartType} - Detailed Analysis
        </DialogTitle>
        <DialogDescription>
          Comprehensive breakdown and insights for {chartType.toLowerCase()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-900 mb-2">{item.name || item.waecType}</h4>
              <div className="space-y-2 text-sm">
                {chartType === 'Revenue Analysis' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">₵{item.revenue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium">{item.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Order Value:</span>
                      <span className="font-medium">₵{item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : '0'}</span>
                    </div>
                  </>
                )}
                {chartType === 'Inventory Status' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{item.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium text-green-600">{item.available}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned:</span>
                      <span className="font-medium text-orange-600">{item.assigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization:</span>
                      <span className="font-medium">{item.utilizationRate}%</span>
                    </div>
                  </>
                )}
                {chartType === 'Revenue Distribution' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium">₵{item.value?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Share:</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Revenue Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analysis</h3>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <ChartDetailModal chartType="Revenue Analysis" data={revenueData} />
          </Dialog>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `₵${value.toLocaleString()}` : value, 
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Revenue Distribution Pie Chart */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue Distribution</h3>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <ChartDetailModal chartType="Revenue Distribution" data={pieData} />
          </Dialog>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, 'Revenue']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Inventory Status Chart */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <ChartDetailModal chartType="Inventory Status" data={inventoryData} />
          </Dialog>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'available' ? 'Available' : 'Assigned']}
              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="available" stackId="a" fill="#10B981" name="Available" radius={[0, 0, 0, 0]} />
            <Bar dataKey="assigned" stackId="a" fill="#F59E0B" name="Assigned" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* New Performance Analytics Chart */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ArrowUpDown className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <ChartDetailModal chartType="Performance Analytics" data={performanceData} />
          </Dialog>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'efficiency' ? `${value.toFixed(1)}%` : 
                name === 'profitability' ? `₵${value.toFixed(2)}` : value,
                name === 'efficiency' ? 'Utilization Rate' :
                name === 'profitability' ? 'Avg Revenue/Order' : 'Total Orders'
              ]}
              contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            />
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ fill: '#6366F1', strokeWidth: 2, r: 5 }}
              name="Utilization Rate"
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#EC4899" 
              strokeWidth={3}
              dot={{ fill: '#EC4899', strokeWidth: 2, r: 5 }}
              name="Order Volume"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminCharts;
