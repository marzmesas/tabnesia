import { describe, it, expect } from 'vitest';
import {
  ACTIVE_THRESHOLD_DAYS,
  FORGOTTEN_THRESHOLD_DAYS,
  STALE_CLEANUP_DAYS,
  ACTIVE_THRESHOLD_MS,
  FORGOTTEN_THRESHOLD_MS,
  STALE_CLEANUP_MS,
} from './constants';

describe('constants', () => {
  it('defines active threshold as 5 days', () => {
    expect(ACTIVE_THRESHOLD_DAYS).toBe(5);
  });

  it('defines forgotten threshold as 30 days', () => {
    expect(FORGOTTEN_THRESHOLD_DAYS).toBe(30);
  });

  it('defines stale cleanup as 90 days', () => {
    expect(STALE_CLEANUP_DAYS).toBe(90);
  });

  it('ACTIVE_THRESHOLD_MS equals 5 days in milliseconds', () => {
    const expected = 5 * 24 * 60 * 60 * 1000;
    expect(ACTIVE_THRESHOLD_MS).toBe(expected);
  });

  it('FORGOTTEN_THRESHOLD_MS equals 30 days in milliseconds', () => {
    const expected = 30 * 24 * 60 * 60 * 1000;
    expect(FORGOTTEN_THRESHOLD_MS).toBe(expected);
  });

  it('STALE_CLEANUP_MS equals 90 days in milliseconds', () => {
    const expected = 90 * 24 * 60 * 60 * 1000;
    expect(STALE_CLEANUP_MS).toBe(expected);
  });
});
