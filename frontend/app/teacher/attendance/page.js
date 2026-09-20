'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Toast from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { teacherApi } from '../../../services/api';

export default function TeacherAttendanceManagement() {
  const [assignments, setAssignments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editRecord, setEditRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('PRESENT');
  const [editRemark, setEditRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await teacherApi.getAssignments();
        setAssignments(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadAssignments();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedBatch) params.batch_id = selectedBatch;
      if (selectedStatus) params.status = selectedStatus;

      const res = await teacherApi.getAttendance(params);
      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedSubject, selectedBatch, selectedStatus]);

  const handleOpenEdit = (rec) => {
    setEditRecord(rec);
    setEditStatus(rec.status);
    setEditRemark(rec.remark || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editRecord) return;

    setIsSaving(true);
    try {
      await teacherApi.updateAttendance(editRecord.id, {
        status: editStatus,
        remark: editRemark,
      });

      setToast({ message: 'Attendance record updated successfully!', type: 'success' });
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update attendance record.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Attendance Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter, inspect, and manually adjust student attendance status.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Assigned Subjects</option>
              {Array.from(new Set(assignments.map((a) => a.subject.id))).map((subId) => {
                const sub = assignments.find((a) => a.subject.id === subId)?.subject;
                return (
                  <option key={sub.id} value={sub.id}>
                    {sub.course_code} - {sub.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Assigned Batches</option>
              {Array.from(new Set(assignments.map((a) => a.batch.id))).map((batchId) => {
                const b = assignments.find((a) => a.batch.id === batchId)?.batch;
                return (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="No records match your active search filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Enrollment No</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Batch</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Remark</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100">{rec.student?.name}</td>
                      <td className="px-6 py-4 font-mono text-indigo-400">{rec.student?.enrollmentNo}</td>
                      <td className="px-6 py-4">{rec.session?.subject?.name}</td>
                      <td className="px-6 py-4 font-medium">{rec.session?.batch?.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {new Date(rec.session?.sessionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 italic text-slate-400">{rec.remark || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={rec.status === 'PRESENT' ? 'present' : 'absent'}>
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Record Modal */}
      <Modal
        isOpen={!!editRecord}
        onClose={() => setEditRecord(null)}
        title={`Correction: ${editRecord?.student?.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Attendance Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Adjustment Remark
            </label>
            <input
              type="text"
              value={editRemark}
              onChange={(e) => setEditRemark(e.target.value)}
              placeholder="e.g. Late arrival, Approved leave"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditRecord(null)}
              className="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              {isSaving ? 'Saving...' : 'Save Correction'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
