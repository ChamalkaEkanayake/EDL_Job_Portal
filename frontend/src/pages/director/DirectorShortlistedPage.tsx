import React, { useState, useMemo } from 'react';
import {
  Search,
  Award,
  FileCheck2,
  CheckCircle2,
  X,
  Eye,
  Clock,
} from 'lucide-react';
import {
  getHrApplications,
  saveHrApplications,
  appendAuditLog,
  pushNotification,
} from '../../utils/portalStorage';
import { useAuth } from '../../contexts/AuthContext';
import type { HrApplication } from '../../types';
import { DirectorEvaluationModal } from '../../components/director/DirectorEvaluationModal';

type QueueTab = 'AWAITING_BOARD' | 'HR_SHORTLISTED' | 'ALL_BOARD_STAGE';

export const DirectorShortlistedPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<HrApplication[]>(() => getHrApplications());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [activeTab, setActiveTab] = useState<QueueTab>('AWAITING_BOARD');
  const [selectedApp, setSelectedApp] = useState<HrApplication | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 4500);
  };

  const departments = useMemo(() => {
    const depts = Array.from(new Set(applications.map((a) => a.department)));
    return ['ALL', ...depts];
  }, [applications]);

  const counts = useMemo(() => {
    const awaiting = applications.filter(
      (a) => a.status === 'Forwarded to Director Board'
    ).length;
    const hrPool = applications.filter((a) => a.status === 'Shortlisted').length;
    const allStage = applications.filter(
      (a) =>
        a.status === 'Forwarded to Director Board' ||
        a.status === 'Shortlisted' ||
        a.status === 'Approved' ||
        a.status === 'Rejected'
    ).length;
    return { awaiting, hrPool, allStage };
  }, [applications]);

  const filteredList = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesTab =
          activeTab === 'AWAITING_BOARD'
            ? app.status === 'Forwarded to Director Board'
            : activeTab === 'HR_SHORTLISTED'
            ? app.status === 'Shortlisted'
            : app.status === 'Forwarded to Director Board' ||
              app.status === 'Shortlisted' ||
              app.status === 'Approved' ||
              app.status === 'Rejected';

        if (!matchesTab) return false;

        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          app.candidateName.toLowerCase().includes(q) ||
          app.referenceNo.toLowerCase().includes(q) ||
          app.candidateNic.toLowerCase().includes(q) ||
          app.jobTitle.toLowerCase().includes(q);

        const matchesDept =
          selectedDepartment === 'ALL' || app.department === selectedDepartment;

        return matchesSearch && matchesDept;
      })
      .sort(
        (a, b) =>
          (b.examMarks || 0) + (b.interviewMarks || 0) - ((a.examMarks || 0) + (a.interviewMarks || 0))
      );
  }, [applications, activeTab, searchQuery, selectedDepartment]);

  const handleBoardDecision = (
    applicationId: string,
    decision: 'Approved' | 'Rejected',
    boardRemarks: string
  ) => {
    const target = applications.find((a) => a.id === applicationId);
    const updated = applications.map((app) =>
      app.id === applicationId
        ? {
            ...app,
            status: decision,
            boardRemarks,
            statusRemark:
              decision === 'Approved'
                ? 'Appointment confirmed by Director Board. Official offer letter queued for dispatch.'
                : 'Application declined following Director Board review.',
          }
        : app
    );
    setApplications(updated);
    saveHrApplications(updated);

    if (target) {
      pushNotification({
        targetRole: 'APPLICANT',
        targetEmail: target.candidateEmail,
        title: `Board Decision (${target.referenceNo}): Your application is ${decision}`,
        category: 'Approval',
        statusTag: decision,
        actionRequired: decision === 'Approved',
        actionPath: '/applicant/applications',
      });
      pushNotification({
        targetRole: 'HR',
        title: `Director Board ${decision} ${target.candidateName} (${target.referenceNo})`,
        category: 'Approval',
        statusTag: `Board ${decision}`,
        actionPath: '/hr/applications',
      });
      appendAuditLog({
        actorName: currentUser?.name || 'Director Board Member',
        actorRole: currentUser?.role || 'DIRECTOR',
        action:
          decision === 'Approved'
            ? 'Board Approval Granted'
            : 'Board Rejected Candidate',
        target: `Application ${target.referenceNo} (${target.candidateName})`,
        category: 'RECRUITMENT',
        severity: 'INFO',
        details: boardRemarks,
      });
      showToast(
        `${decision} recorded for ${target.candidateName} (${target.referenceNo}).`
      );
    }
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Shortlisted Applications & Board Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect verified candidate dossiers, marks, and HR recommendations before final ratification.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>{counts.awaiting} Pending Board Decision</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, NIC, reference no, or vacancy title..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 font-medium cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'ALL' ? 'All CEB Divisions' : dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {(
            [
              { id: 'AWAITING_BOARD', label: 'Awaiting Board Decision', count: counts.awaiting },
              { id: 'HR_SHORTLISTED', label: 'HR Shortlisted Pool', count: counts.hrPool },
              { id: 'ALL_BOARD_STAGE', label: 'All Board-Stage', count: counts.allStage },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
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

      {/* Candidate Merit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5 font-bold">Candidate & Ref</th>
                <th className="py-3.5 px-4 font-bold">Position & Division</th>
                <th className="py-3.5 px-4 font-bold text-center">Exam</th>
                <th className="py-3.5 px-4 font-bold text-center">Interview</th>
                <th className="py-3.5 px-4 font-bold text-center">Total / 200</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No shortlisted or board-forwarded candidates match your filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((app) => {
                  const total = (app.examMarks || 0) + (app.interviewMarks || 0);
                  const canDecide = app.status === 'Forwarded to Director Board';
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                              {app.referenceNo}
                            </span>
                            {app.meritRank && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                <Award className="w-3 h-3" />#{app.meritRank}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900">{app.candidateName}</p>
                          <p className="text-[11px] text-slate-500">
                            NIC: {app.candidateNic} • {app.experienceYears} yrs exp
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{app.jobTitle}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{app.department}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <FileCheck2 className="w-3 h-3" />
                            {app.documents.length} Docs
                          </span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {app.examMarks ?? '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {app.interviewMarks ?? '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black text-xs">
                          {total > 0 ? total : '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : app.status === 'Forwarded to Director Board'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            canDecide
                              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-2xs'
                              : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{canDecide ? 'Review & Decide' : 'View Dossier'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <DirectorEvaluationModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onDecision={handleBoardDecision}
        onToast={showToast}
      />
    </div>
  );
};
