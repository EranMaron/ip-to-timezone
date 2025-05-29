import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TimeProvider, useTime, useTimeControl } from '../timeContext';
import React from 'react';

describe('Time Context', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date('2024-01-01T00:00:00.000Z'),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('Time Context Integration', () => {
    it('creates an interval when startInterval is called', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(() => useTimeControl(), { wrapper });

      // Initially there should be no intervals
      expect(vi.getTimerCount()).toBe(0);

      // Start the interval
      result.current.startInterval();

      // Now there should be one interval
      expect(vi.getTimerCount()).toBe(1);
    });

    it('clears the interval when stopInterval is called', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(() => useTimeControl(), { wrapper });

      // Start the interval
      result.current.startInterval();
      expect(vi.getTimerCount()).toBe(1);

      // Stop the interval
      result.current.stopInterval();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('shares the same interval across multiple consumers', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      // Render both hooks within the same wrapper instance
      const { result } = renderHook(
        () => ({
          consumer1: useTimeControl(),
          consumer2: useTimeControl()
        }),
        { wrapper }
      );

      // Start interval from first consumer
      result.current.consumer1.startInterval();
      expect(vi.getTimerCount()).toBe(1);

      // Start interval from second consumer
      result.current.consumer2.startInterval();
      expect(vi.getTimerCount()).toBe(1); // Should remain 1

      // Stop interval from first consumer
      result.current.consumer1.stopInterval();
      expect(vi.getTimerCount()).toBe(0);

      // Verify second consumer can't restart the interval
      result.current.consumer2.startInterval();
      expect(vi.getTimerCount()).toBe(1);
    });

    it('cleans up interval when component unmounts', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result, unmount } = renderHook(() => useTimeControl(), { wrapper });

      // Start the interval
      result.current.startInterval();
      expect(vi.getTimerCount()).toBe(1);

      // Unmount the component
      unmount();

      // Interval should be cleared
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('throws error when useTime is used outside provider', () => {
      expect(() => {
        renderHook(() => useTime());
      }).toThrow('useTime must be used within a TimeProvider');
    });

    it('throws error when useTimeControl is used outside provider', () => {
      expect(() => {
        renderHook(() => useTimeControl());
      }).toThrow('useTimeControl must be used within a TimeProvider');
    });
  });

  describe('Time Updates', () => {
    it('maintains the same time across multiple consumers', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(
        () => ({
          consumer1: useTime(),
          consumer2: useTime()
        }),
        { wrapper }
      );

      // Both consumers should have the same time
      expect(result.current.consumer1.getTime()).toBe(result.current.consumer2.getTime());
    });

    it('stops updating time when interval is stopped', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(
        () => ({
          time: useTime(),
          control: useTimeControl()
        }),
        { wrapper }
      );

      // Start the interval
      result.current.control.startInterval();

      // Get time after first update
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      const timeAfterStart = result.current.time.getTime();

      // Stop the interval
      result.current.control.stopInterval();

      // Advance time again
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Time should not have updated
      expect(result.current.time.getTime()).toBe(timeAfterStart);
    });
  });

  describe('useTime Hook', () => {
    it('returns current time initially', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(() => useTime(), { wrapper });

      expect(result.current).toBeInstanceOf(Date);
      expect(result.current.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('updates time value when interval is running', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(
        () => ({
          time: useTime(),
          control: useTimeControl()
        }),
        { wrapper }
      );

      const initialTime = result.current.time.getTime();
      result.current.control.startInterval();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.time.getTime()).toBe(initialTime + 1000);
    });

    it('maintains consistent time updates at 1-second intervals', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(
        () => ({
          time: useTime(),
          control: useTimeControl()
        }),
        { wrapper }
      );

      const initialTime = result.current.time.getTime();
      result.current.control.startInterval();

      // Check multiple updates
      for (let i = 1; i <= 3; i++) {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
        expect(result.current.time.getTime()).toBe(initialTime + (i * 1000));
      }
    });

    it('preserves time value when interval is stopped', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(
        () => ({
          time: useTime(),
          control: useTimeControl()
        }),
        { wrapper }
      );

      result.current.control.startInterval();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      const timeAfterOneSecond = result.current.time.getTime();

      result.current.control.stopInterval();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.time.getTime()).toBe(timeAfterOneSecond);
    });

    it('handles rapid interval start/stop calls correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TimeProvider>{children}</TimeProvider>
      );

      const { result } = renderHook(
        () => ({
          time: useTime(),
          control: useTimeControl()
        }),
        { wrapper }
      );

      const initialTime = result.current.time.getTime();

      // Rapidly start and stop the interval
      result.current.control.startInterval();
      result.current.control.stopInterval();
      result.current.control.startInterval();

      // Should only have one interval
      expect(vi.getTimerCount()).toBe(1);

      // Time should still update correctly
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.time.getTime()).toBe(initialTime + 1000);
    });
  });
});