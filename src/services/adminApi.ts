

const BASE_URL = 'https://waec-backend.onrender.com/api';

// Get the admin token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'X-API-Key': token || '',
  };
};

const getMultipartAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'X-API-Key': token || '',
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
  // Admin Login - keeping this functionality
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const response = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    return response.json();
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
    return !!(token && authenticated === 'true');
  }

  // Orders API methods
  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    const response = await fetch(`${BASE_URL}/admin/orders?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    return response.json();
  }

  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    const response = await fetch(`${BASE_URL}/admin/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order detail: ${response.status}`);
    }

    return response.json();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.status}`);
    }

    return response.json();
  }

  // Checkers API methods
  async getCheckers(filters: CheckerFilters = {}): Promise<Checker[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    const response = await fetch(`${BASE_URL}/admin/checkers?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checkers: ${response.status}`);
    }

    return response.json();
  }

  async previewCheckers(file: File): Promise<any[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/admin/checkers/preview`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to preview checkers: ${response.status}`);
    }

    return response.json();
  }

  async uploadCheckers(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/admin/checkers/upload`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload checkers: ${response.status}`);
    }

    return response.json();
  }

  async deleteChecker(checkerId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/checkers/${checkerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete checker: ${response.status}`);
    }
  }

  async bulkDeleteCheckers(checkerIds: string[]): Promise<{ deleted: number }> {
    const response = await fetch(`${BASE_URL}/admin/checkers/bulk-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ checker_ids: checkerIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk delete checkers: ${response.status}`);
    }

    return response.json();
  }

  // OTP Requests API methods
  async getOtpRequests(filters: OtpFilters = {}): Promise<OtpRequest[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    const response = await fetch(`${BASE_URL}/admin/otp-requests?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OTP requests: ${response.status}`);
    }

    return response.json();
  }

  // Inventory API method
  async getInventory(): Promise<InventoryItem[]> {
    const response = await fetch(`${BASE_URL}/admin/inventory`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.status}`);
    }

    return response.json();
  }

  // Admin Stats API method
  async getAdminStats(): Promise<AdminStats> {
    const response = await fetch(`${BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admin stats: ${response.status}`);
    }

    return response.json();
  }

  // Logs API method
  async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });

    const response = await fetch(`${BASE_URL}/admin/logs?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }

    return response.json();
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

