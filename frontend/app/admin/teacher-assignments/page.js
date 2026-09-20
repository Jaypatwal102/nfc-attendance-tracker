'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Toast from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { adminApi, publicApi } from '../../../services/api';

export default function AdminTeacherAssignmentsPage() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, bRes, mRes] = await Promise.all([
        adminApi.getTeachers(),
        publicApi.getSubjects(),
        publicApi.getBatches(),
        adminApi.getTeacherSubjectMappings(),
      ]);

      setTeachers(tRes.data.data);
      setSubjects(sRes.data.data);
      setBatches(bRes.data.data);
      setMappings(mRes.data.data);

      if (tRes.data.data.length > 0) setSelectedTeacher(tRes.data.data[0].id);
      if (sRes.data.data.length > 0) setSelectedSubject(sRes.data.data[0].id);
      if (bRes.data.data.length > 0) setSelectedBatch(bRes.data.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedSubject || !selectedBatch) return;

    setIsAssigning(true);
    try {
      await adminApi.createTeacherSubjectMapping({
        teacher_id: selectedTeacher,
        subject_id: selectedSubject,
        batch_id: selectedBatch,
      });

      setToast({ message: 'Teacher assigned to subject and batch successfully!', type: 'success' });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to assign teacher.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteMapping = async (id) => {
    if (!confirm('Are you sure you want to remove this teacher assignment?')) return;
    try {
      await adminApi.deleteTeacherSubjectMapping(id);
      setToast({ message: 'Assignment removed successfully.', type: 'success' });
      loadAllData();
    } catch (err) {
      setToast({ message: 'Failed to remove assignment.', type: 'error' });
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Teacher Assignments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map faculty teachers to assigned subjects and student batches.
          </p>
        </div>

        {/* Assignment Form */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-700/60 pb-3">
            Assign Teacher to Subject & Batch
          </h3>

          <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Teacher
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                required
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.courseCode} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                required
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.program})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={isAssigning}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider transition"
              >
                {isAssigning ? 'Assigning...' : 'Assign Teacher'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Assignments Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Active Teacher Subject Mappings
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : mappings.length === 0 ? (
            <EmptyState title="No active teacher assignments" description="Use the form above to assign teachers to subjects." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Teacher Name</th>
                    <th className="px-6 py-3.5">Employee ID</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Batch</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mappings.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100">{m.teacher?.name}</td>
                      <td className="px-6 py-4 font-mono text-indigo-400">{m.teacher?.employeeId}</td>
                      <td className="px-6 py-4 font-medium">
                        {m.subject?.courseCode} - {m.subject?.name}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">{m.batch?.name}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteMapping(m.id)}
                          className="px-3 py-1 bg-rose-950/70 border border-rose-800 text-rose-300 hover:bg-rose-900 rounded font-medium transition"
                        >
                          Remove
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
    </DashboardLayout>
  );
}
