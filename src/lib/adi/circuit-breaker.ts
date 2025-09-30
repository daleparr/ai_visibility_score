/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by monitoring external service calls
 * and temporarily disabling calls to failing services.
 * 
 * States:
 * - CLOSED: Normal operation, calls pass through
 * - OPEN: Service is failing, calls are blocked
 * - HALF_OPEN: Testing if service has recovered
 */

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening
  recoveryTimeout: number // Time to wait before trying again (ms)
  monitoringWindow: number // Time window for failure counting (ms)
  successThreshold: number // Successes needed to close from half-open
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: number
  successes: number
  lastFailureTime: number
  lastSuccessTime: number
  nextAttemptTime: number
}

export class CircuitBreaker {
  private state: CircuitBreakerState
  private config: CircuitBreakerConfig
  private name: string

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name
    this.config = {
      failureThreshold: 3,
      recoveryTimeout: 30000, // 30 seconds
      monitoringWindow: 60000, // 1 minute
      successThreshold: 2,
      ...config
    }

    this.state = {
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      nextAttemptTime: 0
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.shouldReject()) {
      throw new Error(`Circuit breaker ${this.name} is OPEN - service unavailable`)
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Check if the circuit breaker should reject the call
   */
  private shouldReject(): boolean {
    const now = Date.now()

    switch (this.state.state) {
      case 'CLOSED':
        return false

      case 'OPEN':
        if (now >= this.state.nextAttemptTime) {
          this.state.state = 'HALF_OPEN'
          this.state.successes = 0
          console.log(`🔄 Circuit breaker ${this.name} transitioning to HALF_OPEN`)
          return false
        }
        return true

      case 'HALF_OPEN':
        return false

      default:
        return false
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    const now = Date.now()
    this.state.lastSuccessTime = now

    switch (this.state.state) {
      case 'CLOSED':
        // Reset failure count on success
        this.state.failures = 0
        break

      case 'HALF_OPEN':
        this.state.successes++
        if (this.state.successes >= this.config.successThreshold) {
          this.state.state = 'CLOSED'
          this.state.failures = 0
          this.state.successes = 0
          console.log(`✅ Circuit breaker ${this.name} CLOSED - service recovered`)
        }
        break
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const now = Date.now()
    this.state.lastFailureTime = now
    this.state.failures++

    switch (this.state.state) {
      case 'CLOSED':
        if (this.state.failures >= this.config.failureThreshold) {
          this.openCircuit()
        }
        break

      case 'HALF_OPEN':
        this.openCircuit()
        break
    }
  }

  /**
   * Open the circuit breaker
   */
  private openCircuit(): void {
    this.state.state = 'OPEN'
    this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    console.log(`⚡ Circuit breaker ${this.name} OPENED after ${this.state.failures} failures`)
  }

  /**
   * Get current circuit breaker status
   */
  getStatus(): {
    name: string
    state: string
    failures: number
    successes: number
    isHealthy: boolean
    nextAttemptIn?: number
  } {
    const now = Date.now()
    const nextAttemptIn = this.state.state === 'OPEN' 
      ? Math.max(0, this.state.nextAttemptTime - now)
      : undefined

    return {
      name: this.name,
      state: this.state.state,
      failures: this.state.failures,
      successes: this.state.successes,
      isHealthy: this.state.state === 'CLOSED',
      nextAttemptIn
    }
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = {
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      nextAttemptTime: 0
    }
    console.log(`🔄 Circuit breaker ${this.name} manually reset`)
  }

  /**
   * Force open the circuit breaker (for maintenance)
   */
  forceOpen(): void {
    this.state.state = 'OPEN'
    this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    console.log(`🔒 Circuit breaker ${this.name} manually opened`)
  }
}

/**
 * Circuit Breaker Manager - manages multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map()

  /**
   * Get or create a circuit breaker
   */
  getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config))
    }
    return this.breakers.get(name)!
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    breakerName: string, 
    fn: () => Promise<T>, 
    config?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const breaker = this.getBreaker(breakerName, config)
    return breaker.execute(fn)
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus(): Array<ReturnType<CircuitBreaker['getStatus']>> {
    return Array.from(this.breakers.values()).map(breaker => breaker.getStatus())
  }

  /**
   * Get status of healthy circuit breakers
   */
  getHealthyBreakers(): string[] {
    return Array.from(this.breakers.values())
      .filter(breaker => breaker.getStatus().isHealthy)
      .map(breaker => breaker.getStatus().name)
  }

  /**
   * Get status of unhealthy circuit breakers
   */
  getUnhealthyBreakers(): string[] {
    return Array.from(this.breakers.values())
      .filter(breaker => !breaker.getStatus().isHealthy)
      .map(breaker => breaker.getStatus().name)
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset()
    }
    console.log('🔄 All circuit breakers reset')
  }

  /**
   * Reset a specific circuit breaker
   */
  reset(name: string): void {
    const breaker = this.breakers.get(name)
    if (breaker) {
      breaker.reset()
    }
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager()

/**
 * Decorator for automatic circuit breaker protection
 */
export function withCircuitBreaker(
  breakerName: string, 
  config?: Partial<CircuitBreakerConfig>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return circuitBreakerManager.execute(
        breakerName,
        () => method.apply(this, args),
        config
      )
    }

    return descriptor
  }
}

/**
 * Utility function for wrapping external API calls
 */
export async function withCircuitBreakerProtection<T>(
  serviceName: string,
  apiCall: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  return circuitBreakerManager.execute(serviceName, apiCall, config)
}
