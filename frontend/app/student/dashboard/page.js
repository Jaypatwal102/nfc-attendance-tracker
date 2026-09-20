'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { studentApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await studentApi.getSummary();
        setSummary(res.data.data);
      } catch (err) {
        setError('Failed to load attendance summary.');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const studentName = user?.student?.name || user?.email?.split('@')[0] || 'Student';

  return (
    <DashboardLayout allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Welcome back, {studentName} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your course attendance metrics and academic progress.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Overall Attendance"
                value={`${summary?.overall_percentage ?? 0}%`}
                subtitle="Required minimum: 75%"
                color={
                  (summary?.overall_percentage ?? 0) >= 75
                    ? 'emerald'
                    : 'rose'
                }
              />
              <StatCard
                title="Total Classes"
                value={summary?.total_classes ?? 0}
                color="indigo"
              />
              <StatCard
                title="Present"
                value={summary?.present ?? 0}
                color="emerald"
              />
              <StatCard
                title="Absent"
                value={summary?.absent ?? 0}
                color="rose"
              />
            </div>

            {/* Subject-wise Attendance Table */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
              <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Subject-wise Attendance Breakdown
                </h3>
              </div>

              {!summary?.subjects || summary.subjects.length === 0 ? (
                <EmptyState
                  title="No subject mappings found"
                  description="You are currently not enrolled in any subjects."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                      <tr>
                        <th className="px-6 py-3.5">Course Code</th>
                        <th className="px-6 py-3.5">Subject Name</th>
                        <th className="px-6 py-3.5 text-right">Total Classes</th>
                        <th className="px-6 py-3.5 text-right">Present</th>
                        <th className="px-6 py-3.5 text-right">Absent</th>
                        <th className="px-6 py-3.5 text-right">Attendance %</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {summary.subjects.map((sub) => {
                        const isLow = sub.percentage < 75;
                        return (
                          <tr key={sub.subject_id} className="hover:bg-slate-700/30 transition">
                            <td className="px-6 py-4 font-mono font-semibold text-indigo-400">
                              {sub.course_code}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-100">
                              {sub.subject_name}
                            </td>
                            <td className="px-6 py-4 text-right font-medium">{sub.total_sessions}</td>
                            <td className="px-6 py-4 text-right font-medium text-emerald-400">
                              {sub.present}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-rose-400">
                              {sub.absent}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-100">
                              {sub.percentage}%
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={isLow ? 'absent' : 'present'}>
                                {isLow ? 'Low Attendance' : 'Good'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
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
