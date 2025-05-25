// src/components/layout/__tests__/Navbar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { SidebarContext } from './SidebarContext';
import { toast } from 'sonner';

// Mock toast to avoid real toast calls
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

// Setup portal root for popovers if needed
beforeAll(() => {
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'portal-root');
  document.body.appendChild(portalRoot);
});

describe('Navbar Component', () => {
  const mockLogout = jest.fn();

  const renderNavbar = () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: { email: 'john@example.com', fullName: 'John Doe' },
            logout: mockLogout,
            // Add any other AuthContextType required props here if needed
            isAuthenticated: true,
            isLoading: false,
            login: jest.fn(),
            register: jest.fn(),
          }}
        >
          <SidebarContext.Provider value={{ isOpen: false, setIsOpen: jest.fn() }}>
            <Navbar />
          </SidebarContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Navbar with title', () => {
    renderNavbar();
    expect(screen.getByText(/NeuralEye/i)).toBeInTheDocument();
  });










  
});
