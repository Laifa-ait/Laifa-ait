import { describe, it, expect, vi } from 'vitest';
import { normalizeTimestamp, UnifiedTimestamp } from '../utils/date';

describe('normalizeTimestamp', () => {
  it('should return a UnifiedTimestamp when given a Date', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = normalizeTimestamp(date);
    expect(result).toBeInstanceOf(UnifiedTimestamp);
    expect(result.toDate().toISOString()).toBe('2024-01-01T12:00:00.000Z');
  });

  it('should return timestamp equivalent when given a Timestamp-like object', () => {
    const tsLike = {
      toDate: () => new Date('2024-01-01T12:00:00Z'),
      toMillis: () => 1704110400000,
      seconds: 1704110400,
      nanoseconds: 0,
    };
    const result = normalizeTimestamp(tsLike);
    expect(result.toMillis()).toBe(1704110400000);
    expect(result.seconds).toBe(1704110400);
  });

  it('should parse ISO strings into Timestamps', () => {
    const str = '2024-01-01T12:00:00.000Z';
    const result = normalizeTimestamp(str);
    expect(result).toBeInstanceOf(UnifiedTimestamp);
    expect(result.toDate().toISOString()).toBe(str);
  });

  it('should parse milliseconds into Timestamps', () => {
    const ms = 1704110400000; // 2024-01-01T12:00:00.000Z
    const result = normalizeTimestamp(ms);
    expect(result).toBeInstanceOf(UnifiedTimestamp);
    expect(result.toMillis()).toBe(ms);
  });

  it('should parse objects with seconds and nanoseconds', () => {
    const obj = { seconds: 1704110400, nanoseconds: 0 };
    const result = normalizeTimestamp(obj);
    expect(result).toBeInstanceOf(UnifiedTimestamp);
    expect(result.seconds).toBe(1704110400);
  });

  it('should return current time for falsy values', () => {
    vi.useFakeTimers();
    const now = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(now);
    
    const result = normalizeTimestamp(null as unknown as string);
    expect(result.toMillis()).toBe(now.getTime());
    
    vi.useRealTimers();
  });
});
