const BASE_URL = 'https://waec-backend.onrender.com/api';

// API Key for admin requests - this should match your backend configuration
const API_KEY = '3b59ed6cbc63193bd6c2a0294b2261e6ea7d748e0a0b2eab186046ae7c95cac7';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  orders: 5 * 60 * 1000, // 5 minutes
  checkers: 10 * 60 * 1000, // 10 minutes
  inventory: 2 * 60 * 1000, // 2 minutes
  stats: 1 * 60 * 1000, // 1 minute
};

// Cache utility functions
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
};

const setCachedData = (key: string, data: any, ttl: number) => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Get the admin token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  console.log('Getting auth headers - token exists:', !!token);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
  console.log('Adding X-API-Key header for admin authorization');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-API-Key': API_KEY,
  };
};

const getMultipartAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  console.log('Getting multipart auth headers - token exists:', !!token);
  console.log('Adding X-API-Key header for admin authorization');
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'X-API-Key': API_KEY,
  };
};

export interface Order {
  id: string;
  phone: string;
  email: string;
  waec_type: string;
  quantity: number;
  status: 'pending' | 'paid' | 'cancelled' | 'completed' | 'processing';
  payment_status: 'paid' | 'unpaid';
  payment_reference?: string;
  amount?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  checkers?: Checker[]; // Changed from required to optional
  transaction_id?: string;
  payment_method?: string;
  notes?: string;
}

export interface Checker {
  id: string;
  serial: string;
  pin: string;
  waec_type: string;
  assigned: boolean;
  order_id?: string;
  assigned_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface OtpRequest {
  id: string;
  phone: string;
  otp_code?: string;
  verified: boolean;
  expires_at?: string;
  attempts?: number;
  created_at: string;
  updated_at?: string;
}

export interface InventoryItem {
  waec_type: string;
  total: number;
  available: number;
  assigned?: number;
  last_updated?: string;
}

export interface InventoryResponse {
  byWaecType: InventoryItem[];
  lowStock: string[];
}

export interface LogEntry {
  id: string;
  action: string;
  admin_id: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface OrderFilters {
  status?: string;
  phone?: string;
  email?: string;
  waec_type?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface CheckerFilters {
  waec_type?: string;
  assigned?: boolean;
  order_id?: string;
  limit?: number;
  offset?: number;
}

export interface OtpFilters {
  phone?: string;
  verified?: boolean;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface LogFilters {
  action?: string;
  admin_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface UploadResult {
  inserted: number;
  skipped: number;
  errors: string[];
  duplicate_serials?: string[];
  invalid_rows?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface AdminStats {
  total_orders: number;
  total_checkers: number;
  total_revenue: number;
  pending_orders: number;
  completed_orders: number;
  processing_orders: number;
  inventory_by_type: InventoryItem[];
}

class AdminApiService {
  // Admin Login - updated with better error handling
  async login(email: string, password: string): Promise<{ access_token: string }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': API_KEY,
        },
        mode: 'cors',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Login response received, token preview:', data.access_token ? `${data.access_token.substring(0, 20)}...` : 'no token');
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  // Logout functionality
  async logout(): Promise<void> {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_authenticated');
    clearCache();
  }

  // Check if admin is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_token');
    const authenticated = localStorage.getItem('admin_authenticated');
    console.log('Checking authentication - token exists:', !!token, 'authenticated flag:', authenticated);
    return !!(token && authenticated === 'true');
  }

  // Enhanced API call with better auth handling
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = getAuthHeaders();
    console.log('Making authenticated request to:', url);
    console.log('Request headers:', { ...headers, Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 27)}...` : 'missing' });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      mode: 'cors',
    });

    console.log('Response status:', response.status);

    // If we get a 401, clear credentials and throw error
    if (response.status === 401) {
      console.log('Received 401, clearing credentials');
      this.logout();
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  }

  // Orders API methods - updated with caching and status synchronization
  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const cacheKey = `orders_${JSON.stringify(filters)}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/orders?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const responseData = await response.json();
      const ordersData = responseData.data || [];
      
      // Synchronize order status with payment status
      const synchronizedOrders = ordersData.map((order: Order) => this.synchronizeOrderStatus(order));
      
      setCachedData(cacheKey, synchronizedOrders, CACHE_TTL.orders);
      return synchronizedOrders;
    } catch (error) {
      throw error;
    }
  }

  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    const cacheKey = `order_detail_${orderId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch order detail: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Handle the nested response structure
      let orderData;
      if (Array.isArray(responseData.data) && responseData.data.length > 0) {
        const firstItem = responseData.data[0];
        if (firstItem.order && firstItem.checkers) {
          orderData = {
            ...firstItem.order,
            checkers: firstItem.checkers
          };
        } else {
          orderData = firstItem;
        }
      } else {
        orderData = responseData.data || responseData;
      }
      
      // Synchronize order status with payment status
      const synchronizedOrder = this.synchronizeOrderStatus(orderData);
      
      // Ensure checkers property exists even if empty
      if (!synchronizedOrder.checkers) {
        synchronizedOrder.checkers = [];
      }
      
      setCachedData(cacheKey, synchronizedOrder, CACHE_TTL.orders);
      return synchronizedOrder;
    } catch (error) {
      throw error;
    }
  }

  // Synchronize order status with payment status
  private synchronizeOrderStatus<T extends Order | OrderDetail>(order: T): T {
    const paymentStatus = order.payment_status || 'unpaid';
    let orderStatus = order.status || 'pending';

    // If payment is paid but order is pending, update to completed
    if (paymentStatus === 'paid' && orderStatus === 'pending') {
      orderStatus = 'completed';
    }
    
    // If payment is unpaid but order is completed/paid, update to pending
    if (paymentStatus === 'unpaid' && (orderStatus === 'completed' || orderStatus === 'paid')) {
      orderStatus = 'pending';
    }

    // Create updated order without modifying original checkers property if it exists
    return {
      ...order,
      status: orderStatus
    };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }

      // Clear related cache entries
      clearCache('orders');
      clearCache('order_detail');
      clearCache('stats');

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  // Checkers API methods - updated with caching
  async getCheckers(filters: CheckerFilters = {}): Promise<Checker[]> {
    const cacheKey = `checkers_${JSON.stringify(filters)}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch checkers: ${response.status}`);
      }

      const responseData = await response.json();
      const checkersData = responseData.data || responseData || [];
      
      setCachedData(cacheKey, checkersData, CACHE_TTL.checkers);
      return checkersData;
    } catch (error) {
      throw error;
    }
  }

  async getCheckersByType(waecType: string, assigned: boolean): Promise<Checker[]> {
    return this.getCheckers({ waec_type: waecType, assigned });
  }

  async uploadCheckers(file: File): Promise<UploadResult> {
    try {
      // Use FormData for file upload as expected by the backend
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers/upload`, {
        method: 'POST',
        headers: getMultipartAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload checkers: ${response.status} - ${errorText}`);
      }

      // Clear related cache entries
      clearCache('checkers');
      clearCache('inventory');
      clearCache('stats');

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteChecker(checkerId: string): Promise<void> {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers/${checkerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete checker: ${response.status}`);
      }

      // Clear related cache entries
      clearCache('checkers');
      clearCache('inventory');
      clearCache('stats');
    } catch (error) {
      throw error;
    }
  }

  async bulkDeleteCheckers(checkerIds: string[]): Promise<{ deleted: number }> {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers/bulk-delete`, {
        method: 'POST',
        body: JSON.stringify({ checker_ids: checkerIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk delete checkers: ${response.status}`);
      }

      // Clear related cache entries
      clearCache('checkers');
      clearCache('inventory');
      clearCache('stats');

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  // OTP Requests API methods - updated with caching
  async getOtpRequests(filters: OtpFilters = {}): Promise<OtpRequest[]> {
    const cacheKey = `otp_requests_${JSON.stringify(filters)}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/otp-requests?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch OTP requests: ${response.status}`);
      }

      const responseData = await response.json();
      const otpData = responseData.data || responseData || [];
      
      setCachedData(cacheKey, otpData, CACHE_TTL.orders);
      return otpData;
    } catch (error) {
      throw error;
    }
  }

  // Inventory API method - updated with caching
  async getInventory(): Promise<InventoryResponse> {
    const cacheKey = 'inventory';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/inventory`);

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
      }

      const responseData = await response.json();
      const inventoryData = responseData.data || { byWaecType: [], lowStock: [] };
      
      setCachedData(cacheKey, inventoryData, CACHE_TTL.inventory);
      return inventoryData;
    } catch (error) {
      throw error;
    }
  }

  // Admin Stats API method - updated with caching
  async getAdminStats(): Promise<AdminStats> {
    const cacheKey = 'admin_stats';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/stats`);

      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.status}`);
      }

      const responseData = await response.json();
      const statsData = responseData.data || responseData;
      
      setCachedData(cacheKey, statsData, CACHE_TTL.stats);
      return statsData;
    } catch (error) {
      throw error;
    }
  }

  // Logs API method - updated with caching
  async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
    const cacheKey = `logs_${JSON.stringify(filters)}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/logs?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const responseData = await response.json();
      const logsData = responseData.data || responseData || [];
      
      setCachedData(cacheKey, Array.isArray(logsData) ? logsData : [], CACHE_TTL.orders);
      return Array.isArray(logsData) ? logsData : [];
    } catch (error) {
      throw error;
    }
  }

  // Cache management methods
  clearAllCache(): void {
    clearCache();
  }

  clearCacheByPattern(pattern: string): void {
    clearCache(pattern);
  }

  // Utility methods for data validation
  validateOrderData(order: any): Order {
    return {
      id: order.id || '',
      phone: order.phone || '',
      email: order.email || '',
      waec_type: order.waec_type || 'WASSCE',
      quantity: order.quantity || 0,
      status: order.status || 'pending',
      payment_status: order.payment_status || 'unpaid',
      payment_reference: order.payment_reference,
      amount: order.amount,
      created_at: order.created_at || new Date().toISOString(),
      updated_at: order.updated_at || new Date().toISOString(),
    };
  }

  validateCheckerData(checker: any): Checker {
    return {
      id: checker.id || '',
      serial: checker.serial || '',
      pin: checker.pin || '',
      waec_type: checker.waec_type || 'WASSCE',
      assigned: checker.assigned || false,
      order_id: checker.order_id,
      assigned_at: checker.assigned_at,
      created_at: checker.created_at || new Date().toISOString(),
      updated_at: checker.updated_at,
    };
  }
}

export const adminApi = new AdminApiService();
