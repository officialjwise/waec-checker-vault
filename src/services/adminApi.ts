const BASE_URL = 'https://waec-backend.onrender.com/api';
const ADMIN_API_KEY = '3b59ed6cbc63193bd6c2a0294b2261e6ea7d748e0294b2261e6ea7d748e0a0b2eab186046ae7c95cac7';

// Get the admin token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  console.log('Getting auth headers, token exists:', !!token);
  console.log('Full token value:', token ? token.substring(0, 50) + '...' : 'null');
  console.log('API Key being used:', ADMIN_API_KEY ? ADMIN_API_KEY.substring(0, 10) + '...' : 'missing');
  return {
    'Content-Type': 'application/json',
    'X-API-Key': ADMIN_API_KEY,
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const getMultipartAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'X-API-Key': ADMIN_API_KEY,
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Simple cache implementation
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new SimpleCache();

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
  checkers: Checker[];
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
      console.log('Attempting login to:', `${BASE_URL}/auth/admin/login`);
      console.log('Login payload:', { email, password: '***' });
      
      const response = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed with response:', errorText);
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Login successful, received data:', { ...data, access_token: '***' });
      return data;
    } catch (error) {
      console.error('Login error details:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  // Logout functionality
  async logout(): Promise<void> {
    console.log('Logging out - clearing credentials and cache');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_authenticated');
    cache.clear();
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
    console.log('Request headers being sent:', { 
      'Content-Type': headers['Content-Type'],
      'X-API-Key': headers['X-API-Key'] ? headers['X-API-Key'].substring(0, 10) + '...' : 'missing',
      'Authorization': headers['Authorization'] ? headers['Authorization'].substring(0, 20) + '...' : 'missing'
    });
    
    // Log the exact headers that will be sent
    const finalHeaders = {
      ...headers,
      ...options.headers,
    };
    console.log('Final headers object:', finalHeaders);
    
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
      mode: 'cors',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // If we get a 401, let's see what the response body says before clearing credentials
    if (response.status === 401) {
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.error('401 response body:', errorBody);
      } catch (e) {
        console.error('Could not read 401 response body:', e);
      }
      
      console.error('Authentication failed - clearing stored credentials');
      this.logout();
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  }

  // Orders API methods - updated with caching
  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const cacheKey = `orders-${JSON.stringify(filters)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached orders data');
      return cachedData;
    }

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
      console.log('Raw orders API response:', responseData);
      
      const ordersData = responseData.data || [];
      console.log('Extracted orders data:', ordersData);
      
      // Sync order status with payment status before caching
      const syncedOrders = ordersData.map((order: Order) => ({
        ...order,
        status: this.syncOrderStatusWithPayment(order.status, order.payment_status)
      }));
      
      cache.set(cacheKey, syncedOrders, 2); // Cache for 2 minutes
      return syncedOrders;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  }

  // Helper method to sync order status with payment status
  private syncOrderStatusWithPayment(orderStatus: string, paymentStatus: string): string {
    // If payment is paid, order should be completed (unless cancelled)
    if (paymentStatus === 'paid' && orderStatus !== 'cancelled') {
      return 'completed';
    }
    
    // If payment is unpaid, order should be pending (unless cancelled)
    if (paymentStatus === 'unpaid' && orderStatus !== 'cancelled') {
      return 'pending';
    }
    
    return orderStatus;
  }

  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    const cacheKey = `order-detail-${orderId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached order detail');
      return cachedData;
    }

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch order detail: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Order detail response:', responseData);
      
      // Handle the nested response structure where data is an array with order and checkers
      let orderData;
      if (Array.isArray(responseData.data) && responseData.data.length > 0) {
        // Extract the order and checkers from the nested structure
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
      
      // Sync status before caching
      if (orderData) {
        orderData.status = this.syncOrderStatusWithPayment(orderData.status, orderData.payment_status);
      }
      
      console.log('Processed order data:', orderData);
      cache.set(cacheKey, orderData, 5); // Cache for 5 minutes
      return orderData;
    } catch (error) {
      console.error('Error in getOrderDetail:', error);
      throw error;
    }
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

      // Invalidate related cache entries
      cache.invalidate('orders');
      cache.invalidate(`order-detail-${orderId}`);

      return response.json();
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }

  // Checkers API methods - updated with better error handling and caching
  async getCheckers(filters: CheckerFilters = {}): Promise<Checker[]> {
    const cacheKey = `checkers-${JSON.stringify(filters)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached checkers data');
      return cachedData;
    }

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
      console.log('Checkers response:', responseData);
      
      const checkersData = responseData.data || responseData || [];
      cache.set(cacheKey, checkersData, 3); // Cache for 3 minutes
      return checkersData;
    } catch (error) {
      console.error('Error in getCheckers:', error);
      throw error;
    }
  }

  // New method to get assigned/unassigned checkers by WAEC type
  async getCheckersByType(waecType: string, assigned: boolean): Promise<Checker[]> {
    return this.getCheckers({ waec_type: waecType, assigned });
  }

  async previewCheckers(file: File): Promise<any[]> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers/preview`, {
        method: 'POST',
        headers: getMultipartAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to preview checkers: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in previewCheckers:', error);
      throw error;
    }
  }

  async uploadCheckers(file: File): Promise<UploadResult> {
    try {
      console.log('Uploading to endpoint:', `${BASE_URL}/admin/checkers`);
      
      // Try FormData approach first (which the server likely expects)
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers`, {
        method: 'POST',
        headers: getMultipartAuthHeaders(), // Don't set Content-Type for FormData
        body: formData,
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with response:', errorText);
        throw new Error(`Failed to upload checkers: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload successful, result:', result);
      
      // Invalidate checkers cache after successful upload
      cache.invalidate('checkers');
      cache.invalidate('inventory');
      
      return result;
    } catch (error) {
      console.error('Error in uploadCheckers:', error);
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

      // Invalidate related cache entries
      cache.invalidate('checkers');
      cache.invalidate('inventory');
    } catch (error) {
      console.error('Error in deleteChecker:', error);
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

      // Invalidate related cache entries
      cache.invalidate('checkers');
      cache.invalidate('inventory');

      return response.json();
    } catch (error) {
      console.error('Error in bulkDeleteCheckers:', error);
      throw error;
    }
  }

  // OTP Requests API methods - updated with caching
  async getOtpRequests(filters: OtpFilters = {}): Promise<OtpRequest[]> {
    const cacheKey = `otp-requests-${JSON.stringify(filters)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached OTP requests');
      return cachedData;
    }

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
      console.log('OTP requests response:', responseData);
      
      const otpData = responseData.data || responseData || [];
      cache.set(cacheKey, otpData, 3); // Cache for 3 minutes
      return otpData;
    } catch (error) {
      console.error('Error in getOtpRequests:', error);
      throw error;
    }
  }

  // Inventory API method - updated with caching
  async getInventory(): Promise<InventoryResponse> {
    const cacheKey = 'inventory';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached inventory data');
      return cachedData;
    }

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/inventory`);

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Inventory response:', responseData);
      
      // Extract the data from the response object
      const inventoryData = responseData.data || { byWaecType: [], lowStock: [] };
      cache.set(cacheKey, inventoryData, 5); // Cache for 5 minutes
      return inventoryData;
    } catch (error) {
      console.error('Error in getInventory:', error);
      throw error;
    }
  }

  // Admin Stats API method - updated with caching
  async getAdminStats(): Promise<AdminStats> {
    const cacheKey = 'admin-stats';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached admin stats');
      return cachedData;
    }

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/stats`);

      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Admin stats response:', responseData);
      
      // Extract the data from the response object
      const statsData = responseData.data || responseData;
      cache.set(cacheKey, statsData, 10); // Cache for 10 minutes
      return statsData;
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      throw error;
    }
  }

  // Logs API method - updated with caching
  async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
    const cacheKey = `logs-${JSON.stringify(filters)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached logs data');
      return cachedData;
    }

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
      console.log('Logs response:', responseData);
      
      const logsData = responseData.data || responseData || [];
      const validLogsData = Array.isArray(logsData) ? logsData : [];
      cache.set(cacheKey, validLogsData, 5); // Cache for 5 minutes
      return validLogsData;
    } catch (error) {
      console.error('Error in getLogs:', error);
      throw error;
    }
  }

  // Utility methods for data validation
  validateOrderData(order: any): Order {
    const validatedOrder = {
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

    // Sync status with payment status
    validatedOrder.status = this.syncOrderStatusWithPayment(validatedOrder.status, validatedOrder.payment_status);
    
    return validatedOrder;
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

  // Method to clear cache manually
  clearCache(): void {
    cache.clear();
    console.log('Cache cleared manually');
  }
}

export const adminApi = new AdminApiService();
