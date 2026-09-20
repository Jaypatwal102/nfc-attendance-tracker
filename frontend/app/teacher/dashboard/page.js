'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { teacherApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignRes, sessRes] = await Promise.all([
          teacherApi.getAssignments(),
          teacherApi.getSessions(),
        ]);
        setAssignments(assignRes.data.data);
        setSessions(sessRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const teacherName = user?.teacher?.name || user?.email?.split('@')[0] || 'Teacher';

  // Extract unique subjects & batches count
  const uniqueSubjectsCount = new Set(assignments.map((a) => a.subject.id)).size;
  const uniqueBatchesCount = new Set(assignments.map((a) => a.batch.id)).size;

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Welcome, {teacherName} 👨‍🏫
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage class sessions, scan NFC cards, and monitor attendance statistics.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/teacher/attendance/take"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <span>📲</span>
              <span>Take Attendance</span>
            </Link>
            <Link
              href="/teacher/low-attendance"
              className="px-4 py-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 hover:bg-amber-900/60 font-semibold text-xs transition flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>Low Attendance</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Assigned Subjects"
                value={uniqueSubjectsCount}
                color="indigo"
              />
              <StatCard
                title="Assigned Batches"
                value={uniqueBatchesCount}
                color="sky"
              />
              <StatCard
                title="Total Sessions Conducted"
                value={sessions.length}
                color="emerald"
              />
            </div>

            {/* Recent Attendance Sessions */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
              <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Recent Class Sessions
                </h3>
                <Link
                  href="/teacher/attendance"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View History →
                </Link>
              </div>

              {sessions.length === 0 ? (
                <EmptyState
                  title="No sessions conducted yet"
                  description="Click 'Take Attendance' to start your first NFC class session."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                      <tr>
                        <th className="px-6 py-3.5">Subject</th>
                        <th className="px-6 py-3.5">Batch</th>
                        <th className="px-6 py-3.5">Session Date</th>
                        <th className="px-6 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {sessions.slice(0, 5).map((sess) => (
                        <tr key={sess.id} className="hover:bg-slate-700/30 transition">
                          <td className="px-6 py-4 font-medium text-slate-100">
                            <span className="font-mono font-semibold text-indigo-400 mr-2">
                              {sess.subject?.courseCode}
                            </span>
                            <span>{sess.subject?.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-semibold">
                            {sess.batch?.name}
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono">
                            {new Date(sess.sessionDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              href={`/teacher/attendance?subject_id=${sess.subjectId}&batch_id=${sess.batchId}`}
                              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded border border-indigo-800/60"
                            >
                              View Records
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
