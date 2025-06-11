const BASE_URL = 'https://waec-backend.onrender.com/api';
const ADMIN_API_KEY = '3b59ed6cbc63193bd6c2a0294b2261e6ea7d748e0a0b2eab186046ae7c95cac7';

// Get the admin token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  console.log('Getting auth headers, token exists:', !!token);
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

export interface Order {
  id: string;
  phone: string;
  email: string;
  waec_type: string;
  quantity: number;
  status: 'pending' | 'completed' | 'processing';
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
  assigned: number;
  available: number;
  last_updated?: string;
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
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_authenticated');
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
    console.log('Request headers:', { 
      'Content-Type': headers['Content-Type'],
      'X-API-Key': headers['X-API-Key'] ? '***' : 'missing',
      'Authorization': headers['Authorization'] ? '***' : 'missing'
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      mode: 'cors',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 401) {
      console.error('Authentication failed - clearing stored credentials');
      this.logout();
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  }

  // Orders API methods - updated with better error handling
  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/orders?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  }

  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch order detail: ${response.status}`);
      }

      return response.json();
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

      return response.json();
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }

  // Checkers API methods - updated with better error handling
  async getCheckers(filters: CheckerFilters = {}): Promise<Checker[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch checkers: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getCheckers:', error);
      throw error;
    }
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/checkers/upload`, {
        method: 'POST',
        headers: getMultipartAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload checkers: ${response.status}`);
      }

      return response.json();
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

      return response.json();
    } catch (error) {
      console.error('Error in bulkDeleteCheckers:', error);
      throw error;
    }
  }

  // OTP Requests API methods - updated with better error handling
  async getOtpRequests(filters: OtpFilters = {}): Promise<OtpRequest[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/otp-requests?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch OTP requests: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getOtpRequests:', error);
      throw error;
    }
  }

  // Inventory API method - updated with better error handling
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/inventory`);

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getInventory:', error);
      throw error;
    }
  }

  // Admin Stats API method - updated with better error handling
  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/stats`);

      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      throw error;
    }
  }

  // Logs API method - updated with better error handling
  async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/admin/logs?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getLogs:', error);
      throw error;
    }
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
