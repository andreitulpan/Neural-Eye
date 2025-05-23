
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
}

export interface RegisterResponse {
  message: string;
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
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  }
};
