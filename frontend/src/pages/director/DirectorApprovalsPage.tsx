import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Search,
  Download,
  FileText,
  Printer,
  X,
  Award,
  TrendingUp,
} from 'lucide-react';
import { getHrApplications } from '../../utils/portalStorage';
import type { HrApplication } from '../../types';
import { CebJobPortalLogo } from '../../components/common/CebJobPortalLogo';

type DecisionFilter = 'ALL' | 'Approved' | 'Rejected';

export const DirectorApprovalsPage: React.FC = () => {
  const [applications] = useState<HrApplication[]>(() => getHrApplications());
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [resolutionApp, setResolutionApp] = useState<HrApplication | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const decidedApplications = useMemo(
    () => applications.filter((a) => a.status === 'Approved' || a.status === 'Rejected'),
    [applications]
  );

  const departments = useMemo(() => {
    const depts = Array.from(new Set(decidedApplications.map((a) => a.department)));
    return ['ALL', ...depts];
  }, [decidedApplications]);

  const metrics = useMemo(() => {
    const total = decidedApplications.length;
    const approved = decidedApplications.filter((a) => a.status === 'Approved').length;
    const rejected = decidedApplications.filter((a) => a.status === 'Rejected').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, rejected, approvalRate };
  }, [decidedApplications]);

  const filteredDecisions = useMemo(() => {
    return decidedApplications.filter((app) => {
      const matchesDecision =
        decisionFilter === 'ALL' || app.status === decisionFilter;
      const matchesDept =
        selectedDepartment === 'ALL' || app.department === selectedDepartment;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        app.candidateName.toLowerCase().includes(q) ||
        app.referenceNo.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        (app.boardRemarks && app.boardRemarks.toLowerCase().includes(q));
      return matchesDecision && matchesDept && matchesSearch;
    });
  }, [decidedApplications, decisionFilter, selectedDepartment, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'ReferenceNo',
      'CandidateName',
      'NIC',
      'JobCode',
      'JobTitle',
      'Division',
      'TotalScore',
      'Decision',
      'BoardRemarks',
    ];
    const rows = filteredDecisions.map((a) => [
      a.referenceNo,
      `"${a.candidateName}"`,
      a.candidateNic,
      a.jobCode,
      `"${a.jobTitle}"`,
      `"${a.department}"`,
      (a.examMarks || 0) + (a.interviewMarks || 0),
      a.status,
      `"${(a.boardRemarks || a.statusRemark || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ceb_director_board_decisions.csv';
    link.click();
    URL.revokeObjectURL(url);

    setToast(`Exported ${filteredDecisions.length} Board decision records to CSV.`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Board Approvals & Decision Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official record of Director Board appointment approvals, rejections, and signed remarks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-sky-600" />
          <span>Export Decisions CSV</span>
        </button>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Decisions
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Board resolutions recorded</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Approval Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.approvalRate}%</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Of evaluated dockets</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.approved}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Offer letters authorized</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{metrics.rejected}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Declined with remarks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, reference no, position, or Board remarks..."
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
                {dept === 'ALL' ? 'All Divisions' : dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {(
            [
              { id: 'ALL', label: 'All Decisions', count: metrics.total },
              { id: 'Approved', label: 'Approved Only', count: metrics.approved },
              { id: 'Rejected', label: 'Rejected Only', count: metrics.rejected },
            ] as const
          ).map((tab) => {
            const isActive = decisionFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDecisionFilter(tab.id)}
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

      {/* Decisions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5 font-bold">Candidate & Ref</th>
                <th className="py-3.5 px-4 font-bold">Position & Division</th>
                <th className="py-3.5 px-4 font-bold text-center">Score</th>
                <th className="py-3.5 px-4 font-bold">Decision</th>
                <th className="py-3.5 px-4 font-bold">Board Remarks</th>
                <th className="py-3.5 px-5 font-bold text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No Board decision records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((app) => {
                  const total = (app.examMarks || 0) + (app.interviewMarks || 0);
                  const isApproved = app.status === 'Approved';
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {app.referenceNo}
                        </span>
                        <p className="font-bold text-slate-900 mt-1">{app.candidateName}</p>
                        <p className="text-[11px] text-slate-500">NIC: {app.candidateNic}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{app.jobTitle}</p>
                        <p className="text-[11px] text-slate-500">{app.department}</p>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800">{total}/200</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {app.boardRemarks || app.statusRemark}
                        </p>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setResolutionApp(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span>Resolution</span>
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

      {/* Board Resolution Modal */}
      {resolutionApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <CebJobPortalLogo size="sm" />
                <h2 className="text-lg font-bold text-slate-900 pt-1">
                  Official Board Recruitment Resolution
                </h2>
                <p className="text-xs text-slate-500">
                  Ceylon Electricity Board • Board of Directors Minute Record
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResolutionApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Application Reference</span>
                <span className="font-mono font-bold text-sky-700">
                  {resolutionApp.referenceNo}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Candidate Name</span>
                <span className="font-bold text-slate-900">{resolutionApp.candidateName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">NIC Number</span>
                <span className="font-semibold text-slate-800">{resolutionApp.candidateNic}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Position</span>
                <span className="font-semibold text-slate-800 text-right">
                  {resolutionApp.jobTitle}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">CEB Division</span>
                <span className="font-semibold text-slate-800">{resolutionApp.department}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Combined Assessment Score</span>
                <span className="font-bold text-slate-900">
                  {(resolutionApp.examMarks || 0) + (resolutionApp.interviewMarks || 0)} / 200
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-slate-200">
                <span className="text-slate-500">Final Board Decision</span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full border ${
                    resolutionApp.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {resolutionApp.status}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs space-y-1">
              <p className="font-bold text-sky-900">Director Board Remarks:</p>
              <p className="text-sky-950 leading-relaxed">
                {resolutionApp.boardRemarks || resolutionApp.statusRemark}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Resolution</span>
              </button>
              <button
                type="button"
                onClick={() => setResolutionApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
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
