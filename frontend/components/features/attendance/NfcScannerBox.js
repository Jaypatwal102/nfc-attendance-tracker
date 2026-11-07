'use client';

import React from 'react';
import Button from '@/components/ui/Button';

/**
 * NFC scan simulation and tag input area.
 */
export default function NfcScannerBox({ nfcInput, setNfcInput, onSubmit, isScanning }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-indigo-400/50 dark:border-indigo-500/40 rounded-2xl p-8 text-center space-y-4 shadow-inner transition-colors duration-200">
      <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
        📲
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Tap NFC Card / Tag
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ready for scanning... Enter or tap NFC ID tag below.
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-md mx-auto flex gap-2">
        <input
          type="text"
          value={nfcInput}
          onChange={(e) => setNfcInput(e.target.value)}
          placeholder="e.g. NFC_TAG_MCA001"
          className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition shadow-2xs"
          autoFocus
        />
        <Button
          type="submit"
          disabled={isScanning}
          loading={isScanning}
          className="px-5 py-2.5"
        >
          Simulate Tap
        </Button>
      </form>
    </div>
  );
}

