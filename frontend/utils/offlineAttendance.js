/**
 * Offline Attendance Queue Manager
 * Ensures that NFC attendance scans are never silently discarded during network or server outages.
 * Preserves pending records locally, prevents duplicate submissions, and supports auto/manual retry.
 */

const STORAGE_KEY = 'nfc_offline_attendance_queue';

/**
 * Safely retrieves the current offline attendance queue from localStorage.
 * @returns {Array<Object>} List of queued attendance records.
 */
export function getOfflineQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse offline attendance queue from localStorage:', err);
    return [];
  }
}

/**
 * Persists the offline queue to localStorage.
 * @param {Array<Object>} queue
 */
function saveOfflineQueue(queue) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to persist offline attendance queue:', err);
  }
}

/**
 * Queues an attendance scan locally when backend submission fails.
 * Prevents duplicate queued scans for the same NFC tag in the same session.
 *
 * @param {Object} params
 * @param {string} params.nfc_id - The NFC tag identifier
 * @param {string} params.session_id - The active session ID
 * @param {Object} [params.extra] - Optional metadata (e.g. subjectName, studentName)
 * @returns {{ success: boolean, alreadyQueued: boolean, record: Object, message: string }}
 */
export function enqueueOfflineAttendance({ nfc_id, session_id, extra = {} }) {
  if (!nfc_id || !session_id) {
    return {
      success: false,
      alreadyQueued: false,
      record: null,
      message: 'Invalid attendance parameters.',
    };
  }

  const queue = getOfflineQueue();

  // Check for existing pending scan in this session
  const existing = queue.find(
    (item) => item.nfc_id === nfc_id.trim() && item.session_id === session_id
  );

  if (existing) {
    return {
      success: true,
      alreadyQueued: true,
      record: existing,
      message: 'Attendance already saved locally on this device. It will sync automatically.',
    };
  }

  const record = {
    id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    nfc_id: nfc_id.trim(),
    session_id,
    extra,
    queuedAt: new Date().toISOString(),
    attempts: 0,
    status: 'pending', // 'pending' | 'syncing' | 'failed'
  };

  queue.push(record);
  saveOfflineQueue(queue);

  return {
    success: true,
    alreadyQueued: false,
    record,
    message: 'Attendance saved on this device. It will sync when your internet connection is available.',
  };
}

/**
 * Removes a specific record from the offline queue after successful backend confirmation.
 * @param {string} recordId
 */
export function removeOfflineRecord(recordId) {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== recordId);
  saveOfflineQueue(filtered);
}

/**
 * Returns all pending unsynced records, optionally filtered by session.
 * @param {string} [sessionId]
 * @returns {Array<Object>}
 */
export function getPendingRecords(sessionId = null) {
  const queue = getOfflineQueue();
  if (!sessionId) return queue;
  return queue.filter((item) => item.session_id === sessionId);
}

/**
 * Returns count of pending unsynced records.
 * @param {string} [sessionId]
 * @returns {number}
 */
export function getPendingCount(sessionId = null) {
  return getPendingRecords(sessionId).length;
}

/**
 * Clears all queued records for a specific session or entirely.
 * @param {string} [sessionId]
 */
export function clearOfflineQueue(sessionId = null) {
  if (!sessionId) {
    saveOfflineQueue([]);
  } else {
    const queue = getOfflineQueue();
    const remaining = queue.filter((item) => item.session_id !== sessionId);
    saveOfflineQueue(remaining);
  }
}

/**
 * Synchronizes pending offline attendance records with the backend API.
 * Only deletes records from the local queue AFTER the backend confirms success.
 *
 * @param {Function} apiSubmitFn - Async function (data) => Promise
 * @param {string} [sessionId] - Optional session filter
 * @returns {Promise<{ total: number, synced: number, failed: number, results: Array }>}
 */
export async function syncOfflineQueue(apiSubmitFn, sessionId = null) {
  const pending = getPendingRecords(sessionId);
  if (pending.length === 0) {
    return { total: 0, synced: 0, failed: 0, results: [] };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const results = [];

  for (const item of pending) {
    try {
      const res = await apiSubmitFn({
        nfc_id: item.nfc_id,
        session_id: item.session_id,
      });

      // Backend confirmed attendance recorded or already marked
      removeOfflineRecord(item.id);
      syncedCount += 1;
      results.push({
        id: item.id,
        nfc_id: item.nfc_id,
        status: 'synced',
        data: res?.data?.data || null,
      });
    } catch (err) {
      failedCount += 1;
      // Increment attempt counter in local storage
      const currentQueue = getOfflineQueue();
      const target = currentQueue.find((q) => q.id === item.id);
      if (target) {
        target.attempts = (target.attempts || 0) + 1;
        target.lastError = err?.friendlyMessage || err?.message || 'Sync failed';
        target.lastAttemptAt = new Date().toISOString();
        saveOfflineQueue(currentQueue);
      }

      results.push({
        id: item.id,
        nfc_id: item.nfc_id,
        status: 'failed',
        error: err?.friendlyMessage || 'Unable to sync attendance record',
      });

      // If connection is dropped or server unavailable, halt batch to prevent cascading timeouts
      if (err?.code === 'ERR_NETWORK' || !err?.response || err?.response?.status >= 500) {
        break;
      }
    }
  }

  return {
    total: pending.length,
    synced: syncedCount,
    failed: failedCount,
    results,
  };
}

