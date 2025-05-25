import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentEventsCard from './RecentEventsCard';

describe('RecentEventsCard', () => {
  it('renders all events with correct details', () => {
    render(<RecentEventsCard />);

    // Check that "Backyard Camera" appears twice
    const backyardCameras = screen.getAllByText('Backyard Camera');
    expect(backyardCameras).toHaveLength(2);

    // Check other single occurrences with getByText
    expect(screen.getByText(/person detected/i)).toBeInTheDocument();
    expect(screen.getByText(/motion detected/i)).toBeInTheDocument();
    expect(screen.getByText(/vehicle detected/i)).toBeInTheDocument();
    expect(screen.getByText(/package detected/i)).toBeInTheDocument();
    expect(screen.getByText('Kitchen Camera')).toBeInTheDocument();
    expect(screen.getByText('Front Door Camera')).toBeInTheDocument();

    // Check confidence percentages
    expect(screen.getByText('89% confidence')).toBeInTheDocument();
    expect(screen.getByText('76% confidence')).toBeInTheDocument();
    expect(screen.getByText('92% confidence')).toBeInTheDocument();
    expect(screen.getByText('84% confidence')).toBeInTheDocument();

    // Check times
   expect(screen.getByText(/05:22 PM/)).toBeInTheDocument();
expect(screen.getByText(/04:45 PM/)).toBeInTheDocument();
expect(screen.getByText(/03:30 PM/)).toBeInTheDocument();
expect(screen.getByText(/01:15 PM/)).toBeInTheDocument();

  });
});
