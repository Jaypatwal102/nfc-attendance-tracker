'use client';

import React from 'react';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Grid of metric cards showing aggregate statistics for course and batch attendance.
 */
export default function TeacherStatsCards({ stats }) {
  if (!stats) {
    return (
      <EmptyState
        title="No statistics data"
        description="Select an assigned subject and batch above to calculate metrics."
      />
    );
  }

  return (
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
  );
}

