const { Resend } = require('resend');
const logger = require('../utils/logger.util');

/**
 * Resend Email Service Configuration
 * Provides client initialization and sender resolution from environment variables.
 */

const DEFAULT_SENDER = 'NFC Attendance Tracker <alerts@buildwithjp.me>';

/**
 * Retrieves the configured sender email address.
 * Priority: RESEND_FROM_EMAIL -> EMAIL_FROM -> DEFAULT_SENDER
 * @returns {string}
 */
function getSenderEmail() {
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
  if (!from || from.trim() === '' || from.includes('your_verified_sender_email')) {
    return DEFAULT_SENDER;
  }
  return from.trim();
}

/**
 * Checks whether a valid Resend API key is configured.
 * @returns {boolean}
 */
function isResendConfigured() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === '' ||
    trimmed === 'your_new_resend_api_key' ||
    trimmed === 'your_resend_api_key_here' ||
    trimmed === 're_demo_key_placeholder'
  ) {
    return false;
  }
  return trimmed.startsWith('re_');
}

/**
 * Creates or retrieves a Resend client instance.
 * Returns null if the API key is not configured or is a placeholder.
 * @returns {Resend|null}
 */
function getResendClient() {
  if (!isResendConfigured()) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY.trim());
}

/**
 * Optional test recipient override for development when using onboarding@resend.dev.
 * Unset when using a verified custom domain so emails go directly to each student.
 * @returns {string|null}
 */
function getTestRecipient() {
  const recipient = process.env.RESEND_TEST_RECIPIENT;
  if (recipient && recipient.trim() !== '' && recipient.includes('@')) {
    return recipient.trim();
  }
  return null;
}

module.exports = {
  getResendClient,
  getSenderEmail,
  getTestRecipient,
  isResendConfigured,
  DEFAULT_SENDER,
};

