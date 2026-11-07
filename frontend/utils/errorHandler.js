/**
 * Centralized Frontend Error Handling Utility
 * Normalizes API errors, suppresses raw technical stack traces/Prisma/SQL errors,
 * and provides clear, human-readable user messages.
 */

const RAW_TECHNICAL_PATTERNS = [
  /axioserror/i,
  /typeerror/i,
  /prismaclient/i,
  /prisma/i,
  /network\s*error/i,
  /internal\s*server\s*error/i,
  /database/i,
  /connection\s*pool/i,
  /econnrefused/i,
  /connect_timeout/i,
  /pool_timeout/i,
  /syntaxerror/i,
  /foreign\s*key/i,
  /unique\s*constraint/i,
  /at\s+[a-z0-9_.]+\s+\(/i, // stack trace lines
  /object\s+object/i,
  /undefined/i,
  /null/i,
  /\[object\s+promise\]/i,
];

/**
 * Checks whether a given message string contains raw technical/debugging output.
 */
export function isRawTechnicalMessage(str) {
  if (!str || typeof str !== 'string') return true;
  return RAW_TECHNICAL_PATTERNS.some((pattern) => pattern.test(str));
}

/**
 * Extracts a clean, user-friendly message from any error object.
 *
 * @param {any} error - Caught error (AxiosError, Error, string, etc.)
 * @param {string} [contextualDefault] - Optional context-specific fallback (e.g. "Unable to load student directory.")
 * @returns {string} - Clean user-facing error message
 */
export function getErrorMessage(error, contextualDefault = null) {
  if (!error) {
    return contextualDefault || 'Something went wrong. Please try again.';
  }

  // 1. Direct string errors
  if (typeof error === 'string') {
    if (!isRawTechnicalMessage(error)) {
      return error;
    }
    return contextualDefault || 'Something went wrong. Please try again.';
  }

  // 2. Network connection drops or timeouts
  if (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    (!error.response && error.request)
  ) {
    return 'Unable to connect. Please check your internet connection.';
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // 3. HTTP Response errors
  if (error.response) {
    const status = error.response.status;
    const serverMessage =
      error.response.data?.error?.message ||
      error.response.data?.message ||
      error.response.data?.error;

    // Check if the server returned a clean, user-facing error message
    if (typeof serverMessage === 'string' && serverMessage.trim() && !isRawTechnicalMessage(serverMessage)) {
      return serverMessage.trim();
    }

    // Status code-specific user-friendly fallbacks
    switch (status) {
      case 400:
        return contextualDefault || 'Please check the entered information and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested information could not be found.';
      case 409:
        return 'A record with this information already exists.';
      case 422:
        return 'Validation failed. Please verify the submitted information.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Something went wrong on our end. Please try again later.';
      default:
        break;
    }
  }

  // 4. Fallback to contextual default or standard friendly error
  if (contextualDefault) {
    return contextualDefault;
  }

  if (error.message && typeof error.message === 'string' && !isRawTechnicalMessage(error.message)) {
    return error.message;
  }

  return 'Something went wrong. Please try again later.';
}

/**
 * Logs errors in development only. Suppresses noise and stack traces in production builds.
 */
export function logDevError(context, error) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[DEV ERROR] [${context}]:`, error);
  }
}

/**
 * Helper to check if an error is an authentication/authorization expiration.
 */
export function isAuthError(error) {
  return error?.response?.status === 401;
}

/**
 * Helper to check if an error is a network connectivity failure.
 */
export function isNetworkError(error) {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    (!error?.response && error?.request)
  );
}

