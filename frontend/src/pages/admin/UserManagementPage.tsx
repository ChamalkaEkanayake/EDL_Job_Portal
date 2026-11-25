import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  Pencil,
  KeyRound,
  Ban,
  Check,
  Lock,
} from 'lucide-react';
import {
  MOCK_SYSTEM_USERS,
  MOCK_DEPARTMENTS,
  type SystemUser,
} from '../../data/mockRecruitmentData';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

type RoleFilter = 'ALL' | UserRole;
type StatusFilter = 'ALL' | 'Active' | 'Suspended';

const STORAGE_KEY = 'ceb_admin_system_users';

const ROLE_BADGE_MAP: Record<UserRole, { bg: string; text: string; label: string }> = {
  ADMIN: {
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    label: 'ADMIN',
  },
  HR: {
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-700',
    label: 'HR',
  },
  DIRECTOR: {
    bg: 'bg-indigo-50 border-indigo-200',
    text: 'text-indigo-700',
    label: 'DIRECTOR',
  },
  APPLICANT: {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    label: 'APPLICANT',
  },
};

const ROLE_PERMISSIONS_MATRIX: {
  capability: string;
  APPLICANT: boolean;
  HR: boolean;
  DIRECTOR: boolean;
  ADMIN: boolean;
}[] = [
  {
    capability: 'Browse Vacancies & Submit Applications',
    APPLICANT: true,
    HR: false,
    DIRECTOR: false,
    ADMIN: false,
  },
  {
    capability: 'Create, Publish & Close Job Vacancies',
    APPLICANT: false,
    HR: true,
    DIRECTOR: false,
    ADMIN: false,
  },
  {
    capability: 'Screen Applications, Request Docs & Shortlist',
    APPLICANT: false,
    HR: true,
    DIRECTOR: false,
    ADMIN: false,
  },
  {
    capability: 'Final Board Approval / Rejection with Remarks',
    APPLICANT: false,
    HR: false,
    DIRECTOR: true,
    ADMIN: false,
  },
  {
    capability: 'Manage Users, Roles, Divisions & Audit Logs',
    APPLICANT: false,
    HR: false,
    DIRECTOR: false,
    ADMIN: true,
  },
];

export const UserManagementPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as SystemUser[];
    } catch {
      // ignore malformed storage
    }
    return MOCK_SYSTEM_USERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Staff / Board Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    name: string;
    email: string;
    role: 'HR' | 'DIRECTOR' | 'ADMIN';
    department: string;
  }>({
    name: '',
    email: '',
    role: 'HR',
    department: 'Human Resources Division',
  });

  // Edit Role & Division Modal
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('HR');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended'>('Active');

  // Inline suspend confirmation target
  const [pendingSuspendUser, setPendingSuspendUser] = useState<SystemUser | null>(null);

  const divisionOptions = useMemo(() => {
    const deptNames = MOCK_DEPARTMENTS.map((d) => d.name);
    return Array.from(
      new Set([
        ...deptNames,
        'Board of Directors',
        'IT & Digital Transformation',
        'External Candidate',
      ])
    );
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const persistUsers = (nextUsers: SystemUser[], message?: string) => {
    setUsers(nextUsers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
    } catch {
      // ignore storage errors
    }
    if (message) showToast(message, 'success');
  };

  const counts = useMemo(() => {
    return {
      total: users.length,
      internalStaff: users.filter((u) => u.role !== 'APPLICANT').length,
      applicants: users.filter((u) => u.role === 'APPLICANT').length,
      suspended: users.filter((u) => u.status === 'Suspended').length,
      byRole: {
        ALL: users.length,
        ADMIN: users.filter((u) => u.role === 'ADMIN').length,
        HR: users.filter((u) => u.role === 'HR').length,
        DIRECTOR: users.filter((u) => u.role === 'DIRECTOR').length,
        APPLICANT: users.filter((u) => u.role === 'APPLICANT').length,
      },
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      email: '',
      role: 'HR',
      department: 'Human Resources Division',
    });
    setIsAddOpen(true);
  };

  const handleCreateStaffUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = addForm.email.trim().toLowerCase();
    if (!addForm.name.trim() || !cleanEmail) return;

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      showToast(`An account with email "${cleanEmail}" already exists.`, 'error');
      return;
    }

    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: addForm.name.trim(),
      email: cleanEmail,
      role: addForm.role,
      department: addForm.department,
      status: 'Active',
      lastActive: 'Pending first login',
      createdAt: '2026-11-25',
    };

    persistUsers(
      [newUser, ...users],
      `Created ${newUser.role} account for ${newUser.name} (${newUser.email}).`
    );
    setIsAddOpen(false);
  };

  const openEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditDept(user.department);
    setEditStatus(user.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const isSelf = currentUser?.email?.toLowerCase() === editingUser.email.toLowerCase();
    if (isSelf && editStatus === 'Suspended') {
      showToast('You cannot suspend your own currently active Admin session.', 'error');
      return;
    }

    const next = users.map((u) =>
      u.id === editingUser.id
        ? { ...u, role: editRole, department: editDept, status: editStatus }
        : u
    );
    persistUsers(
      next,
      `Updated access profile for ${editingUser.name} (${editRole} • ${editStatus}).`
    );
    setEditingUser(null);
  };

  const handleToggleStatus = (user: SystemUser) => {
    const isSelf = currentUser?.email?.toLowerCase() === user.email.toLowerCase();
    if (isSelf && user.status === 'Active') {
      showToast('You cannot suspend your own active Admin account.', 'error');
      return;
    }

    if (user.status === 'Active') {
      setPendingSuspendUser(user);
      return;
    }

    const next = users.map((u) => (u.id === user.id ? { ...u, status: 'Active' as const } : u));
    persistUsers(next, `Reactivated account for ${user.name}.`);
  };

  const confirmSuspend = () => {
    if (!pendingSuspendUser) return;
    const next = users.map((u) =>
      u.id === pendingSuspendUser.id ? { ...u, status: 'Suspended' as const } : u
    );
    persistUsers(next, `Account for ${pendingSuspendUser.name} has been suspended.`);
    setPendingSuspendUser(null);
  };

  const roleTabs: { id: RoleFilter; label: string }[] = [
    { id: 'ALL', label: 'All Users' },
    { id: 'ADMIN', label: 'Admins' },
    { id: 'HR', label: 'HR Staff' },
    { id: 'DIRECTOR', label: 'Director Board' },
    { id: 'APPLICANT', label: 'Applicants' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User & Role Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Provision internal HR & Director Board accounts, assign division scopes, and manage portal access.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff / Board User</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div
          className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold border shadow-2xs ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inline Suspend Confirmation Banner */}
      {pendingSuspendUser && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 text-rose-900">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Suspend portal access for <strong>{pendingSuspendUser.name}</strong> (
              {pendingSuspendUser.email})? They will be unable to sign in until reactivated.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setPendingSuspendUser(null)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSuspend}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              Confirm Suspend
            </button>
          </div>
        </div>
      )}

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">All registered portal accounts</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Staff & Board
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.internalStaff}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">HR, Directors & Admins</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Applicants
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.applicants}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">External candidate profiles</p>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-2xs ${
            counts.suspended > 0
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Suspended
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{counts.suspended}</div>
          <p className="text-[11px] text-rose-800/80 mt-0.5">
            {counts.suspended > 0 ? 'Restricted access accounts' : 'All accounts active'}
          </p>
        </div>
      </div>

      {/* 3. Search, Role Tabs & Status Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name, email address, or division..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended Only</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {roleTabs.map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {counts.byRole[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Users Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5 font-bold">User</th>
                <th className="py-3.5 px-4 font-bold">Role</th>
                <th className="py-3.5 px-4 font-bold">Division / Scope</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Last Active</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No user accounts match your current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const badge = ROLE_BADGE_MAP[user.role];
                  const isSelf =
                    currentUser?.email?.toLowerCase() === user.email.toLowerCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="truncate">{user.name}</span>
                              {isSelf && (
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {user.department}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {user.lastActive}
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-700 hover:border-sky-200 transition cursor-pointer"
                            title="Edit Role & Division"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showToast(
                                `Password reset instructions queued for ${user.email}.`
                              )
                            }
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-700 hover:border-indigo-200 transition cursor-pointer"
                            title="Send Password Reset"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg border bg-white transition cursor-pointer ${
                              user.status === 'Active'
                                ? 'border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={
                              user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'
                            }
                          >
                            {user.status === 'Active' ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Role Permissions Matrix Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Role Permissions Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard RBAC policy enforced across Ceylon Electricity Board recruitment workflows.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4 font-bold">Portal Capability</th>
                <th className="py-2.5 px-4 font-bold text-center">Applicant</th>
                <th className="py-2.5 px-4 font-bold text-center">HR Staff</th>
                <th className="py-2.5 px-4 font-bold text-center">Director Board</th>
                <th className="py-2.5 px-4 font-bold text-center">System Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLE_PERMISSIONS_MATRIX.map((row) => (
                <tr key={row.capability} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-medium text-slate-800">{row.capability}</td>
                  {(['APPLICANT', 'HR', 'DIRECTOR', 'ADMIN'] as const).map((r) => (
                    <td key={r} className="py-2.5 px-4 text-center">
                      {row[r] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add Staff / Board User */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStaffUser}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Staff / Board User</h3>
                <p className="text-[11px] text-slate-500">
                  Provision an internal CEB portal account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Eng. Ruwan Bandara"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official CEB Email *
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. ruwan.hr@ceb.lk"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => {
                    const nextRole = e.target.value as 'HR' | 'DIRECTOR' | 'ADMIN';
                    setAddForm({
                      ...addForm,
                      role: nextRole,
                      department:
                        nextRole === 'DIRECTOR'
                          ? 'Board of Directors'
                          : nextRole === 'ADMIN'
                          ? 'IT & Digital Transformation'
                          : 'Human Resources Division',
                    });
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  <option value="HR">HR Staff (Recruitment Management)</option>
                  <option value="DIRECTOR">Director Board Member</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Division *
                </label>
                <select
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  {divisionOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Edit User Role & Division */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Role & Access</h3>
                <p className="text-[11px] text-slate-500">
                  {editingUser.name} ({editingUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  <option value="APPLICANT">APPLICANT</option>
                  <option value="HR">HR</option>
                  <option value="DIRECTOR">DIRECTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Division
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  {divisionOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Suspended')}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
