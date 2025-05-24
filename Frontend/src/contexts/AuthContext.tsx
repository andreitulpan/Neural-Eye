
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, LoginResponse, RegisterResponse, LoginRequest, RegisterRequest } from "../services/authService";

interface User {
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on initial load
    const loadUser = () => {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("authToken");
      
      if (userJson && token) {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await authService.login(credentials);
      
      // Store the token
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("isAuthenticated", "true");
      
      // Create user object from the credentials (since backend only returns token)
      const userData: User = {
        email: credentials.email,
        fullName: credentials.email.split('@')[0] // Fallback since we don't have fullName from login
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response: RegisterResponse = await authService.register(data);
      console.log("Registration successful:", response.message);
      
      // After successful registration, automatically log in the user
      await login({ email: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
