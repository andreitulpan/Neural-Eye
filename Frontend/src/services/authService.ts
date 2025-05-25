
import { api } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  name: string;
}

export interface RegisterResponse {
  message: string;
}

// Helper function to convert base64 to hex
function base64ToHex(base64: string): string {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Convert base64 to binary string
  const binaryString = atob(cleanBase64);
  
  // Convert binary string to hex
  let hex = '';
  for (let i = 0; i < binaryString.length; i++) {
    const hexByte = binaryString.charCodeAt(i).toString(16).padStart(2, '0');
    hex += hexByte;
  }
  
  return hex;
}

export const authService = {
  /**
   * Log in a user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/api/auth/login", credentials, { isPublic: true });
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/api/auth/register", data, { isPublic: true });
  },

  /**
   * Request a password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>("/api/auth/forgot-password", data, { isPublic: true });
  },

  /**
   * Save image and extract OCR text
   */
  async saveImage(imageData: string, userId: number): Promise<{ text: string }> {
    // Convert base64 to hex string
    const hexData = base64ToHex(imageData);
    
    return api.post<{ text: string }>("api/stream/saveimage", {
      image: hexData,
      user_id: userId
    });
  },

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  }
};
