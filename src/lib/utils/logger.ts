/**
 * Centralized logging utility for the AIDI platform
 */

export interface LogContext {
  [key: string]: any
}

export class Logger {
  private context: string

  constructor(context: string = 'AIDI') {
    this.context = context
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.padEnd(5)} [${this.context}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('INFO', message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context))
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('ERROR', message, context))
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context))
    }
  }
}

// Default logger instance
export const logger = new Logger()

// Create logger with specific context
export function createLogger(context: string): Logger {
  return new Logger(context)
}
