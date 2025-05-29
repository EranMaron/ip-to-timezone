import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IpRow from '../IpRow';
import { TimeProvider } from '../../context/timeContext';

describe('IpRow component', () => {
  const defaultProps = {
    id: '123',
    index: 1,
    data: {
      ip: '',
      country: '',
      countryCode: '',
      timezone: '',
      isLoading: false,
      error: '',
    },
    handleUpdate: () => { },
    handleRemove: () => { },
  };

  it('renders empty input field', () => {
    render(
      <TimeProvider>
        <IpRow {...defaultProps} />
      </TimeProvider>
    );

    expect(screen.getByTestId('ip-row-label')).toBeInTheDocument();
    expect(screen.getByTestId('ip-input')).toBeInTheDocument();
    expect(screen.getByTestId('remove-button')).toBeInTheDocument();
    expect(screen.getByTestId('ip-row-label')).toHaveTextContent('1');
  });

  it('calls handleRemove when remove button is clicked', async () => {
    const handleRemove = vi.fn();

    const { unmount } = render(
      <TimeProvider>
        <IpRow
          {...defaultProps}
          handleRemove={handleRemove}
        />
      </TimeProvider>
    );

    expect(screen.getByTestId('ip-input')).toBeInTheDocument();

    const removeButton = screen.getByTestId('remove-button');
    await userEvent.click(removeButton);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith('123');

    unmount();

    expect(screen.queryByTestId('ip-input')).not.toBeInTheDocument();
  });

  it('handles valid IP input', async () => {
    const handleUpdate = vi.fn();
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
        query: '192.168.1.1'
      })
    });

    render(
      <TimeProvider>
        <IpRow
          {...defaultProps}
          handleUpdate={handleUpdate}
        />
      </TimeProvider>
    );

    const input = screen.getByTestId('ip-input');
    await userEvent.type(input, '192.168.1.1');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith(
        '123',
        '192.168.1.1',
        'United States',
        'US',
        'America/New_York'
      );
    });
  });

  it('displays error message for invalid IP', async () => {
    const handleUpdate = vi.fn();

    render(
      <TimeProvider>
        <IpRow
          {...defaultProps}
          handleUpdate={handleUpdate}
        />
      </TimeProvider>
    );

    const input = screen.getByTestId('ip-input');
    await userEvent.type(input, '256.256.256.256');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid IP address');
    });

    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('displays loading state while fetching IP data', async () => {
    const handleUpdate = vi.fn();
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    let resolvePromise!: (value: Record<string, unknown>) => void;
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(
      fetchPromise.then(value => ({
        json: () => Promise.resolve(value)
      }))
    );

    render(
      <TimeProvider>
        <IpRow
          {...defaultProps}
          handleUpdate={handleUpdate}
        />
      </TimeProvider>
    );

    const input = screen.getByTestId('ip-input');
    await userEvent.type(input, '8.8.8.8');
    fireEvent.blur(input);

    expect(screen.getByText('Looking up...')).toBeInTheDocument();

    resolvePromise({
      status: 'success',
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/New_York',
      query: '8.8.8.8'
    });

    await waitFor(() => {
      expect(screen.queryByText('Looking up...')).not.toBeInTheDocument();
    });
  });

  it('displays error message when request fails', async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <TimeProvider>
        <IpRow
          {...defaultProps}
          handleUpdate={handleUpdate}
        />
      </TimeProvider>
    );

    const input = screen.getByTestId('ip-input');
    await user.type(input, '8.8.8.8');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
    });

    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it('displays country flag and timezone after successful IP lookup', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
        query: '8.8.8.8'
      })
    });

    render(
      <TimeProvider>
        <IpRow
          {...defaultProps}
          data={{
            ...defaultProps.data,
            country: 'United States',
            countryCode: 'US',
            timezone: 'America/New_York',
            ip: '8.8.8.8'
          }}
        />
      </TimeProvider>
    );

    const flagImg = screen.getByTestId('country-flag');
    expect(flagImg).toBeInTheDocument();
    expect(flagImg).toHaveAttribute('alt', 'United States');
    expect(flagImg).toHaveAttribute('src', expect.stringContaining('us.webp'));

    expect(screen.getByTestId('local-time')).toBeInTheDocument();
  });
});
