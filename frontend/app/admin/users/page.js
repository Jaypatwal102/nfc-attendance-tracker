'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Toast from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { adminApi } from '../../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Role Modal State
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;

      const res = await adminApi.getUsers(params);
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenRoleModal = (user) => {
    setRoleUser(user);
    setSelectedRole(user.role);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!roleUser) return;

    setIsUpdating(true);
    try {
      await adminApi.updateUserRole(roleUser.id, selectedRole);
      setToast({ message: `Role updated to ${selectedRole} for ${roleUser.email}`, type: 'success' });
      setRoleUser(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update role.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      await adminApi.updateUserStatus(user.id, newStatus);
      setToast({
        message: `User ${user.email} ${newStatus ? 'activated' : 'deactivated'} successfully!`,
        type: 'success',
      });
      fetchUsers();
    } catch (err) {
      setToast({ message: 'Failed to update user status.', type: 'error' });
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            User Accounts & Roles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Central user authorization directory. Assign roles and manage active account access.
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Search Email
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500"
            />
          </div>

          <div className="w-40">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="self-end px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition"
          >
            Search
          </button>
        </form>

        {/* Users Table */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users found" description="No accounts match your query parameters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="px-6 py-3.5">User Email</th>
                    <th className="px-6 py-3.5">Associated Profile</th>
                    <th className="px-6 py-3.5 text-center">Role</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100">{u.email}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {u.teacher
                          ? `Teacher: ${u.teacher.name} (${u.teacher.employeeId})`
                          : u.student
                          ? `Student: ${u.student.name} (${u.student.enrollmentNo})`
                          : 'System Admin'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={u.role.toLowerCase()}>{u.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={u.isActive ? 'active' : 'inactive'}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="px-3 py-1 bg-indigo-950/80 border border-indigo-800 text-indigo-300 hover:bg-indigo-900 rounded font-medium transition"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded font-medium border transition ${
                            u.isActive
                              ? 'bg-rose-950/70 text-rose-300 border-rose-800 hover:bg-rose-900'
                              : 'bg-emerald-950/70 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Role Switcher Modal */}
      <Modal isOpen={!!roleUser} onClose={() => setRoleUser(null)} title={`Change Role: ${roleUser?.email}`}>
        <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select User Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER (Auto-creates Teacher Profile if needed)</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setRoleUser(null)}
              className="flex-1 py-2.5 rounded-lg bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              {isUpdating ? 'Updating Role...' : 'Save Role'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
