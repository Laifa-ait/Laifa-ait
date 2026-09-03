export interface TimestampLike {
  toDate?: () => Date;
  toMillis?: () => number;
  seconds?: number;
  nanoseconds?: number;
}

export type AppTimestamp = TimestampLike | Date | string | number | null | undefined;

export class UnifiedTimestamp {
  readonly seconds: number;
  readonly nanoseconds: number;

  constructor(seconds: number, nanoseconds = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000));
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000);
  }

  toISOString(): string {
    return this.toDate().toISOString();
  }

  static now(): UnifiedTimestamp {
    return UnifiedTimestamp.fromMillis(Date.now());
  }

  static fromDate(date: Date): UnifiedTimestamp {
    return UnifiedTimestamp.fromMillis(date.getTime());
  }

  static fromMillis(millis: number): UnifiedTimestamp {
    const seconds = Math.floor(millis / 1000);
    const nanoseconds = (millis % 1000) * 1000000;
    return new UnifiedTimestamp(seconds, nanoseconds);
  }
}

export function normalizeTimestamp(input: AppTimestamp): UnifiedTimestamp {
  if (!input) return UnifiedTimestamp.now();
  if (input instanceof Date) return UnifiedTimestamp.fromDate(input);
  if (typeof input === 'string') {
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? UnifiedTimestamp.now() : UnifiedTimestamp.fromDate(parsed);
  }
  if (typeof input === 'number') return UnifiedTimestamp.fromMillis(input);
  if (typeof input === 'object') {
    const ts = input as TimestampLike;
    if (typeof ts.toMillis === 'function') {
      return UnifiedTimestamp.fromMillis(ts.toMillis());
    }
    if (typeof ts.toDate === 'function') {
      return UnifiedTimestamp.fromDate(ts.toDate());
    }
    if (typeof ts.seconds === 'number') {
      return new UnifiedTimestamp(ts.seconds, ts.nanoseconds || 0);
    }
  }
  return UnifiedTimestamp.now();
}
