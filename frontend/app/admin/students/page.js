'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Modal from '../../../components/ui/Modal';
import Toast from '../../../components/ui/Toast';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { adminApi, publicApi } from '../../../services/api';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editStudent, setEditStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNfcId, setEditNfcId] = useState('');
  const [editBatchId, setEditBatchId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await publicApi.getBatches();
        setBatches(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadBatches();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedBatch) params.batch_id = selectedBatch;

      const res = await adminApi.getStudents(params);
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenEdit = (st) => {
    setEditStudent(st);
    setEditName(st.name);
    setEditNfcId(st.nfcId || '');
    setEditBatchId(st.batchId);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editStudent) return;

    setIsSaving(true);
    try {
      await adminApi.updateStudent(editStudent.id, {
        name: editName,
        nfc_id: editNfcId,
        batch_id: editBatchId,
      });

      setToast({ message: `Updated student ${editName} successfully!`, type: 'success' });
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update student profile.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Students Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage enrolled students, assign NFC ID tags, and update batch allocations.
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Search Student
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, enrollment no, or email..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
            />
          </div>

          <div className="w-48">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="self-end px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition"
          >
            Search
          </button>
        </form>

        {/* Students Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : students.length === 0 ? (
            <EmptyState title="No students found" description="No student records match your query." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Enrollment No</th>
                    <th className="px-6 py-3.5">Full Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Batch</th>
                    <th className="px-6 py-3.5 text-center">NFC Tag ID</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-400">{st.enrollmentNo}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">{st.name}</td>
                      <td className="px-6 py-4 text-slate-300">{st.email}</td>
                      <td className="px-6 py-4 font-medium text-slate-200">{st.batch?.name || '—'}</td>
                      <td className="px-6 py-4 text-center font-mono">
                        {st.nfcId ? (
                          <Badge variant="present">{st.nfcId}</Badge>
                        ) : (
                          <span className="text-slate-500 italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded transition"
                        >
                          Edit Profile
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

      {/* Edit Student Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title={`Edit Student: ${editStudent?.name}`}>
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">NFC Tag ID</label>
            <input
              type="text"
              value={editNfcId}
              onChange={(e) => setEditNfcId(e.target.value)}
              placeholder="e.g. NFC_TAG_MCA001"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Batch Assignment</label>
            <select
              value={editBatchId}
              onChange={(e) => setEditBatchId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.program})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditStudent(null)}
              className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
