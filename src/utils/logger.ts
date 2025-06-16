// Save original console methods
const originalConsole = {
  debug: console.debug,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Configure log levels
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Default log level (can be overridden by environment variable)
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'INFO';

// Override console methods
console.debug = (...args: any[]) => {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.DEBUG) {
    originalConsole.debug('[DEBUG]', ...args);
  }
};

console.log = (...args: any[]) => {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.INFO) {
    originalConsole.log(...args);
  }
};

console.info = (...args: any[]) => {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.INFO) {
    originalConsole.info('[INFO]', ...args);
  }
};

console.warn = (...args: any[]) => {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.WARN) {
    originalConsole.warn('[WARN]', ...args);
  }
};

console.error = (...args: any[]) => {
  if (LOG_LEVELS[LOG_LEVEL] <= LOG_LEVELS.ERROR) {
    originalConsole.error('[ERROR]', ...args);
  }
};

// Export the logger instance
export const logger = {
  debug: console.debug,
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

export default logger;
