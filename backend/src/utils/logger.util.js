/**
 * Centralized Server Logger
 * Provides sanitized, structured error and info logging.
 * Never logs passwords, tokens, or sensitive student PII.
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'authorization',
  'refreshtoken',
  'creditcard',
  'pin',
]);

/**
 * Recursively sanitizes an object to mask sensitive fields.
 */
function sanitizeData(data, depth = 0) {
  if (depth > 4 || !data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const logger = {
  info(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(sanitizeData(meta)) : '');
  },

  warn(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, Object.keys(meta).length ? JSON.stringify(sanitizeData(meta)) : '');
  },

  error(message, error = null, meta = {}) {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = sanitizeData(meta);

    console.error(`[${timestamp}] [ERROR] ${message}`);
    if (Object.keys(sanitizedMeta).length) {
      console.error('  Context:', JSON.stringify(sanitizedMeta));
    }

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('  Stack:', error.stack || error.message || error);
      } else {
        console.error('  Details:', error.message || error);
      }
    }
  },

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [DEBUG] ${message}`, Object.keys(meta).length ? JSON.stringify(sanitizeData(meta)) : '');
    }
  },
};

module.exports = logger;

