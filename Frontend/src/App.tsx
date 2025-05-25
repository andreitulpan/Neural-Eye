
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LogsPage from "./pages/Logs";
import DevicesPage from "./pages/Devices";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import StreamView from "./pages/StreamView";
import DeviceForm from "./pages/DeviceForm";
import Images from "./pages/Images";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Protect routes that require authentication
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  // Redirect authenticated users away from auth pages
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
          <Route path="/devices/add" element={<ProtectedRoute><DeviceForm /></ProtectedRoute>} />
          <Route path="/devices/:id/edit" element={<ProtectedRoute><DeviceForm /></ProtectedRoute>} />
          <Route path="/stream-view/:id" element={<ProtectedRoute><StreamView /></ProtectedRoute>} />
          <Route path="/images" element={<ProtectedRoute><Images /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
