import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  ShieldAlert,
  Search,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lock,
  FileText,
  X,
  Server,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  MOCK_SYSTEM_USERS,
  MOCK_DEPARTMENTS,
  MOCK_VACANCIES,
  MOCK_AUDIT_LOGS,
  MOCK_ADMIN_ACTIVITY_SERIES,
  type AuditCategory,
  type AuditLogEntry,
  type AuditSeverity,
} from '../../data/mockRecruitmentData';
import type { UserRole } from '../../types';

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  HR: 'bg-sky-50 text-sky-700 border-sky-200',
  DIRECTOR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  APPLICANT: 'bg-slate-100 text-slate-700 border-slate-200',
};

const SEVERITY_BADGE: Record<AuditSeverity, { bg: string; text: string; dot: string }> = {
  INFO: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  WARNING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
  CRITICAL: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
};

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  AUTH: 'Auth & Security',
  RECRUITMENT: 'Recruitment',
  USER_ADMIN: 'User Admin',
  SYSTEM: 'System',
};

export const AdminDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AuditCategory>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const activeUsers = MOCK_SYSTEM_USERS.filter((u) => u.status === 'Active').length;
    const suspendedUsers = MOCK_SYSTEM_USERS.filter((u) => u.status === 'Suspended').length;
    const activeDepts = MOCK_DEPARTMENTS.filter((d) => d.status === 'Active').length;
    const publishedVacancies = MOCK_VACANCIES.filter((v) => v.status === 'PUBLISHED').length;
    const flaggedEvents = MOCK_AUDIT_LOGS.filter(
      (l) => l.severity === 'WARNING' || l.severity === 'CRITICAL'
    ).length;

    return {
      totalUsers: MOCK_SYSTEM_USERS.length,
      activeUsers,
      suspendedUsers,
      activeDepts,
      totalDepts: MOCK_DEPARTMENTS.length,
      publishedVacancies,
      totalAuditLogs: MOCK_AUDIT_LOGS.length,
      flaggedEvents,
    };
  }, []);

  const roleBreakdown = useMemo(() => {
    const roles: { role: UserRole; label: string; color: string }[] = [
      { role: 'APPLICANT', label: 'Job Applicants', color: 'bg-sky-600' },
      { role: 'HR', label: 'HR / Recruitment Staff', color: 'bg-emerald-500' },
      { role: 'DIRECTOR', label: 'Director Board', color: 'bg-indigo-600' },
      { role: 'ADMIN', label: 'System Admins', color: 'bg-purple-600' },
    ];
    return roles.map((item) => {
      const count = MOCK_SYSTEM_USERS.filter((u) => u.role === item.role).length;
      const pct = Math.round((count / Math.max(1, MOCK_SYSTEM_USERS.length)) * 100);
      return { ...item, count, pct };
    });
  }, []);

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter((log) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Category', 'Severity', 'Action', 'Target', 'IP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actorName}"`,
      l.actorRole,
      l.category,
      l.severity,
      `"${l.action}"`,
      `"${l.target}"`,
      l.ipAddress,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ceb_portal_audit_logs.csv';
    a.click();
    URL.revokeObjectURL(url);

    setExportMessage(`Exported ${filteredLogs.length} audit log records to CSV.`);
    setTimeout(() => setExportMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              System Administration & Audit Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor portal governance, user roles, CEB divisions, and real-time security audit events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/departments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Divisions</span>
          </Link>
        </div>
      </div>

      {/* Export toast */}
      {exportMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 flex items-center justify-between text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Portal Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalUsers}</div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{metrics.activeUsers} Active</span> •{' '}
            <span className="text-rose-600 font-semibold">{metrics.suspendedUsers} Suspended</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              CEB Divisions
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.activeDepts}</div>
          <p className="text-xs text-slate-500 mt-1">
            All {metrics.totalDepts} configured divisions active
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Published Vacancies
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.publishedVacancies}</div>
          <p className="text-xs text-slate-500 mt-1">2026/2027 Recruitment Cycle</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Audit & Security Events
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalAuditLogs}</div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-amber-700 font-semibold">{metrics.flaggedEvents} Flagged</span>{' '}
            requiring attention
          </p>
        </div>
      </div>

      {/* 3. Analytics Chart + Role Distribution & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Portal Activity Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>7-Day Recruitment & Review Activity</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily candidate submissions compared with HR & Board reviews
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_ADMIN_ACTIVITY_SERIES}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar
                  dataKey="submissions"
                  name="New Applications"
                  fill="#0284c7"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="reviews"
                  name="HR / Board Reviews"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Role Breakdown + System Health */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">User Distribution by Role</h2>
              <Link
                to="/admin/users"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {roleBreakdown.map((item) => (
                <div key={item.role} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-medium">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-600" />
              <span>Portal Services & Policy Status</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Auth Guard
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  Max PDF Size
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  5 MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. System Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">System Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable record of user administration, recruitment approvals, and security events.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by actor, action, target, or IP..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'RECRUITMENT', 'USER_ADMIN', 'AUTH', 'SYSTEM'] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {cat === 'ALL' ? 'All Events' : CATEGORY_LABEL[cat]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Actor</th>
                <th className="py-3 px-4 font-bold">Action & Target</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Severity</th>
                <th className="py-3 px-4 font-bold text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit log events match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const sev = SEVERITY_BADGE[log.severity];
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-sky-50/40 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{log.actorName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              ROLE_BADGE_CLASS[log.actorRole]
                            }`}
                          >
                            {log.actorRole}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{log.action}</p>
                        <p className="text-[11px] text-slate-500">{log.target}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {CATEGORY_LABEL[log.category]}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${sev.bg} ${sev.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Event Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedLog.id.toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                      SEVERITY_BADGE[selectedLog.severity].bg
                    } ${SEVERITY_BADGE[selectedLog.severity].text}`}
                  >
                    {selectedLog.severity === 'CRITICAL' && (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {selectedLog.severity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{selectedLog.action}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Timestamp</span>
                <span className="font-mono font-semibold text-slate-800">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Actor</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.actorName} ({selectedLog.actorRole})
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Target Resource</span>
                <span className="font-semibold text-slate-800 text-right">{selectedLog.target}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Source IP</span>
                <span className="font-mono font-semibold text-slate-800">{selectedLog.ipAddress}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs text-slate-700 leading-relaxed">
              <strong className="text-sky-900 block mb-0.5">Event Details:</strong>
              {selectedLog.details}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
