'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import UsersFilterBar from '@/components/features/users/UsersFilterBar';
import UsersTable from '@/components/features/users/UsersTable';
import ChangeRoleModal from '@/components/features/users/ChangeRoleModal';
import { adminApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState(null);

  // Edit Role Modal State
  const [roleUser, setRoleUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setTableError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;

      const res = await adminApi.getUsers(params);
      setUsers(res.data?.data || []);
    } catch (err) {
      setTableError(getErrorMessage(err, 'Unable to load user accounts. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateRole = async (userId, newRole) => {
    setIsUpdating(true);
    try {
      await adminApi.updateUserRole(userId, newRole);
      setToast({
        message: `Role updated to ${newRole} for ${roleUser?.email}`,
        type: 'success',
      });
      setRoleUser(null);
      fetchUsers();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to update user role.'),
        type: 'error',
      });
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
      setToast({
        message: getErrorMessage(err, 'Failed to update account status.'),
        type: 'error',
      });
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="space-y-6">
        <PageHeader
          title="User Accounts & Roles"
          description="Central user authorization directory. Assign roles and manage active account access."
        />

        <UsersFilterBar
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onSubmit={handleSearchSubmit}
        />

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : tableError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Users"
                message={tableError}
                onRetry={fetchUsers}
              />
            </div>
          ) : (
            <UsersTable
              users={users}
              onOpenRoleModal={(u) => setRoleUser(u)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>

      <ChangeRoleModal
        user={roleUser}
        isOpen={!!roleUser}
        onClose={() => setRoleUser(null)}
        onUpdateRole={handleUpdateRole}
        isUpdating={isUpdating}
      />
    </DashboardLayout>
  );
}
