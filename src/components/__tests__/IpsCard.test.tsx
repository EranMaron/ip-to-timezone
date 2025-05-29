import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IpsCard } from '../IpsCard';
import { TimeProvider } from '../../context/timeContext';

describe('IpsCard component', () => {
  it('renders empty state correctly', () => {
    render(
      <TimeProvider>
        <IpsCard />
      </TimeProvider>
    );

    expect(screen.getByTestId('ip-card')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('sync-button')).toBeInTheDocument();
    expect(screen.getByTestId('initial-message')).toBeInTheDocument();
  });

  it('adds a new row when clicking Add button', async () => {
    const user = userEvent.setup();

    render(
      <TimeProvider>
        <IpsCard />
      </TimeProvider>
    );

    expect(screen.queryByTestId('ip-input')).not.toBeInTheDocument();

    const addButton = screen.getByTestId('add-button');
    await user.click(addButton);

    expect(screen.getByTestId('ip-input')).toBeInTheDocument();
    expect(screen.getByTestId('ip-row-label')).toHaveTextContent('1');

    expect(screen.queryByTestId('initial-message')).not.toBeInTheDocument();
  });

  it('syncs multiple IPs successfully', async () => { });
});