'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Modal from '../../../components/ui/Modal';
import Toast from '../../../components/ui/Toast';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { teacherApi } from '../../../services/api';

export default function LowAttendancePage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [students, setStudents] = useState([]);
  const [threshold, setThreshold] = useState(75);
  const [loading, setLoading] = useState(true);

  // Email action state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const fetchLowAttendance = async () => {
    if (!selectedAssignment) return;
    const [subjectId, batchId] = selectedAssignment.split('|');

    setLoading(true);
    try {
      const res = await teacherApi.getLowAttendance({
        subject_id: subjectId,
        batch_id: batchId,
        threshold,
      });
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowAttendance();
  }, [selectedAssignment, threshold]);

  const handleSendEmails = async () => {
    if (!selectedAssignment) return;
    const [subjectId, batchId] = selectedAssignment.split('|');

    setIsSending(true);
    try {
      const res = await teacherApi.sendLowAttendanceEmail({
        subject_id: subjectId,
        batch_id: batchId,
      });

      const data = res.data.data;
      setToast({
        message: `Successfully dispatched ${data.emails_sent} low-attendance warning emails!`,
        type: 'success',
      });
      setIsConfirmOpen(false);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to dispatch warning emails.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Low Attendance Warnings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Identify students below the threshold and dispatch automated warning emails.
            </p>
          </div>

          {students.length > 0 && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-md shadow-rose-600/20 flex items-center gap-2"
            >
              <span>📧</span>
              <span>Send Mail to Low Attendance Students</span>
            </button>
          )}
        </div>

        {/* Assignment & Threshold Selectors */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Course & Batch
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {assignments.map((a) => (
                <option key={`${a.subject.id}|${a.batch.id}`} value={`${a.subject.id}|${a.batch.id}`}>
                  {a.subject.course_code} - {a.subject.name} ({a.batch.name})
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Threshold (%)
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              title="No low attendance students"
              description={`Great news! All enrolled students have attendance above ${threshold}%.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Enrollment No</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5 text-right">Present</th>
                    <th className="px-6 py-3.5 text-right">Total Sessions</th>
                    <th className="px-6 py-3.5 text-right">Attendance %</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {students.map((st) => (
                    <tr key={st.studentId} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100">{st.studentName}</td>
                      <td className="px-6 py-4 font-mono text-indigo-400">{st.enrollmentNo}</td>
                      <td className="px-6 py-4 text-slate-300">{st.email}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-400">{st.presentSessions}</td>
                      <td className="px-6 py-4 text-right font-medium">{st.totalSessions}</td>
                      <td className="px-6 py-4 text-right font-bold text-rose-400">
                        {st.attendancePercentage}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="absent">Below {threshold}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Dispatch Warning Emails"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Are you sure you want to send warning emails to <strong>{students.length}</strong> students falling below the <strong>{threshold}%</strong> threshold?
          </p>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-slate-400">
            Each student will receive a formatted low-attendance notification email, and the action will be recorded in the system email audit logs.
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmails}
              disabled={isSending}
              className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/20"
            >
              {isSending ? 'Sending Emails...' : 'Send Warning Emails'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
