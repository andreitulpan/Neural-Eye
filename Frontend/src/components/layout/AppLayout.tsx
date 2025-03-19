
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dashboard-background">
      <Sidebar />
      <div className="flex-1 w-full">
        <Navbar />
        <main className="container mx-auto px-4 py-6 md:p-6 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
