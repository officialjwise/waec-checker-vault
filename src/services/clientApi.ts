const BASE_URL = 'https://waec-backend-0buq.onrender.com/api';

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
  status: string;
  order: {
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
  };
  redirect_url: string;
}

export interface RetrieveInitiateRequest {
  phone: string;
}

export interface RetrieveInitiateResponse {
  message?: string;
  requestId?: string;
  prefix?: string;
  status?: string;
}

export interface RetrieveVerifyRequest {
  phone: string;
  otp: string;
  requestId: string;
  prefix: string;
}

export interface RetrieveVerifyResponse {
  status: string;
  message: string;
  checkers?: Array<{
    id: string;
    serial: string;
    pin: string;
    waec_type: string;
    created_at: string;
  }>;
}

class ClientApiService {
  // Check availability of checkers with optional waec_type filter
  async checkAvailability(waecType?: string): Promise<CheckerAvailability> {
    try {
      let url = `${BASE_URL}/checkers/availability`;
      
      if (waecType) {
        // Ensure waecType is uppercase and valid
        const validTypes = ['BECE', 'WASSCE', 'NOVDEC', 'CTVET', 'CSSPS'];
        const upperWaecType = waecType.toUpperCase();
        
        if (!validTypes.includes(upperWaecType)) {
          throw new Error(`Invalid waec_type: ${waecType}. Must be one of: ${validTypes.join(', ')}`);
        }
        
        url += `?waec_type=${encodeURIComponent(upperWaecType)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const responseText = await response.text();
        
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const parsedError = JSON.parse(responseText);
          errorMessage = parsedError.message || parsedError.error || responseText;
        } catch (parseError) {
          errorMessage = responseText || errorMessage;
        }

        throw new Error(`Request failed with status ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();
      
      // Handle the actual backend response format
      // Backend returns: { statusCode: 200, message: "Available checkers for WASSCE", count: 785, data: [...] }
      // We need to transform this to our expected format: { available: boolean, message?: string }
      
      if (result.statusCode === 200 && result.count > 0) {
        // Service is available if we get a 200 status and count > 0
        return {
          available: true,
          message: result.message
        };
      } else {
        // Service is unavailable if count is 0 or other conditions
        return {
          available: false,
          message: result.message || 'Checkers are currently not available'
        };
      }
      
    } catch (error) {
      // Handle different types of errors with specific messages
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          const networkError = new Error(`Network error: Unable to connect to ${BASE_URL}. 
            This could be due to:
            1. Backend server is down
            2. CORS issues
            3. Network connectivity problems
            4. Incorrect base URL
            
            Please verify the backend is running and accessible.`);
          throw networkError;
        }
        
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout: The server took too long to respond. Please try again.');
        }
      }

      if (error.name === 'AbortError') {
        throw new Error('Request was aborted due to timeout (30 seconds). Please check your connection and try again.');
      }
      
      // Re-throw the error if it's already a meaningful application error
      throw error;
    }
  }

  // Initiate an order
  async initiateOrder(orderData: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await fetch(`${BASE_URL}/orders/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          // Could not parse error response
        }

        throw new Error(`Failed to initiate order: ${response.status} - ${errorMessage}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Verify payment using reference
  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await fetch(`${BASE_URL}/orders/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          // Could not parse error response
        }

        throw new Error(`Failed to verify payment: ${response.status} - ${errorMessage}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Initiate retrieve process with OTP
  async initiateRetrieve(phoneNumber: string): Promise<RetrieveInitiateResponse> {
    try {
      // Format phone number to backend expected format (e.g., "233543482189")
      const formattedPhone = this.formatPhoneNumberForBackend(phoneNumber);
      
      console.log('Initiating retrieve with formatted phone:', formattedPhone);
      
      const response = await fetch(`${BASE_URL}/retrieve/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      // Handle 404 specifically for "no checkers found"
      if (response.status === 404) {
        let errorMessage = "No checkers found for this phone number";
        try {
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            // Use default message if parsing fails
          }
        } catch {
          // Use default message if reading response fails
        }
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          // Could not parse error response
        }

        throw new Error(`Failed to initiate retrieve: ${response.status} - ${errorMessage}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // Handle different types of errors with specific messages
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          const networkError = new Error(`Network error: Unable to connect to ${BASE_URL}. 
            This could be due to:
            1. Backend server is down
            2. CORS issues
            3. Network connectivity problems
            4. Incorrect base URL
            
            Please verify the backend is running and accessible.`);
          throw networkError;
        }
        
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout: The server took too long to respond. Please try again.');
        }
      }

      if (error.name === 'AbortError') {
        throw new Error('Request was aborted due to timeout (30 seconds). Please check your connection and try again.');
      }
      
      // Re-throw the error if it's already a meaningful application error
      throw error;
    }
  }

  // Verify OTP and get checkers
  async verifyRetrieveOtp(phoneNumber: string, otp: string, requestId: string, prefix: string): Promise<RetrieveVerifyResponse> {
    try {
      // Format phone number to backend expected format (e.g., "233543482189")
      const formattedPhone = this.formatPhoneNumberForBackend(phoneNumber);
      
      console.log('Verifying OTP with formatted phone:', formattedPhone);
      
      const response = await fetch(`${BASE_URL}/retrieve/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp: otp,
          requestId: requestId,
          prefix: prefix
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          // Could not parse error response
        }

        throw new Error(`Failed to verify OTP: ${response.status} - ${errorMessage}`);
      }

      const result = await response.json();
      
      // Handle the success response properly - don't throw error if verification was successful
      if (result.message && result.message.includes('verified successfully')) {
        // Transform the successful response to match our expected format
        return {
          status: 'success',
          message: result.message,
          checkers: result.checkers || []
        };
      }
      
      return result;
    } catch (error) {
      // Handle different types of errors with specific messages
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          const networkError = new Error(`Network error: Unable to connect to ${BASE_URL}. 
            This could be due to:
            1. Backend server is down
            2. CORS issues
            3. Network connectivity problems
            4. Incorrect base URL
            
            Please verify the backend is running and accessible.`);
          throw networkError;
        }
        
        if (error.message.includes('timeout')) {
          throw new Error('Request timeout: The server took too long to respond. Please try again.');
        }
      }

      if (error.name === 'AbortError') {
        throw new Error('Request was aborted due to timeout (30 seconds). Please check your connection and try again.');
      }
      
      // Re-throw the error if it's already a meaningful application error
      throw error;
    }
  }

  // Helper method to format phone number for backend (without + or leading 0)
  formatPhoneNumberForBackend(phone: string): string {
    const cleanPhone = phone.replace(/[\s-+]/g, '');
    
    // Handle Ghana numbers
    if (cleanPhone.startsWith('233')) {
      return cleanPhone; // Already in correct format
    } else if (cleanPhone.startsWith('0')) {
      return `233${cleanPhone.substring(1)}`; // Remove leading 0 and add 233
    } else {
      return `233${cleanPhone}`; // Add 233 prefix
    }
  }

  // Helper method to format phone number to international format (kept for other uses)
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
      'ctvet': 'CTVET',
      'placement': 'PLACEMENT'
    };
    
    return typeMap[waecType] || waecType.toUpperCase();
  }
}

export const clientApi = new ClientApiService();
export default clientApi;
