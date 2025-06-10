
import React, { useState, useEffect } from 'react';
import { Activity, User, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi, LogEntry, LogFilters } from '@/services/adminApi';

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (filters: LogFilters = {}) => {
    try {
      setLoading(true);
      console.log('Fetching logs with filters:', filters);
      const data = await adminApi.getLogs(filters);
      console.log('Logs fetched:', data);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filters: LogFilters = {};
    
    if (filterType !== 'all') {
      filters.action = filterType;
    }
    
    fetchLogs(filters);
  };

  useEffect(() => {
    applyFilters();
  }, [filterType]);

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower)) ||
      log.admin_id.toLowerCase().includes(searchLower)
    );
  });

  const getActionIcon = (action: string) => {
    const iconClass = "h-4 w-4";
    
    if (action.includes('upload') || action.includes('checker')) {
      return <Activity className={`${iconClass} text-blue-500`} />;
    } else if (action.includes('order')) {
      return <User className={`${iconClass} text-green-500`} />;
    } else if (action.includes('delete')) {
      return <Activity className={`${iconClass} text-red-500`} />;
    } else if (action.includes('update')) {
      return <Activity className={`${iconClass} text-yellow-500`} />;
    } else if (action.includes('login')) {
      return <User className={`${iconClass} text-purple-500`} />;
    } else {
      return <Activity className={`${iconClass} text-gray-500`} />;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('upload') || action.includes('checker')) {
      return 'bg-blue-100 text-blue-800';
    } else if (action.includes('order')) {
      return 'bg-green-100 text-green-800';
    } else if (action.includes('delete')) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('update')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (action.includes('login')) {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const formatLogDetails = (details: any) => {
    if (!details) return 'No additional details';
    
    if (typeof details === 'string') return details;
    
    // Format object details into readable text
    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    return JSON.stringify(details);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading logs...</p>
        </div>
      </div>
    );
  }

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
              placeholder="Search logs by action, details, or admin ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="checker_upload">Checker Uploads</option>
            <option value="order_processing">Order Processing</option>
            <option value="admin_login">Admin Login</option>
            <option value="bulk_delete">Bulk Operations</option>
            <option value="update">Updates</option>
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
            const { date, time } = formatTimestamp(log.created_at);
            return (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadge(log.action)}`}>
                          {log.action.split('_')[0]}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {date} at {time}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{formatLogDetails(log.details)}</p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      Admin ID: {log.admin_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No activity logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredLogs.length > 0 && (
        <div className="text-center">
          <button 
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            onClick={() => fetchLogs()}
          >
            Refresh Logs
          </button>
        </div>
      )}
    </div>
  );
};

export default Logs;
