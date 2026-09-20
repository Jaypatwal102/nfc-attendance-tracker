'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { teacherApi } from '../../../services/api';

export default function TeacherStatisticsPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function fetchStats() {
      if (!selectedAssignment) return;
      const [subjectId, batchId] = selectedAssignment.split('|');

      setLoading(true);
      try {
        const res = await teacherApi.getStatistics({
          subject_id: subjectId,
          batch_id: batchId,
        });
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedAssignment]);

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Attendance Statistics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate stats and attendance performance metrics for your courses.
          </p>
        </div>

        {/* Assignment Selector */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 max-w-xl">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Select Course & Batch Assignment
          </label>
          <select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {assignments.map((a) => (
              <option key={`${a.subject.id}|${a.batch.id}`} value={`${a.subject.id}|${a.batch.id}`}>
                {a.subject.course_code} - {a.subject.name} ({a.batch.name})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : !stats ? (
          <EmptyState
            title="No statistics data"
            description="Select an assigned subject and batch above to calculate metrics."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Average Attendance Rate"
              value={`${stats.attendance_percentage}%`}
              subtitle="Batch-wide average"
              color={stats.attendance_percentage >= 75 ? 'emerald' : 'rose'}
            />
            <StatCard
              title="Enrolled Students"
              value={stats.total_students}
              color="indigo"
            />
            <StatCard
              title="Total Sessions Conducted"
              value={stats.total_sessions}
              color="sky"
            />
            <StatCard
              title="Total Present Marks"
              value={stats.present_count}
              color="emerald"
            />
            <StatCard
              title="Total Absent Marks"
              value={stats.absent_count}
              color="rose"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
