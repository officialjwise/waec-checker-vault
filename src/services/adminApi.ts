
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
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  checkers: Checker[];
}

export interface Checker {
  id: string;
  serial: string;
  pin: string;
  waec_type: string;
  assigned: boolean;
  order_id?: string;
  created_at: string;
}

export interface OtpRequest {
  id: string;
  phone: string;
  verified: boolean;
  created_at: string;
}

export interface InventoryItem {
  waec_type: string;
  total: number;
  assigned: number;
  available: number;
}

export interface LogEntry {
  id: string;
  action: string;
  admin_id: string;
  details: any;
  created_at: string;
}

export interface OrderFilters {
  status?: string;
  phone?: string;
  email?: string;
  waec_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface CheckerFilters {
  waec_type?: string;
  assigned?: boolean;
}

export interface OtpFilters {
  phone?: string;
  verified?: boolean;
}

export interface LogFilters {
  action?: string;
  admin_id?: string;
}

export interface UploadResult {
  inserted: number;
  skipped: number;
  errors: string[];
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
      if (value) queryParams.append(key, value);
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

  // Checkers API methods
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

  // Logs API method
  async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await fetch(`${BASE_URL}/admin/logs?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }

    return response.json();
  }
}

export const adminApi = new AdminApiService();
