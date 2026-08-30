import { safeLogger } from "../logger";

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures to trip
  threshold?: number;        // Alias for failureThreshold
  resetTimeoutMs?: number;   // Time in open before half-open probe
  timeout?: number;          // Alias for resetTimeoutMs
  halfOpenMaxProbes?: number;
}

export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures: number = 0;
  private lastFailureTime: number = 0;
  private consecutiveSuccesses: number = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenMaxProbes: number;

  constructor(name = "default", options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || options.threshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || options.timeout || 30000;
    this.halfOpenMaxProbes = options.halfOpenMaxProbes || 2;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.consecutiveSuccesses = 0;
        safeLogger.warn(`[CircuitBreaker:${this.name}] 🟡 Circuit transitioning from OPEN to HALF_OPEN probe state`);
      }
    }
    return this.state;
  }

  public recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= this.halfOpenMaxProbes) {
        this.state = CircuitState.CLOSED;
        this.consecutiveFailures = 0;
        safeLogger.info(`[CircuitBreaker:${this.name}] 🟢 Circuit closed: downstream service recovered.`);
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.consecutiveFailures = 0;
    }
  }

  public recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN || this.consecutiveFailures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      safeLogger.error(`[CircuitBreaker:${this.name}] 🔴 Circuit OPENED: downstream service failing. Fast-failing requests.`, {
        consecutiveFailures: this.consecutiveFailures,
        threshold: this.failureThreshold,
      });
    }
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = 0;
  }

  public async execute<T>(fn: () => Promise<T>, key = "global"): Promise<T> {
    if (this.getState() === CircuitState.OPEN) {
      throw new Error(`Circuit breaker is OPEN for key: ${key}`);
    }
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}

export const authBreaker = new CircuitBreaker("AuthService", { failureThreshold: 5, resetTimeoutMs: 30000 });
export const orderBreaker = new CircuitBreaker("OrderService", { failureThreshold: 5, resetTimeoutMs: 30000 });
export const catalogBreaker = new CircuitBreaker("CatalogService", { failureThreshold: 5, resetTimeoutMs: 30000 });
export const firestoreBreaker = orderBreaker;
export const googleCircuitBreaker = new CircuitBreaker("GoogleWorkspace", { failureThreshold: 4, resetTimeoutMs: 25000 });
export const geminiCircuitBreaker = new CircuitBreaker("GeminiAI", { failureThreshold: 5, resetTimeoutMs: 30000 });
