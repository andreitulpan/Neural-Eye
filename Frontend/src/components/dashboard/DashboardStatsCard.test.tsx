import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardStatsCard from '@/components/dashboard/DashboardStatsCard';
import { ArrowUp } from 'lucide-react'; // or any icon you want to use

describe('DashboardStatsCard', () => {
  test('renders with required props', () => {
    render(
      <DashboardStatsCard
        title="Active Users"
        value="1500"
        description="Since last week"
        icon={<ArrowUp data-testid="icon" />}
        trend="up"
      />
    );

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('Since last week')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
