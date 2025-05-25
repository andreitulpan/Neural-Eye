import React from 'react';
import { render, screen } from '@testing-library/react';
import DeviceStatusOverview from './DeviceStatusOverview';
import { MemoryRouter } from 'react-router-dom'; // needed for <Link>

// Wrap component with router for tests
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('DeviceStatusOverview', () => {
  it('renders all devices with correct names, locations, statuses, and alerts', () => {
    renderWithRouter(<DeviceStatusOverview />);

    // Check for device names and locations
    expect(screen.getByText('Front Door Camera')).toBeInTheDocument();
    expect(screen.getByText('Entrance')).toBeInTheDocument();

    expect(screen.getByText('Backyard Camera')).toBeInTheDocument();
    expect(screen.getByText('Garden')).toBeInTheDocument();

    expect(screen.getByText('Garage Camera')).toBeInTheDocument();
    expect(screen.getByText('Garage')).toBeInTheDocument();

    // Check alert count for Backyard Camera (alerts=2)
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check alert count for Kitchen Camera (alerts=1)
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check status text (online, offline, warning)
    expect(screen.getAllByText('online').length).toBeGreaterThan(0);
    expect(screen.getAllByText('offline').length).toBeGreaterThan(0);
    expect(screen.getAllByText('warning').length).toBeGreaterThan(0);

    // Check that links have the correct hrefs
    expect(screen.getByRole('link', { name: /Front Door Camera/i })).toHaveAttribute('href', '/stream-view/1');
    expect(screen.getByRole('link', { name: /Backyard Camera/i })).toHaveAttribute('href', '/stream-view/2');
  });
});
