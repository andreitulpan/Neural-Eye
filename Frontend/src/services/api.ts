import { toast } from "sonner";

const API_BASE_URL = "https://neuraleye.thezion.one";

interface RequestOptions extends RequestInit {
  isPublic?: boolean;
}

/**
 * Base API client for making HTTP requests to the backend
 */
export const api = {
  /**
   * Make a GET request to the API
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return await this.request(endpoint, {
      method: "GET",
      ...options,
    }) as T;
  },

  /**
   * Make a POST request to the API
   */
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return await this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }) as T;
  },

  /**
   * Make a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return await this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }) as T;
  },

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return await this.request(endpoint, {
      method: "DELETE",
      ...options,
    }) as T;
  },

  /**
   * Base request method that handles authentication, JSON serialization, and error handling
   */
  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    console.log('Making API request to:', url);
    console.log('Request options:', options);
    
    // Default headers
    const headers = new Headers(options.headers);
    
    // Set JSON content type if not already set and we have a body
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token for non-public endpoints
    if (!options.isPublic) {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // Prepare the request
    const request = new Request(url, {
      ...options,
      headers,
      mode: 'cors', // Explicitly set CORS mode
    });

    try {
      console.log('Sending request...');
      const response = await fetch(request);
      console.log('Response received:', response.status, response.statusText);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: "An error occurred" };
        }
        const errorMessage = errorData.message || `Error: ${response.statusText}`;
        
        console.error('API Error:', errorMessage, response.status);
        
        // Toast the error message
        toast.error(errorMessage);
        
        throw new Error(errorMessage);
      }

      // Return response body as JSON, or empty object if no content
      if (response.status === 204) {
        return {};
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('Network/Fetch error:', error);
      
      // Re-throw any network or JSON parsing errors
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          const corsMessage = "Connection failed. This might be a CORS issue with the backend server.";
          toast.error(corsMessage);
          throw new Error(corsMessage);
        }
        if (!error.message.includes("Error:")) {
          toast.error("Network error. Please check your connection.");
        }
      }
      throw error;
    }
  }
};
