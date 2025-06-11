
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
      let url = `${BASE_URL}/checkers/availability`;
      
      // Try different parameter formats to handle potential API variations
      if (waecType) {
        // First try with waec_type parameter
        url += `?waec_type=${encodeURIComponent(waecType)}`;
      }

      console.log('Making availability request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Availability response status:', response.status);
      console.log('Availability response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get the error response body for more details
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.log('Error response body:', errorText);
          
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            // If not JSON, use the text as is
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }

        // Handle specific 400 error
        if (response.status === 400) {
          console.log('400 Bad Request - trying alternative endpoint format');
          
          // Try without the waec_type parameter as fallback
          if (waecType) {
            console.log('Retrying without waec_type parameter');
            try {
              const fallbackResponse = await fetch(`${BASE_URL}/checkers/availability`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (fallbackResponse.ok) {
                console.log('Fallback request succeeded');
                return await fallbackResponse.json();
              }
            } catch (fallbackError) {
              console.log('Fallback request also failed:', fallbackError);
            }
          }
          
          throw new Error(`Bad Request: ${errorMessage}. The API may not support filtering by exam type or the parameter format may be incorrect.`);
        }

        throw new Error(`Failed to check availability: ${response.status} - ${errorMessage}`);
      }

      const result = await response.json();
      console.log('Availability check result:', result);
      return result;
    } catch (error) {
      console.error('Error checking availability:', error);
      
      // Provide more specific error handling
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      // Re-throw the error as is if it's already a meaningful error
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

      console.log('Order initiation response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.log('Order error response body:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.log('Could not parse order error response:', parseError);
        }

        throw new Error(`Failed to initiate order: ${response.status} - ${errorMessage}`);
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

      console.log('Payment verification response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          console.log('Payment verification error response body:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          console.log('Could not parse payment verification error response:', parseError);
        }

        throw new Error(`Failed to verify payment: ${response.status} - ${errorMessage}`);
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
