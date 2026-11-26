import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
  Award,
  FileCheck2,
  Building2,
  X,
  BarChart3,
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
  getHrApplications,
  saveHrApplications,
  appendAuditLog,
} from '../../utils/portalStorage';
import { useAuth } from '../../contexts/AuthContext';
import type { HrApplication } from '../../types';
import { DirectorEvaluationModal } from '../../components/director/DirectorEvaluationModal';

export const DirectorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<HrApplication[]>(() => getHrApplications());
  const [selectedApp, setSelectedApp] = useState<HrApplication | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 4500);
  };

  const metrics = useMemo(() => {
    const awaitingBoard = applications.filter(
      (a) => a.status === 'Forwarded to Director Board'
    ).length;
    const hrShortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
    const approved = applications.filter((a) => a.status === 'Approved').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    return { awaitingBoard, hrShortlisted, approved, rejected };
  }, [applications]);

  const pendingBoardQueue = useMemo(() => {
    return applications
      .filter((a) => a.status === 'Forwarded to Director Board')
      .sort(
        (a, b) =>
          (b.examMarks || 0) + (b.interviewMarks || 0) - ((a.examMarks || 0) + (a.interviewMarks || 0))
      );
  }, [applications]);

  const divisionChartData = useMemo(() => {
    const map = new Map<
      string,
      { division: string; pending: number; approved: number; rejected: number }
    >();
    applications.forEach((app) => {
      if (
        app.status !== 'Forwarded to Director Board' &&
        app.status !== 'Approved' &&
        app.status !== 'Rejected'
      ) {
        return;
      }
      const shortDiv = app.department.replace(' Division', '');
      const entry = map.get(shortDiv) || {
        division: shortDiv,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
      if (app.status === 'Forwarded to Director Board') entry.pending += 1;
      if (app.status === 'Approved') entry.approved += 1;
      if (app.status === 'Rejected') entry.rejected += 1;
      map.set(shortDiv, entry);
    });
    return Array.from(map.values());
  }, [applications]);

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
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Director Board Evaluation Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review HR-recommended candidates, inspect verified dossiers, and ratify final appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            to="/director/shortlisted"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Shortlisted Queue</span>
          </Link>
          <Link
            to="/director/approvals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Approvals Ledger</span>
          </Link>
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

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border shadow-2xs ${
            metrics.awaitingBoard > 0
              ? 'bg-purple-50/50 border-purple-200'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Awaiting Board
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-800">{metrics.awaitingBoard}</div>
          <p className="text-[11px] text-purple-900/70 mt-1">
            Forwarded by HR for ratification
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              HR Shortlisted Pool
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.hrShortlisted}</div>
          <p className="text-[11px] text-slate-500 mt-1">Currently in HR interviews</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Board Approved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.approved}</div>
          <p className="text-[11px] text-slate-500 mt-1">Appointments ratified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Board Rejected
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.rejected}</div>
          <p className="text-[11px] text-slate-500 mt-1">Declined with remarks</p>
        </div>
      </div>

      {/* 3. Division Chart & Priority Board Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <span>Division Selection Overview</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Board dockets by CEB division (Pending vs Decided)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={divisionChartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="division"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar
                  dataKey="pending"
                  name="Awaiting Board"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="approved"
                  name="Approved"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="rejected"
                  name="Rejected"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Priority Board Dockets */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Priority Dockets Awaiting Decision
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ranked by combined Exam & Interview evaluation scores
              </p>
            </div>
            <Link
              to="/director/shortlisted"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 shrink-0"
            >
              <span>Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingBoardQueue.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">All Board Dockets Reviewed</p>
              <p className="text-xs text-slate-500 mt-1">
                No candidates are currently waiting for Director Board approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBoardQueue.map((app) => {
                const total = (app.examMarks || 0) + (app.interviewMarks || 0);
                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2 py-0.5 rounded-md">
                          {app.referenceNo}
                        </span>
                        {app.meritRank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Rank #{app.meritRank}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          Score: {total}/200
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {app.candidateName}
                      </h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {app.jobTitle} • <strong>{app.department}</strong>
                        </span>
                      </p>
                      {app.hrRemarks && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          HR Memo: {app.hrRemarks}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0"
                    >
                      <span>Inspect & Decide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Modal */}
      <DirectorEvaluationModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onDecision={handleBoardDecision}
        onToast={showToast}
      />
    </div>
  );
};
