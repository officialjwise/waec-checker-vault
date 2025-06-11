
const BASE_URL = 'https://waec-backend.onrender.com/api';

export interface CheckerAvailability {
  available: boolean;
  message?: string;
}

export interface OrderRequest {
  waec_type: string;
  quantity: number;
  phone: string;
  email: string;
}

export interface OrderResponse {
  order_id: string;
  payment_url: string;
}

export interface VerifyPaymentResponse {
  message: string;
  order_id: string;
  waec_type: string;
  quantity: number;
  phone_number: string;
  checkers: Array<{
    id: string;
    serial: string;
    pin: string;
    waec_type: string;
    created_at: string;
  }>;
  redirect_url: string;
  status: string;
}

class ClientApiService {
  // Check availability of checkers with optional waec_type filter
  async checkAvailability(waecType?: string): Promise<CheckerAvailability> {
    try {
      const url = new URL(`${BASE_URL}/checkers/availability`);
      if (waecType) {
        url.searchParams.append('waec_type', waecType);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check availability: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  // Initiate an order
  async initiateOrder(orderData: OrderRequest): Promise<OrderResponse> {
    try {
      console.log('Initiating order with data:', orderData);
      
      const response = await fetch(`${BASE_URL}/orders/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to initiate order: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initiating order:', error);
      throw error;
    }
  }

  // Verify payment using reference
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      console.log('Verifying payment with reference:', reference);
      
      const response = await fetch(`${BASE_URL}/orders/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to verify payment: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Helper method to format phone number to international format
  formatPhoneNumber(phone: string, countryCode: string): string {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    
    if (countryCode === 'ghana') {
      if (cleanPhone.startsWith('233')) {
        return cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        return `233${cleanPhone.substring(1)}`;
      } else {
        return `233${cleanPhone}`;
      }
    } else if (countryCode === 'nigeria') {
      if (cleanPhone.startsWith('234')) {
        return cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        return `234${cleanPhone.substring(1)}`;
      } else {
        return `234${cleanPhone}`;
      }
    }
    
    return cleanPhone;
  }

  // Helper method to map frontend waec types to backend format
  mapWaecType(waecType: string): string {
    const typeMap: Record<string, string> = {
      'bece': 'BECE',
      'wassce': 'WASSCE',
      'novdec': 'NOVDEC',
      'placement': 'PLACEMENT'
    };
    
    return typeMap[waecType] || waecType.toUpperCase();
  }
}

export const clientApi = new ClientApiService();
export default clientApi;
