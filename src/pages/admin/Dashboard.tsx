
import React from 'react';
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

const Dashboard = () => {
  // Mock data - replace with real API calls
  const stats = [
    {
      title: 'Total Checkers',
      value: '12,845',
      subtitle: 'All WAEC types',
      icon: Archive,
      color: 'blue' as const,
      trend: { value: '12%', direction: 'up' as const }
    },
    {
      title: 'Active Orders',
      value: '247',
      subtitle: 'Pending & completed',
      icon: List,
      color: 'green' as const,
      trend: { value: '8%', direction: 'up' as const }
    },
    {
      title: 'Available Checkers',
      value: '8,592',
      subtitle: 'Ready for assignment',
      icon: Upload,
      color: 'yellow' as const
    },
    {
      title: 'Revenue This Month',
      value: '₵18,400',
      subtitle: 'From checker sales',
      icon: DollarSign,
      color: 'purple' as const,
      trend: { value: '15%', direction: 'up' as const }
    }
  ];

  const recentActivity = [
    { action: 'CSV Upload', time: '2 hours ago', details: '500 WASSCE checkers added' },
    { action: 'Order Completed', time: '4 hours ago', details: 'Order #1234 - 10 BECE checkers' },
    { action: 'Bulk Assignment', time: '6 hours ago', details: '50 checkers assigned to Order #1233' },
    { action: 'CSV Upload', time: '1 day ago', details: '300 NOVDEC checkers added' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">BECE</h4>
            <p className="text-2xl font-bold text-blue-600 mt-2">3,245</p>
            <p className="text-sm text-blue-700">Available</p>
            <p className="text-xs text-blue-600 mt-1">₵50 per checker</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">WASSCE</h4>
            <p className="text-2xl font-bold text-green-600 mt-2">4,892</p>
            <p className="text-sm text-green-700">Available</p>
            <p className="text-xs text-green-600 mt-1">₵75 per checker</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900">NOVDEC</h4>
            <p className="text-2xl font-bold text-purple-600 mt-2">455</p>
            <p className="text-sm text-purple-700">Available</p>
            <p className="text-xs text-purple-600 mt-1">₵60 per checker</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
