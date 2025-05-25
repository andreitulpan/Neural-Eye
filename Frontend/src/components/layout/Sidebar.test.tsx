// src/components/layout/Sidebar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { BrowserRouter } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Mock hooks and toast
jest.mock('./SidebarContext');
jest.mock('@/contexts/AuthContext');
jest.mock('sonner');

const mockSetIsOpen = jest.fn();
const mockLogout = jest.fn();
const mockNavigate = jest.fn();

// Mock react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useSidebar as jest.Mock).mockReturnValue({
      isOpen: true,
      setIsOpen: mockSetIsOpen,
    });

    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });
  });

  function renderSidebar() {
    return render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
  }

  test('renders all navigation items', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

test('calls setIsOpen(false) when overlay is clicked', () => {
  const { container } = renderSidebar();  // destructure container here

  // Try to get overlay by role or test id if you have them set (optional fallback)
  const overlay = screen.queryByRole('presentation') || screen.queryByTestId('overlay');

  // Since no role/testid set on overlay, fallback to query by container/class
  const overlayDiv = container.querySelector('div.fixed.inset-0.bg-black\\/50');

  expect(overlayDiv).toBeInTheDocument();

  if (overlayDiv) {
    fireEvent.click(overlayDiv);
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  }
});


  test('calls logout, shows toast, and navigates on logout button click', () => {
    renderSidebar();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('calls setIsOpen(false) on nav link click when window width < 768', () => {
    (window as any).innerWidth = 500;
    renderSidebar();

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  test('does NOT call setIsOpen(false) on nav link click when window width >= 768', () => {
    (window as any).innerWidth = 1024;
    renderSidebar();

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(mockSetIsOpen).not.toHaveBeenCalled();
  });
});
