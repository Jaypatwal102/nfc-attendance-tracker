'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Modal from '../../../components/ui/Modal';
import Toast from '../../../components/ui/Toast';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { adminApi, publicApi } from '../../../services/api';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [courseCode, setCourseCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await publicApi.getSubjects();
      setSubjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createSubject({
        course_code: courseCode,
        name,
        description,
      });

      setToast({ message: `Subject ${courseCode} created successfully!`, type: 'success' });
      setIsAddOpen(false);
      setCourseCode('');
      setName('');
      setDescription('');
      fetchSubjects();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create subject.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (sub) => {
    try {
      const newStatus = !sub.isActive;
      await adminApi.updateSubjectStatus(sub.id, newStatus);
      setToast({
        message: `Subject ${sub.courseCode} ${newStatus ? 'activated' : 'deactivated'} successfully!`,
        type: 'success',
      });
      fetchSubjects();
    } catch (err) {
      setToast({ message: 'Failed to update subject status.', type: 'error' });
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Subject Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create academic courses and configure subject status.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <span>📚</span>
            <span>Add New Subject</span>
          </button>
        </div>

        {/* Subjects Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : subjects.length === 0 ? (
            <EmptyState title="No subjects registered" description="Click 'Add New Subject' to create a course." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Course Code</th>
                    <th className="px-6 py-3.5">Subject Name</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-mono font-semibold text-indigo-400">{sub.courseCode}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">{sub.name}</td>
                      <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{sub.description || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={sub.isActive ? 'active' : 'inactive'}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-3 py-1 rounded font-medium border transition ${
                            sub.isActive
                              ? 'bg-rose-950/70 text-rose-300 border-rose-800 hover:bg-rose-900'
                              : 'bg-emerald-950/70 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          }`}
                        >
                          {sub.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Add Subject Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Subject">
        <form onSubmit={handleAddSubject} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Course Code</label>
            <input
              type="text"
              required
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. MCA501"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Database Management System"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Course description..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500"
            />
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
              {isSubmitting ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
