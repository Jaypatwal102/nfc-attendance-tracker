'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

/**
 * Notice banner and expandable drawer for locally preserved offline attendance records.
 */
export default function OfflineSyncDrawer({ pendingScans = [], isSyncing, onSync }) {
  const [showDrawer, setShowDrawer] = useState(false);

  if (pendingScans.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {pendingScans.length} Attendance Scan(s) Saved Locally
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Your data is preserved safely on this device and will upload once connection is stable.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowDrawer(!showDrawer)}
            className="px-3 py-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:hover:bg-amber-900 dark:text-amber-200 text-xs font-medium transition"
          >
            {showDrawer ? 'Hide Details' : 'View Details'}
          </button>
          <Button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            loading={isSyncing}
            size="sm"
          >
            Sync Now 🔄
          </Button>
        </div>
      </div>

      {/* Expandable Details Drawer */}
      {showDrawer && (
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm animate-fade-in">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            Locally Stored Unsynchronized Attendance
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-48 overflow-y-auto">
            {pendingScans.map((scan) => (
              <div key={scan.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    NFC Tag: {scan.nfc_id}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">
                    Saved at {new Date(scan.queuedAt).toLocaleTimeString()}
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Awaiting Sync
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

