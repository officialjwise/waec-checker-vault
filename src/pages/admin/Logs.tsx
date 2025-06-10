import React, { useState } from 'react';
import { Activity, User, Clock, Search } from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  timestamp: string;
  adminEmail: string;
  description: string;
  type: 'upload' | 'order' | 'delete' | 'update' | 'login';
}

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock log data
  const logs: LogEntry[] = [
    {
      id: '1',
      action: 'CSV Upload',
      timestamp: '2024-06-08T10:30:00Z',
      adminEmail: 'admin@waec.com',
      description: 'Uploaded 500 WASSCE checkers via CSV import',
      type: 'upload'
    },
    {
      id: '2',
      action: 'Order Processing',
      timestamp: '2024-06-08T09:15:00Z',
      adminEmail: 'admin@waec.com',
      description: 'Processed order ORD-001, assigned 10 BECE checkers',
      type: 'order'
    },
    {
      id: '3',
      action: 'Admin Login',
      timestamp: '2024-06-08T08:00:00Z',
      adminEmail: 'admin@waec.com',
      description: 'Admin user logged into the system',
      type: 'login'
    },
    {
      id: '4',
      action: 'Bulk Delete',
      timestamp: '2024-06-07T16:45:00Z',
      adminEmail: 'admin@waec.com',
      description: 'Deleted 25 expired NOVDEC checkers',
      type: 'delete'
    },
    {
      id: '5',
      action: 'CSV Upload',
      timestamp: '2024-06-07T14:20:00Z',
      adminEmail: 'admin@waec.com',
      description: 'Uploaded 300 NOVDEC checkers via CSV import',
      type: 'upload'
    },
    {
      id: '6',
      action: 'Order Update',
      timestamp: '2024-06-07T12:10:00Z',
      adminEmail: 'admin@waec.com',
      description: 'Updated payment status for order ORD-002',
      type: 'update'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || log.type === filterType;

    return matchesSearch && matchesType;
  });

  const getActionIcon = (type: string) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'upload': return <Activity className={`${iconClass} text-blue-500`} />;
      case 'order': return <User className={`${iconClass} text-green-500`} />;
      case 'delete': return <Activity className={`${iconClass} text-red-500`} />;
      case 'update': return <Activity className={`${iconClass} text-yellow-500`} />;
      case 'login': return <User className={`${iconClass} text-purple-500`} />;
      default: return <Activity className={`${iconClass} text-gray-500`} />;
    }
  };

  const getActionBadge = (type: string) => {
    const colors = {
      upload: 'bg-blue-100 text-blue-800',
      order: 'bg-green-100 text-green-800',
      delete: 'bg-red-100 text-red-800',
      update: 'bg-yellow-100 text-yellow-800',
      login: 'bg-purple-100 text-purple-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Activity Logs</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} log entries
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by action, description, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="upload">CSV Uploads</option>
            <option value="order">Order Processing</option>
            <option value="delete">Deletions</option>
            <option value="update">Updates</option>
            <option value="login">Login Activities</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredLogs.map((log) => {
            const { date, time } = formatTimestamp(log.timestamp);
            return (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{log.action}</h4>
                        <span className={getActionBadge(log.type)}>
                          {log.type}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {date} at {time}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      {log.adminEmail}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No activity logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredLogs.length > 0 && (
        <div className="text-center">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            Load More Logs
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;
