'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Modal from '../../../components/ui/Modal';
import Toast from '../../../components/ui/Toast';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { adminApi, publicApi } from '../../../services/api';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [program, setProgram] = useState('MCA');
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('A');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getBatches();
      setBatches(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createBatch({
        name,
        program,
        admission_year: Number(admissionYear),
        semester: Number(semester),
        section,
      });

      setToast({ message: `Batch ${name} created successfully!`, type: 'success' });
      setIsAddOpen(false);
      setName('');
      fetchBatches();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create batch.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Batch Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure academic program batches, admission years, semesters, and sections.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>🏫</span>
            <span>Add New Batch</span>
          </button>
        </div>

        {/* Batches Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : batches.length === 0 ? (
            <EmptyState title="No batches registered" description="Click 'Add New Batch' to create a batch." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Batch Identifier</th>
                    <th className="px-6 py-3.5">Program</th>
                    <th className="px-6 py-3.5 text-center">Admission Year</th>
                    <th className="px-6 py-3.5 text-center">Semester</th>
                    <th className="px-6 py-3.5 text-center">Section</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-semibold text-indigo-400">{b.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-100">{b.program}</td>
                      <td className="px-6 py-4 text-center font-mono">{b.admissionYear}</td>
                      <td className="px-6 py-4 text-center font-semibold">Semester {b.semester}</td>
                      <td className="px-6 py-4 text-center font-mono">{b.section || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={b.isActive ? 'active' : 'inactive'}>
                          {b.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Batch Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Batch">
        <form onSubmit={handleAddBatch} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Batch Identifier Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2024_MCA"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Program</label>
              <input
                type="text"
                required
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. MCA, BTech"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Admission Year</label>
              <input
                type="number"
                required
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Semester</label>
              <input
                type="number"
                required
                min="1"
                max="12"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Section (Optional)</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
