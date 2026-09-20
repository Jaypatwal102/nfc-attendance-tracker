'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import Toast from '../../../../components/ui/Toast';
import { teacherApi, attendanceApi } from '../../../../services/api';

export default function TakeAttendancePage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const [activeSession, setActiveSession] = useState(null);
  const [nfcInput, setNfcInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await teacherApi.getAssignments();
        setAssignments(res.data.data);
        if (res.data.data.length > 0) {
          const first = res.data.data[0];
          setSelectedAssignment(`${first.subject.id}|${first.batch.id}`);
        }
      } catch (err) {
        setToast({ message: 'Failed to load assigned subjects and batches.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    const [subjectId, batchId] = selectedAssignment.split('|');

    try {
      const sDate = new Date(`${sessionDate}T${startTime}:00`).toISOString();
      const stTime = new Date(`${sessionDate}T${startTime}:00`).toISOString();
      const edTime = new Date(`${sessionDate}T${endTime}:00`).toISOString();

      const res = await teacherApi.createSession({
        subject_id: subjectId,
        batch_id: batchId,
        session_date: sDate,
        start_time: stTime,
        end_time: edTime,
      });

      setActiveSession(res.data.data);
      setToast({ message: 'Attendance Session created successfully!', type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create attendance session.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleNfcScanSubmit = async (e) => {
    e.preventDefault();
    if (!nfcInput || !activeSession) return;

    setIsScanning(true);
    setScanFeedback(null);

    try {
      const res = await attendanceApi.markNfcAttendance({
        session_id: activeSession.id,
        nfc_id: nfcInput.trim(),
      });

      const data = res.data.data;
      setScanFeedback({
        type: 'success',
        message: data.message,
        alreadyMarked: data.already_marked,
        studentName: data.attendance?.student?.name,
        enrollmentNo: data.attendance?.student?.enrollmentNo,
        markedAt: new Date(data.attendance?.markedAt).toLocaleTimeString(),
      });

      setToast({
        message: data.already_marked
          ? `Already Marked: ${data.attendance?.student?.name}`
          : `Marked Present: ${data.attendance?.student?.name}`,
        type: data.already_marked ? 'warning' : 'success',
      });
      setNfcInput('');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'NFC Scan Rejected';
      setScanFeedback({
        type: 'error',
        message: msg,
      });
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Take Attendance (NFC Scanner)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create an active class session and tap NFC cards or tags to record student attendance.
          </p>
        </div>

        {!activeSession ? (
          /* Step 1: Session Setup Form */
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-700/60 pb-3">
              1. Select Assignment & Schedule Session
            </h3>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject & Batch Assignment
                </label>
                <select
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {assignments.map((a) => (
                    <option key={`${a.subject.id}|${a.batch.id}`} value={`${a.subject.id}|${a.batch.id}`}>
                      {a.subject.course_code} - {a.subject.name} (Batch: {a.batch.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Session Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider transition shadow-md shadow-indigo-600/20"
              >
                Start Active Attendance Session →
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Active Session NFC Scanner Screen */
          <div className="space-y-6">
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    SESSION ACTIVE
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-100">
                  {activeSession.subject?.name} ({activeSession.subject?.courseCode})
                </h2>
                <p className="text-xs text-slate-400">
                  Batch: <strong>{activeSession.batch?.name}</strong> | Date: {new Date(activeSession.sessionDate).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setActiveSession(null)}
                className="px-4 py-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 font-semibold text-xs transition"
              >
                End Session
              </button>
            </div>

            {/* Tap NFC Scan Area & Input Simulator */}
            <div className="bg-slate-900 border-2 border-dashed border-indigo-500/40 rounded-2xl p-8 text-center space-y-4 shadow-inner">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-500/10">
                📲
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Tap NFC Card / Tag</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ready for scanning... Enter or tap NFC ID tag below.
                </p>
              </div>

              <form onSubmit={handleNfcScanSubmit} className="max-w-md mx-auto flex gap-2">
                <input
                  type="text"
                  value={nfcInput}
                  onChange={(e) => setNfcInput(e.target.value)}
                  placeholder="e.g. NFC_TAG_MCA001"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition"
                >
                  {isScanning ? 'Scanning...' : 'Simulate Tap'}
                </button>
              </form>
            </div>

            {/* Feedback Card */}
            {scanFeedback && (
              <div
                className={`p-5 rounded-xl border ${
                  scanFeedback.type === 'success'
                    ? scanFeedback.alreadyMarked
                      ? 'bg-amber-950/70 border-amber-800/80 text-amber-200'
                      : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/70 border-rose-800/80 text-rose-200'
                } transition animate-fade-in`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {scanFeedback.type === 'success' ? (scanFeedback.alreadyMarked ? '⚠️' : '✅') : '❌'}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold">{scanFeedback.message}</h4>
                    {scanFeedback.studentName && (
                      <p className="text-xs mt-0.5 opacity-90">
                        Student: <strong>{scanFeedback.studentName}</strong> ({scanFeedback.enrollmentNo}) | Marked at {scanFeedback.markedAt}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
