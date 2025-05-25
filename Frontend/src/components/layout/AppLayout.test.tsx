import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from './AppLayout';

// Mock Sidebar and Navbar with test ids for easy querying
jest.mock('./Sidebar', () => () => <nav data-testid="sidebar">Sidebar</nav>);
jest.mock('./Navbar', () => () => <header data-testid="navbar">Navbar</header>);

describe('AppLayout', () => {
  test('renders children only on /login page (auth page)', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppLayout>
          <div>Login Page Content</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Content')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
  });

  test('renders Sidebar, Navbar, and children on non-auth pages', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppLayout>
          <div>Dashboard Content</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
