import { createConsola } from "consola";

// Create logger instance with configuration
// Map string levels to Consola numeric levels used earlier in the codebase
function mapLevel(l?: string | number | null): number {
  if (typeof l === 'number') return l;
  const s = String(l || '').toLowerCase();
  switch (s) {
    case 'trace':
      return 5;
    case 'debug':
      return 4;
    case 'info':
      return 3;
    case 'warn':
      return 2;
    case 'error':
      return 1;
    case 'fatal':
      return 0;
    default:
      return 2; // default to warn
  }
}

const envLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
// Respect explicit VITE_LOG_LEVEL when provided (even during DEV).
// Fallback: debug in DEV, warn in production.
const defaultLevel = envLevel ? mapLevel(envLevel) : (process.env.NODE_ENV === 'development' ? 4 : 1);

export const logger = createConsola({
  level: defaultLevel,
  formatOptions: {
    date: true,
    colors: true,
  },
});

// Utility class for structured logging with common patterns
export class Logger {
  /**
   * Wraps async operations with automatic logging
   */
  static async withTryCatch<T>(
    operation: () => Promise<T>,
    context: string,
    meta?: Record<string, any>,
  ): Promise<T> {
    try {
      logger.start(`Starting ${context}`, meta);
      const startTime = Date.now();

      const result = await operation();

      const duration = Date.now() - startTime;
      logger.success(`Completed ${context} in ${duration}ms`, {
        ...meta,
        duration,
      });

      return result;
    } catch (error) {
      logger.error(`Failed ${context}`, error, meta);
      throw error; // Re-throw to maintain error flow
    }
  }

  /**
   * Wraps sync operations with automatic logging
   */
  static withTryCatchSync<T>(
    operation: () => T,
    context: string,
    meta?: Record<string, any>,
  ): T {
    try {
      logger.start(`Starting ${context}`, meta);
      const result = operation();
      logger.success(`Completed ${context}`, meta);
      return result;
    } catch (error) {
      logger.error(`Failed ${context}`, error, meta);
      throw error;
    }
  }

  // Direct logging methods
  static info(message: string, ...args: any[]) {
    logger.info(message, ...args);
  }

  static error(message: string, error?: unknown, meta?: Record<string, any>) {
    logger.error(message, error, meta);
  }

  static warn(message: string, ...args: any[]) {
    logger.warn(message, ...args);
  }

  static debug(message: string, ...args: any[]) {
    logger.debug(message, ...args);
  }

  static success(message: string, ...args: any[]) {
    logger.success(message, ...args);
  }
}
