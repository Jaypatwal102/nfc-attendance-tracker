'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Toast from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { adminApi, publicApi } from '../../../services/api';

export default function AdminStudentSubjectsPage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [stRes, sRes, bRes, mRes] = await Promise.all([
        adminApi.getStudents(),
        publicApi.getSubjects(),
        publicApi.getBatches(),
        adminApi.getStudentSubjectMappings(),
      ]);

      setStudents(stRes.data.data);
      setSubjects(sRes.data.data);
      setBatches(bRes.data.data);
      setMappings(mRes.data.data);

      if (stRes.data.data.length > 0) {
        setSelectedStudent(stRes.data.data[0].id);
        setSelectedBatch(stRes.data.data[0].batchId);
      }
      if (sRes.data.data.length > 0) setSelectedSubject(sRes.data.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleStudentChange = (stId) => {
    setSelectedStudent(stId);
    const st = students.find((s) => s.id === stId);
    if (st) setSelectedBatch(st.batchId);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject || !selectedBatch) return;

    setIsAssigning(true);
    try {
      await adminApi.createStudentSubjectMapping({
        student_id: selectedStudent,
        subject_id: selectedSubject,
        batch_id: selectedBatch,
      });

      setToast({ message: 'Student enrolled in subject successfully!', type: 'success' });
      loadAllData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to enroll student in subject.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteMapping = async (id) => {
    if (!confirm('Are you sure you want to remove this subject enrollment?')) return;
    try {
      await adminApi.deleteStudentSubjectMapping(id);
      setToast({ message: 'Subject enrollment removed successfully.', type: 'success' });
      loadAllData();
    } catch (err) {
      setToast({ message: 'Failed to remove subject enrollment.', type: 'error' });
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Student Subject Enrollments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enroll students into active academic subjects for their enrolled batch.
          </p>
        </div>

        {/* Enrollment Form */}
        <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-700/60 pb-3">
            Enroll Student into Subject
          </h3>

          <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                required
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.enrollmentNo})
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
                Enrolled Batch
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
                {isAssigning ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </div>
          </form>
        </div>

        {/* Mappings Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Active Student Subject Enrollments
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : mappings.length === 0 ? (
            <EmptyState title="No subject enrollments" description="Use the form above to enroll students into subjects." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Enrollment No</th>
                    <th className="px-6 py-3.5">Enrolled Subject</th>
                    <th className="px-6 py-3.5">Batch</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mappings.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100">{m.student?.name}</td>
                      <td className="px-6 py-4 font-mono text-indigo-400">{m.student?.enrollmentNo}</td>
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
