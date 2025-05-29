import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLocalTime } from '../useLocalTime';
import { TimeProvider } from '../../context/timeContext';
import * as helpers from '../../utils/helpers';

describe('useLocalTime Hook', () => {
    beforeEach(() => {
        vi.useFakeTimers({
            now: new Date('2024-01-01T00:00:00.000Z'),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllTimers();
    });

    it('returns N/A when no timezone is provided', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TimeProvider>{children}</TimeProvider>
        );

        const { result } = renderHook(() => useLocalTime(), { wrapper });
        expect(result.current).toBe('N/A');
    });

    it('formats time correctly when timezone is provided', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TimeProvider>{children}</TimeProvider>
        );

        const mockFormatTime = vi.spyOn(helpers, 'formatTime');
        mockFormatTime.mockReturnValue('12:00 PM');

        const { result } = renderHook(() => useLocalTime('America/New_York'), { wrapper });

        expect(mockFormatTime).toHaveBeenCalledWith('America/New_York');
        expect(result.current).toBe('12:00 PM');
    });

    it('updates time when context time changes', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <TimeProvider>{children}</TimeProvider>
        );

        const mockFormatTime = vi.spyOn(helpers, 'formatTime');
        mockFormatTime
            .mockReturnValueOnce('12:00 PM')
            .mockReturnValueOnce('12:01 PM');

        const { result, rerender } = renderHook(() => useLocalTime('America/New_York'), { wrapper });

        expect(result.current).toBe('12:00 PM');

        vi.advanceTimersByTime(1000);
        rerender();

        expect(result.current).toBe('12:01 PM');
    });
}); 