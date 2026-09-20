'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { studentApi, publicApi } from '../../../services/api';

export default function StudentAttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const subRes = await publicApi.getSubjects();
        setSubjects(subRes.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const params = {};
        if (selectedSubject) params.subject_id = selectedSubject;
        if (selectedStatus) params.status = selectedStatus;

        const res = await studentApi.getAttendance(params);
        setHistory(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [selectedSubject, selectedStatus]);

  return (
    <DashboardLayout allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Attendance History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete record of your class attendance sessions.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.courseCode} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-44">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Status
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

        {/* History Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="No attendance records match your active filter criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Teacher</th>
                    <th className="px-6 py-3.5">Marked Time</th>
                    <th className="px-6 py-3.5">Remark</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-indigo-400 mr-2">
                          {record.subject_code}
                        </span>
                        <span className="text-slate-100">{record.subject_name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{record.teacher_name}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(record.marked_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-400 italic">
                        {record.remark || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={record.status === 'PRESENT' ? 'present' : 'absent'}>
                          {record.status}
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
    </DashboardLayout>
  );
}
