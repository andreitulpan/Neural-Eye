
import { api } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface SaveImageResponse {
  success: boolean;
  text: string;
  message: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/api/auth/login", credentials);
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/api/auth/register", data);
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean }> {
    return api.post<{ success: boolean }>("/api/auth/forgot-password", data);
  },

  async saveImage(imageData: string, userId: string): Promise<SaveImageResponse> {
    return api.post<SaveImageResponse>("/api/stream/saveimage", {
      imageData,
      userId
    });
  },

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  }
};
