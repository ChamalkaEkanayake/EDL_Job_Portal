import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  UserCheck,
  Briefcase,
  Pencil,
  Power,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Settings,
  Save,
  Bell,
  Megaphone,
  ShieldCheck,
  Mail,
  MessageSquare,
  RotateCcw,
  Eye,
} from 'lucide-react';
import {
  DEFAULT_NOTIFICATION_TEMPLATES,
  type DepartmentItem,
  type PortalSettings,
  type NotificationTemplate,
} from '../../data/mockRecruitmentData';
import {
  getDepartments,
  saveDepartments,
  getPortalSettings,
  savePortalSettings,
  getNotificationTemplates,
  saveNotificationTemplates,
  getSystemUsers,
  appendAuditLog,
} from '../../utils/portalStorage';
import { useAuth } from '../../contexts/AuthContext';

type StatusFilter = 'ALL' | 'Active' | 'Inactive';
type SettingsTab = 'DIVISIONS' | 'PORTAL_CONFIG' | 'TEMPLATES';

const TEMPLATE_VARIABLES = [
  '{{candidateName}}',
  '{{referenceNo}}',
  '{{jobTitle}}',
  '{{division}}',
  '{{date}}',
  '{{remark}}',
];

const SAMPLE_PREVIEW_VALUES: Record<string, string> = {
  '{{candidateName}}': 'Chamalka Ekanayaka',
  '{{referenceNo}}': 'CEB-2026-EE04',
  '{{jobTitle}}': 'Electrical Engineer (Transmission & Grid Planning)',
  '{{division}}': 'Transmission Division',
  '{{date}}': '2026-12-10',
  '{{remark}}': 'Please upload a JP-certified copy of your B.Sc. Degree Certificate.',
};

function renderPreviewText(text: string): string {
  return Object.entries(SAMPLE_PREVIEW_VALUES).reduce(
    (acc, [token, val]) => acc.split(token).join(val),
    text
  );
}

export const DepartmentSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => getDepartments());
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(() => getPortalSettings());
  const [templates, setTemplates] = useState<NotificationTemplate[]>(() =>
    getNotificationTemplates()
  );
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('DIVISIONS');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    () => getNotificationTemplates()[0]?.id || 'tpl-submitted'
  );
  const [showTemplatePreview, setShowTemplatePreview] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add / Edit Division Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deptForm, setDeptForm] = useState<{
    code: string;
    name: string;
    headOfDivision: string;
    assignedHrCoordinator: string;
    location: string;
    status: 'Active' | 'Inactive';
  }>({
    code: '',
    name: '',
    headOfDivision: '',
    assignedHrCoordinator: 'Nimali Senanayake',
    location: '',
    status: 'Active',
  });

  // Inline deactivation confirmation
  const [pendingDeactivate, setPendingDeactivate] = useState<DepartmentItem | null>(null);

  const hrStaffOptions = useMemo(() => {
    const hrs = getSystemUsers().filter((u) => u.role === 'HR').map((u) => u.name);
    return hrs.length > 0 ? hrs : ['Nimali Senanayake', 'Tharindu Jayawardena'];
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const persistDepartments = (next: DepartmentItem[], message?: string) => {
    setDepartments(next);
    saveDepartments(next);
    if (message) showToast(message, 'success');
  };

  const metrics = useMemo(() => {
    return {
      total: departments.length,
      active: departments.filter((d) => d.status === 'Active').length,
      inactive: departments.filter((d) => d.status === 'Inactive').length,
      totalOpenVacancies: departments.reduce((sum, d) => sum + d.openVacancies, 0),
    };
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        dept.code.toLowerCase().includes(q) ||
        dept.name.toLowerCase().includes(q) ||
        dept.headOfDivision.toLowerCase().includes(q) ||
        dept.location.toLowerCase().includes(q) ||
        (dept.assignedHrCoordinator && dept.assignedHrCoordinator.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'ALL' || dept.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingDept(null);
    setDeptForm({
      code: '',
      name: '',
      headOfDivision: '',
      assignedHrCoordinator: hrStaffOptions[0],
      location: 'Head Office, Colombo 02',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const openEditModal = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setDeptForm({
      code: dept.code,
      name: dept.name,
      headOfDivision: dept.headOfDivision,
      assignedHrCoordinator: dept.assignedHrCoordinator || hrStaffOptions[0],
      location: dept.location,
      status: dept.status,
    });
    setModalOpen(true);
  };

  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = deptForm.code.trim().toUpperCase();
    const cleanName = deptForm.name.trim();
    if (!cleanCode || !cleanName || !deptForm.headOfDivision.trim()) return;

    const duplicateCode = departments.some(
      (d) => d.code.toUpperCase() === cleanCode && d.id !== editingDept?.id
    );
    if (duplicateCode) {
      showToast(`Division code "${cleanCode}" already exists.`, 'error');
      return;
    }

    if (editingDept) {
      const next = departments.map((d) =>
        d.id === editingDept.id
          ? {
              ...d,
              code: cleanCode,
              name: cleanName,
              headOfDivision: deptForm.headOfDivision.trim(),
              assignedHrCoordinator: deptForm.assignedHrCoordinator,
              location: deptForm.location.trim(),
              status: deptForm.status,
            }
          : d
      );
      persistDepartments(next, `Updated "${cleanName}" (${cleanCode}).`);
      appendAuditLog({
        actorName: currentUser?.name || 'System Admin',
        actorRole: currentUser?.role || 'ADMIN',
        action: 'Updated Division Metadata',
        target: `${cleanName} (${cleanCode})`,
        category: 'SYSTEM',
        severity: 'INFO',
        details: `Head: ${deptForm.headOfDivision.trim()}, HR Coordinator: ${deptForm.assignedHrCoordinator}.`,
      });
    } else {
      const newDept: DepartmentItem = {
        id: `dept-${Date.now()}`,
        code: cleanCode,
        name: cleanName,
        headOfDivision: deptForm.headOfDivision.trim(),
        assignedHrCoordinator: deptForm.assignedHrCoordinator,
        location: deptForm.location.trim(),
        status: deptForm.status,
        openVacancies: 0,
      };
      persistDepartments([newDept, ...departments], `Added new division "${cleanName}" (${cleanCode}).`);
      appendAuditLog({
        actorName: currentUser?.name || 'System Admin',
        actorRole: currentUser?.role || 'ADMIN',
        action: 'Created New CEB Division',
        target: `${cleanName} (${cleanCode})`,
        category: 'SYSTEM',
        severity: 'INFO',
        details: `Assigned HR Coordinator: ${deptForm.assignedHrCoordinator}.`,
      });
    }
    setModalOpen(false);
  };

  const handleToggleStatus = (dept: DepartmentItem) => {
    if (dept.status === 'Active') {
      setPendingDeactivate(dept);
      return;
    }
    const next = departments.map((d) =>
      d.id === dept.id ? { ...d, status: 'Active' as const } : d
    );
    persistDepartments(next, `Activated "${dept.name}".`);
    appendAuditLog({
      actorName: currentUser?.name || 'System Admin',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'Activated CEB Division',
      target: `${dept.name} (${dept.code})`,
      category: 'SYSTEM',
      severity: 'INFO',
      details: 'Division re-opened for vacancy publishing.',
    });
  };

  const confirmDeactivate = () => {
    if (!pendingDeactivate) return;
    const next = departments.map((d) =>
      d.id === pendingDeactivate.id ? { ...d, status: 'Inactive' as const } : d
    );
    persistDepartments(
      next,
      `Marked "${pendingDeactivate.name}" as Inactive. New vacancies cannot be published under it.`
    );
    appendAuditLog({
      actorName: currentUser?.name || 'System Admin',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'Deactivated CEB Division',
      target: `${pendingDeactivate.name} (${pendingDeactivate.code})`,
      category: 'SYSTEM',
      severity: 'WARNING',
      details: 'Paused new vacancy publishing for this division.',
    });
    setPendingDeactivate(null);
  };

  const handleSavePortalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePortalSettings(portalSettings);
    appendAuditLog({
      actorName: currentUser?.name || 'System Admin',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'Updated Global Portal Settings',
      target: `Cycle ${portalSettings.recruitmentCycle} • Max ${portalSettings.maxUploadSizeMb}MB`,
      category: 'SYSTEM',
      severity: portalSettings.maintenanceMode ? 'WARNING' : 'INFO',
      details: `Maintenance Mode: ${portalSettings.maintenanceMode ? 'ON' : 'OFF'}, Registration: ${
        portalSettings.allowApplicantRegistration ? 'OPEN' : 'CLOSED'
      }.`,
    });
    showToast('Global portal settings and notification rules saved successfully.');
  };

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || templates[0],
    [templates, selectedTemplateId]
  );

  const updateActiveTemplate = (patch: Partial<NotificationTemplate>) => {
    if (!activeTemplate) return;
    setTemplates((prev) =>
      prev.map((t) => (t.id === activeTemplate.id ? { ...t, ...patch } : t))
    );
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;
    const stamped = templates.map((t) =>
      t.id === activeTemplate.id ? { ...t, lastUpdated: '2026-11-26' } : t
    );
    setTemplates(stamped);
    saveNotificationTemplates(stamped);
    appendAuditLog({
      actorName: currentUser?.name || 'System Admin',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'Updated Notification Template',
      target: activeTemplate.title,
      category: 'SYSTEM',
      severity: 'INFO',
      details: `Channels — Email: ${activeTemplate.channels.email ? 'ON' : 'OFF'}, SMS: ${
        activeTemplate.channels.sms ? 'ON' : 'OFF'
      }, Portal: ${activeTemplate.channels.portalAlert ? 'ON' : 'OFF'}.`,
    });
    showToast(`Saved template "${activeTemplate.title}".`);
  };

  const handleResetTemplate = () => {
    if (!activeTemplate) return;
    const original = DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === activeTemplate.id);
    if (!original) return;
    const resetList = templates.map((t) => (t.id === activeTemplate.id ? original : t));
    setTemplates(resetList);
    saveNotificationTemplates(resetList);
    showToast(`Reset "${original.title}" to official CEB default wording.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Department & Portal Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure CEB divisions, assign HR coordinators, and manage global recruitment policies.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Division</span>
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

      {/* Inline Deactivate Confirmation */}
      {pendingDeactivate && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Deactivate <strong>{pendingDeactivate.name}</strong> ({pendingDeactivate.code})? HR
              will not be able to publish new vacancies for this division while inactive.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setPendingDeactivate(null)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeactivate}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
            >
              Confirm Deactivate
            </button>
          </div>
        </div>
      )}

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Divisions
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Configured CEB units</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Divisions
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.active}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Open for recruitment</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Inactive / Archived
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Power className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.inactive}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Paused divisions</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Open Vacancies
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalOpenVacancies}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all active divisions</p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-2xs flex flex-wrap gap-1.5">
        {(
          [
            {
              id: 'DIVISIONS',
              label: 'CEB Divisions Directory',
              icon: <Building2 className="w-4 h-4" />,
              badge: metrics.total,
            },
            {
              id: 'PORTAL_CONFIG',
              label: 'Portal Configuration',
              icon: <Settings className="w-4 h-4" />,
            },
            {
              id: 'TEMPLATES',
              label: 'Notification & Email Templates',
              icon: <Mail className="w-4 h-4" />,
              badge: templates.length,
            },
          ] as const
        ).map((tab) => {
          const isActive = activeSettingsTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeSettingsTab === 'DIVISIONS' && (
        <>
          {/* 3. Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. TRN-01), division name, head, or HR coordinator..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'ALL', label: 'All Divisions', count: metrics.total },
              { id: 'Active', label: 'Active', count: metrics.active },
              { id: 'Inactive', label: 'Inactive', count: metrics.inactive },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
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
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CEB Divisions Directory Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-2xs">
          <Building2 className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No matching CEB divisions</p>
          <p className="text-xs text-slate-500 mt-1">
            Adjust your search query or add a new division.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => {
            const isActive = dept.status === 'Active';
            return (
              <div
                key={dept.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between gap-4 transition ${
                  isActive ? 'border-slate-200/90 hover:border-sky-300' : 'border-slate-200 opacity-75 bg-slate-50/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 rounded-md">
                      {dept.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {dept.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{dept.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Head: <strong className="text-slate-800">{dept.headOfDivision}</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>
                        HR Coordinator:{' '}
                        <strong className="text-slate-700">
                          {dept.assignedHrCoordinator || 'Unassigned'}
                        </strong>
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{dept.location}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {dept.openVacancies} Open {dept.openVacancies === 1 ? 'Vacancy' : 'Vacancies'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-700 hover:border-sky-200 transition cursor-pointer"
                      title="Edit Division"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(dept)}
                      className={`p-1.5 rounded-lg border bg-white transition cursor-pointer ${
                        isActive
                          ? 'border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-200'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={isActive ? 'Deactivate Division' : 'Activate Division'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* 5. Global Recruitment Portal Configuration */}
      {activeSettingsTab === 'PORTAL_CONFIG' && (
      <form
        onSubmit={handleSavePortalSettings}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-600" />
              <span>Global Recruitment Portal Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              System-wide recruitment cycle rules, upload limits, candidate notifications, and portal notices.
            </p>
          </div>
          {portalSettings.maintenanceMode && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              Maintenance Mode Enabled
            </span>
          )}
        </div>

        {/* Core Policy Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Active Recruitment Cycle
            </label>
            <input
              type="text"
              value={portalSettings.recruitmentCycle}
              onChange={(e) =>
                setPortalSettings({ ...portalSettings, recruitmentCycle: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Max Document Upload Size
            </label>
            <select
              value={portalSettings.maxUploadSizeMb}
              onChange={(e) =>
                setPortalSettings({
                  ...portalSettings,
                  maxUploadSizeMb: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 cursor-pointer"
            >
              <option value={2}>2 MB per file</option>
              <option value={5}>5 MB per file (Standard)</option>
              <option value={10}>10 MB per file</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Allowed Attachment Types
            </label>
            <select
              value={portalSettings.allowedFileTypes}
              onChange={(e) =>
                setPortalSettings({
                  ...portalSettings,
                  allowedFileTypes: e.target.value as PortalSettings['allowedFileTypes'],
                })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 cursor-pointer"
            >
              <option value="PDF_ONLY">PDF Documents Only</option>
              <option value="PDF_AND_IMAGES">PDF & Certified Scans (JPG/PNG)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Session Idle Timeout
            </label>
            <select
              value={portalSettings.sessionTimeoutMinutes}
              onChange={(e) =>
                setPortalSettings({
                  ...portalSettings,
                  sessionTimeoutMinutes: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(
            [
              {
                key: 'allowApplicantRegistration',
                title: 'Allow External Applicant Registration',
                desc: 'Enable public candidate account sign-ups via the Register page.',
                icon: UserCheck,
              },
              {
                key: 'requireJpCertificationNotice',
                title: 'Mandatory JP Certification Notice',
                desc: 'Display Justice of the Peace certified copy disclaimer during application.',
                icon: ShieldCheck,
              },
              {
                key: 'automatedCandidateAlerts',
                title: 'Automated Candidate Email & SMS Alerts',
                desc: 'Notify applicants automatically on shortlisting, further info requests, and approval.',
                icon: Bell,
              },
              {
                key: 'maintenanceMode',
                title: 'Portal Maintenance Mode',
                desc: 'Temporarily pause new application submissions while retaining Admin access.',
                icon: AlertTriangle,
              },
            ] as const
          ).map((toggle) => {
            const IconComp = toggle.icon;
            const enabled = portalSettings[toggle.key];
            return (
              <div
                key={toggle.key}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      toggle.key === 'maintenanceMode' && enabled
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-white text-sky-600 border border-slate-200'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{toggle.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{toggle.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPortalSettings({ ...portalSettings, [toggle.key]: !enabled })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer ${
                    enabled
                      ? toggle.key === 'maintenanceMode'
                        ? 'bg-rose-600'
                        : 'bg-sky-600'
                      : 'bg-slate-300'
                  }`}
                  aria-pressed={enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs transform transition ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Portal Announcement Banner */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-sky-600" />
            <span>Global Portal Announcement Notice</span>
          </label>
          <textarea
            rows={2}
            value={portalSettings.announcementBanner}
            onChange={(e) =>
              setPortalSettings({ ...portalSettings, announcementBanner: e.target.value })
            }
            placeholder="Enter a recruitment notice or reminder banner for applicants..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Portal Settings</span>
          </button>
        </div>
      </form>
      )}

      {/* 6. Official Notification & Email Templates Tab */}
      {activeSettingsTab === 'TEMPLATES' && activeTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Template Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-2.5">
              <div className="pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Recruitment Event Templates</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Customize automated messages dispatched to candidates at key milestones.
                </p>
              </div>

              {templates.map((tpl) => {
                const isSelected = tpl.id === activeTemplate.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-200'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {tpl.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
                        {tpl.triggerStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          tpl.channels.email
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        Email {tpl.channels.email ? 'ON' : 'OFF'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          tpl.channels.sms
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        SMS {tpl.channels.sms ? 'ON' : 'OFF'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          tpl.channels.portalAlert
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        Portal {tpl.channels.portalAlert ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Editor & Live Preview */}
          <div className="lg:col-span-8 space-y-5">
            <form
              onSubmit={handleSaveTemplate}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activeTemplate.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      Trigger: {activeTemplate.triggerStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Last updated: {activeTemplate.lastUpdated}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    <span>{showTemplatePreview ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
                    title="Reset to default CEB wording"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Delivery Channels
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { key: 'email', label: 'Official Email', icon: Mail },
                      { key: 'sms', label: 'SMS Gateway', icon: MessageSquare },
                      { key: 'portalAlert', label: 'In-Portal Bell', icon: Bell },
                    ] as const
                  ).map((ch) => {
                    const ChIcon = ch.icon;
                    const active = activeTemplate.channels[ch.key];
                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() =>
                          updateActiveTemplate({
                            channels: {
                              ...activeTemplate.channels,
                              [ch.key]: !active,
                            },
                          })
                        }
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          active
                            ? 'bg-sky-50 border-sky-200 text-sky-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ChIcon className="w-3.5 h-3.5" />
                          {ch.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {active ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={activeTemplate.subject}
                  onChange={(e) => updateActiveTemplate({ subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Message Body + Variable Pills */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Message Body *</label>
                  <span className="text-[11px] text-slate-400">
                    Click a token to append:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() =>
                        updateActiveTemplate({
                          body: `${activeTemplate.body}${
                            activeTemplate.body.endsWith(' ') || activeTemplate.body.endsWith('\n')
                              ? ''
                              : ' '
                          }${variable}`,
                        })
                      }
                      className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 transition cursor-pointer"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={6}
                  required
                  value={activeTemplate.body}
                  onChange={(e) => updateActiveTemplate({ body: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 leading-relaxed"
                />
              </div>

              {/* Footer Disclaimer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official CEB Footer Disclaimer
                </label>
                <input
                  type="text"
                  value={activeTemplate.footerDisclaimer}
                  onChange={(e) => updateActiveTemplate({ footerDisclaimer: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Template</span>
                </button>
              </div>
            </form>

            {/* Live Rendered Preview */}
            {showTemplatePreview && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    Live Rendered Preview (Sample Candidate)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    hr.recruitment@ceb.lk → applicant@ceb.lk
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-xs">
                  <p className="font-bold text-slate-900">
                    Subject: {renderPreviewText(activeTemplate.subject)}
                  </p>
                  <div className="border-t border-slate-200 pt-3 whitespace-pre-line text-slate-700 leading-relaxed">
                    {renderPreviewText(activeTemplate.body)}
                  </div>
                  {activeTemplate.footerDisclaimer && (
                    <p className="border-t border-slate-200 pt-2.5 text-[11px] text-slate-500 italic">
                      {activeTemplate.footerDisclaimer}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Division */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveDivision}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingDept ? 'Edit CEB Division' : 'Add New CEB Division'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure division details and HR coordinator assignment
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    placeholder="ENG-07"
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Division Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    placeholder="e.g. Renewable Energy Division"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Head of Division *
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.headOfDivision}
                  onChange={(e) => setDeptForm({ ...deptForm, headOfDivision: e.target.value })}
                  placeholder="e.g. Eng. S. Jayaweera"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned HR Coordinator
                </label>
                <select
                  value={deptForm.assignedHrCoordinator}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, assignedHrCoordinator: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  {hrStaffOptions.map((hrName) => (
                    <option key={hrName} value={hrName}>
                      {hrName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Location *
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.location}
                  onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
                  placeholder="e.g. Head Office, Colombo 02"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={deptForm.status}
                  onChange={(e) =>
                    setDeptForm({
                      ...deptForm,
                      status: e.target.value as 'Active' | 'Inactive',
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                {editingDept ? 'Update Division' : 'Create Division'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
