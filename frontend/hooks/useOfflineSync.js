'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPendingRecords,
  getPendingCount,
  syncOfflineQueue,
  enqueueOfflineAttendance,
  removeOfflineRecord,
  clearOfflineQueue,
} from '@/utils/offlineAttendance';

/**
 * Custom hook to manage offline NFC attendance queuing and synchronization.
 *
 * @param {Object} options
 * @param {string} [options.sessionId] - Active session ID to filter records
 * @param {Function} options.apiSubmitFn - API function to submit attendance records
 * @param {Function} [options.onNotify] - Notification callback ({ message, type })
 */
export function useOfflineSync({ sessionId = null, apiSubmitFn, onNotify = null }) {
  const [pendingScans, setPendingScans] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshPending = useCallback(() => {
    const list = getPendingRecords(sessionId);
    setPendingScans(list);
  }, [sessionId]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  const sync = useCallback(async () => {
    if (isSyncing || !apiSubmitFn) return;
    setIsSyncing(true);

    if (onNotify) {
      onNotify({
        message: 'Synchronizing saved attendance records with the server...',
        type: 'info',
      });
    }

    try {
      const result = await syncOfflineQueue(apiSubmitFn, sessionId);
      refreshPending();

      if (onNotify) {
        if (result.synced > 0 && result.failed === 0) {
          onNotify({
            message: `Successfully synchronized ${result.synced} attendance record(s)!`,
            type: 'success',
          });
        } else if (result.synced > 0 && result.failed > 0) {
          onNotify({
            message: `Synchronized ${result.synced} record(s). ${result.failed} remain safely stored on this device.`,
            type: 'warning',
          });
        } else if (result.failed > 0) {
          onNotify({
            message: 'Unable to reach the server. Saved records remain safe on your device.',
            type: 'error',
          });
        } else {
          onNotify({ message: 'All attendance records are up to date.', type: 'info' });
        }
      }

      return result;
    } catch (err) {
      if (onNotify) {
        onNotify({
          message: 'Sync interrupted. Your local attendance records are safe and will be retried.',
          type: 'error',
        });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, apiSubmitFn, sessionId, refreshPending, onNotify]);

  // Automatically trigger sync when the device reconnects to internet
  useEffect(() => {
    const handleOnline = () => {
      const count = getPendingCount(sessionId);
      if (count > 0) {
        sync();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [sessionId, sync]);

  const queueRecord = useCallback(
    ({ nfc_id, session_id, extra }) => {
      const result = enqueueOfflineAttendance({
        nfc_id,
        session_id: session_id || sessionId,
        extra,
      });
      refreshPending();
      return result;
    },
    [sessionId, refreshPending]
  );

  return {
    pendingScans,
    pendingCount: pendingScans.length,
    isSyncing,
    sync,
    refreshPending,
    queueRecord,
    removeRecord: (id) => {
      removeOfflineRecord(id);
      refreshPending();
    },
    clearAll: () => {
      clearOfflineQueue(sessionId);
      refreshPending();
    },
  };
}

export default useOfflineSync;

