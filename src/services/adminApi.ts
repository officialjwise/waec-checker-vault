const BASE_URL = 'https://waec-backend.onrender.com/api';

// Get the admin token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'X-API-Key': token || '',
  };
};

// Get user token from localStorage (for non-admin endpoints)
const getUserAuthHeaders = () => {
  const token = localStorage.getItem('user_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
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

// New interfaces for additional endpoints
export interface CheckerAvailability {
  waec_type: string;
  available: number;
  price?: number;
  details?: Checker[];
}

export interface CheckerSummary {
  total_purchased: number;
  by_type: {
    [key: string]: number;
  };
  recent_purchases: Order[];
}

export interface OrderInitiateRequest {
  phone: string;
  email: string;
  waec_type: string;
  quantity: number;
}

export interface OrderInitiateResponse {
  order_id: string;
  payment_url: string;
  reference: string;
}

export interface OrderVerifyResponse {
  success: boolean;
  order: OrderDetail;
  message?: string;
}

export interface OtpInitiateRequest {
  phone: string;
}

export interface OtpInitiateResponse {
  success: boolean;
  request_id: string;
  message: string;
}

export interface OtpVerifyRequest {
  requestId: string;
  otp: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  checkers?: Checker[];
  message: string;
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
  // Orders
  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const url = `${BASE_URL}/admin/orders${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
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

  // Checkers
  async getCheckers(filters: CheckerFilters = {}): Promise<Checker[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    const url = `${BASE_URL}/admin/checkers${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch checkers: ${response.status}`);
    }
    
    return response.json();
  }

  async uploadCheckers(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${BASE_URL}/admin/checkers`, {
      method: 'POST',
      headers: getMultipartAuthHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload checkers: ${response.status}`);
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

  // New Checker Public Methods
  async getCheckerAvailability(waecType?: string, limit?: number, detailed?: boolean): Promise<CheckerAvailability[]> {
    const params = new URLSearchParams();
    if (waecType) params.append('waec_type', waecType);
    if (limit) params.append('limit', limit.toString());
    if (detailed) params.append('detailed', 'true');
    
    const url = `${BASE_URL}/checkers/availability${params.toString() ? `?${params.toString()}` : ''}`;
    const headers = detailed ? getUserAuthHeaders() : { 'Content-Type': 'application/json' };
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch checker availability: ${response.status}`);
    }
    
    return response.json();
  }

  async getCheckerSummary(): Promise<CheckerSummary> {
    const response = await fetch(`${BASE_URL}/checkers/summary`, {
      headers: getUserAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch checker summary: ${response.status}`);
    }
    
    return response.json();
  }

  // Order Public Methods
  async initiateOrder(orderData: OrderInitiateRequest): Promise<OrderInitiateResponse> {
    const response = await fetch(`${BASE_URL}/orders/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate order: ${response.status}`);
    }
    
    return response.json();
  }

  async verifyOrder(reference: string): Promise<OrderVerifyResponse> {
    const response = await fetch(`${BASE_URL}/orders/verify/${reference}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to verify order: ${response.status}`);
    }
    
    return response.json();
  }

  // OTP Methods
  async initiateOtp(phone: string): Promise<OtpInitiateResponse> {
    const response = await fetch(`${BASE_URL}/retrieve/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initiate OTP: ${response.status}`);
    }
    
    return response.json();
  }

  async verifyOtp(requestId: string, otp: string): Promise<OtpVerifyResponse> {
    const response = await fetch(`${BASE_URL}/retrieve/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, otp }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to verify OTP: ${response.status}`);
    }
    
    return response.json();
  }

  // OTP Requests
  async getOtpRequests(filters: OtpFilters = {}): Promise<OtpRequest[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    const url = `${BASE_URL}/admin/otp-requests${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OTP requests: ${response.status}`);
    }
    
    return response.json();
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    const response = await fetch(`${BASE_URL}/admin/inventory`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.status}`);
    }
    
    return response.json();
  }

  // Logs
  async getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const url = `${BASE_URL}/admin/logs${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }
    
    return response.json();
  }
}

export const adminApi = new AdminApiService();
