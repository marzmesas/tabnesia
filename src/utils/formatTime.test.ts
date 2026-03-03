import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTime } from './formatTime';

describe('formatTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Xm ago" when less than 60 minutes', () => {
    const thirtyMinsAgo = new Date('2025-06-15T11:30:00.000Z').getTime();
    expect(formatTime(thirtyMinsAgo)).toBe('30m ago');
  });

  it('returns "Xh ago" when less than 24 hours', () => {
    const twoHoursAgo = new Date('2025-06-15T10:00:00.000Z').getTime();
    expect(formatTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns "Xd ago" when 24 hours or more', () => {
    const threeDaysAgo = new Date('2025-06-12T12:00:00.000Z').getTime();
    expect(formatTime(threeDaysAgo)).toBe('3d ago');
  });

  it('handles just under 60 minutes', () => {
    const fiftyNineMinsAgo = new Date('2025-06-15T11:01:00.000Z').getTime();
    expect(formatTime(fiftyNineMinsAgo)).toBe('59m ago');
  });

  it('handles exactly 1 hour', () => {
    const oneHourAgo = new Date('2025-06-15T11:00:00.000Z').getTime();
    expect(formatTime(oneHourAgo)).toBe('1h ago');
  });

  it('handles just under 24 hours', () => {
    const twentyThreeHoursAgo = new Date('2025-06-14T13:00:00.000Z').getTime();
    expect(formatTime(twentyThreeHoursAgo)).toBe('23h ago');
  });
});
