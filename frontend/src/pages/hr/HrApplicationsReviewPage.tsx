import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Eye,
  Download,
  Building2,
  X,
  FileText,
  UserCheck,
  Award,
} from 'lucide-react';

import type { HrApplication, ApplicationStatus } from '../../types';
import {
  getHrApplications,
  saveHrApplications,
  getHrVacancies,
  appendAuditLog,
  pushNotification,
} from '../../utils/portalStorage';

export const HrApplicationsReviewPage: React.FC = () => {
  const [applications, setApplications] = useState<HrApplication[]>(() => getHrApplications());
  const vacancies = useMemo(() => getHrVacancies(), []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVacancyId, setSelectedVacancyId] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Scrutiny Modal / Drawer State
  const [selectedApp, setSelectedApp] = useState<HrApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState(
    'Over age limit as specified in Gazette / Scheme of Recruitment'
  );
  const [infoRequestDocLabel, setInfoRequestDocLabel] = useState(
    'Certified Copy of Academic Degree Transcript'
  );
  const [infoRequestNote, setInfoRequestNote] = useState(
    'Please upload a certified true copy with official Justice of the Peace (JP) attestation seal.'
  );
  const [customRemark, setCustomRemark] = useState('');
  const [activeDecisionTab, setActiveDecisionTab] = useState<'ELIGIBLE' | 'INELIGIBLE' | 'REQUEST_INFO'>('ELIGIBLE');

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateNic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVac = selectedVacancyId === 'ALL' || app.vacancyId === selectedVacancyId;

      let matchesStatus = true;
      if (selectedStatusFilter === 'PENDING') {
        matchesStatus = app.status === 'Submitted' || app.status === 'Under HR Review';
      } else if (selectedStatusFilter === 'ELIGIBLE') {
        matchesStatus = app.status === 'Eligible';
      } else if (selectedStatusFilter === 'INELIGIBLE') {
        matchesStatus = app.status === 'Ineligible';
      } else if (selectedStatusFilter === 'REQUEST_INFO') {
        matchesStatus = app.status === 'Requires Further Information';
      } else if (selectedStatusFilter === 'SHORTLISTED') {
        matchesStatus =
          app.status === 'Shortlisted' ||
          app.status === 'Forwarded to Director Board' ||
          app.status === 'Approved';
      }

      return matchesSearch && matchesVac && matchesStatus;
    });
  }, [applications, searchQuery, selectedVacancyId, selectedStatusFilter]);

  // Open Scrutiny Modal
  const handleOpenScrutiny = (app: HrApplication) => {
    setSelectedApp(app);
    setCustomRemark(app.statusRemark || '');
    if (app.status === 'Ineligible') {
      setActiveDecisionTab('INELIGIBLE');
      if (app.ineligibleReason) setRejectionReason(app.ineligibleReason);
    } else if (app.status === 'Requires Further Information') {
      setActiveDecisionTab('REQUEST_INFO');
      if (app.requestedDocLabel) setInfoRequestDocLabel(app.requestedDocLabel);
      if (app.requestedInfoNote) setInfoRequestNote(app.requestedInfoNote);
    } else {
      setActiveDecisionTab('ELIGIBLE');
    }
  };

  // Submit Decision
  const handleApplyDecision = (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;

    let remark = customRemark.trim();
    let ineligibleMsg: string | undefined = undefined;
    let reqDocLabel: string | undefined = undefined;
    let reqNote: string | undefined = undefined;

    if (newStatus === 'Eligible') {
      remark = remark || 'Candidate meets all SOR educational, experience, and age criteria. Approved for Written Competitive Examination.';
    } else if (newStatus === 'Ineligible') {
      ineligibleMsg = rejectionReason;
      remark = remark || `Application rejected: ${rejectionReason}`;
    } else if (newStatus === 'Requires Further Information') {
      reqDocLabel = infoRequestDocLabel;
      reqNote = infoRequestNote;
      remark = remark || `Additional documentation requested: ${infoRequestDocLabel}.`;
    }

    const updated = applications.map((a) =>
      a.id === selectedApp.id
        ? {
            ...a,
            status: newStatus,
            statusRemark: remark,
            ineligibleReason: ineligibleMsg,
            requestedDocLabel: reqDocLabel,
            requestedInfoNote: reqNote,
          }
        : a
    );

    setApplications(updated);
    saveHrApplications(updated);

    pushNotification({
      targetRole: 'APPLICANT',
      targetEmail: selectedApp.candidateEmail,
      title:
        newStatus === 'Requires Further Information'
          ? `Action Required (${selectedApp.referenceNo}): ${infoRequestDocLabel}`
          : `Application ${selectedApp.referenceNo} marked as ${newStatus}`,
      category: 'Application',
      statusTag: newStatus,
      actionRequired: newStatus === 'Requires Further Information',
      actionPath: '/applicant/applications',
    });

    appendAuditLog({
      actorName: 'Nimali Senanayake (HR)',
      actorRole: 'HR',
      action: `Scrutiny Decision: ${newStatus}`,
      target: `${selectedApp.referenceNo} (${selectedApp.candidateName})`,
      category: 'RECRUITMENT',
      severity: newStatus === 'Ineligible' ? 'WARNING' : 'INFO',
      details: `Updated candidate status to ${newStatus}. Remark: ${remark}`,
    });

    setSelectedApp(null);
  };

  // Toggle individual document verification status
  const handleToggleDocStatus = (docId: string) => {
    if (!selectedApp) return;

    const updatedDocs = selectedApp.documents.map((d) => {
      if (d.id === docId) {
        const next: 'Verified' | 'Under Review' | 'Pending' | 'Rejected' =
          d.status === 'Verified' ? 'Rejected' : d.status === 'Rejected' ? 'Under Review' : 'Verified';
        return { ...d, status: next };
      }
      return d;
    });

    const updatedApp = { ...selectedApp, documents: updatedDocs };
    setSelectedApp(updatedApp);

    const updatedAll = applications.map((a) => (a.id === selectedApp.id ? updatedApp : a));
    setApplications(updatedAll);
    saveHrApplications(updatedAll);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Preliminary Candidate Document Scrutiny</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Application Review & Scrutiny Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Evaluate candidate credentials, inspect uploaded degree and membership certificates,
            and certify eligibility according to Ceylon Electricity Board Schemes of Recruitment.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {applications.length} Total Applications
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            {applications.filter((a) => a.status === 'Eligible').length} Certified Eligible
          </span>
        </div>
      </div>

      {/* 2. Search & Filtering Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, NIC, Ref No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Vacancy Selector */}
          <select
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Vacancies</option>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.jobCode} • {v.title.slice(0, 32)}...
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending Review' },
              { id: 'ELIGIBLE', label: 'Eligible' },
              { id: 'INELIGIBLE', label: 'Ineligible' },
              { id: 'REQUEST_INFO', label: 'Docs Requested' },
              { id: 'SHORTLISTED', label: 'Board / Shortlist' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  selectedStatusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-5">Ref No & Candidate</th>
                <th className="py-3.5 px-4">Vacancy & Division</th>
                <th className="py-3.5 px-4">Age & Qualifications</th>
                <th className="py-3.5 px-4">Documents</th>
                <th className="py-3.5 px-4">Status & Remark</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No applications match your selected filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 text-sm block">
                        {app.candidateName}
                      </span>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {app.referenceNo} • NIC: {app.candidateNic}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Applied: {app.appliedDate}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800 block">{app.jobTitle}</span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{app.department}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Age: {app.age} yrs</span>
                        {app.age > 35 ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            Over 35
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Eligible Age
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        {app.educationSummary}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Experience: {app.experienceYears} Years
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">
                          {app.documents.length} Docs
                        </span>
                        {app.documents.some((d) => d.status === 'Verified') && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Has verified documents" />
                        )}
                        {app.documents.some((d) => d.status === 'Under Review') && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Pending review" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {app.documents.map((d) => d.name.slice(0, 10)).join(', ')}...
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          app.status === 'Eligible'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'Ineligible'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : app.status === 'Shortlisted'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : app.status === 'Forwarded to Director Board'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : app.status === 'Requires Further Information'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {app.status}
                      </span>
                      {app.statusRemark && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                          {app.statusRemark}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleOpenScrutiny(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#07203b] hover:bg-[#0c2b4d] text-white font-bold text-xs shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Scrutinize</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Full Candidate Scrutiny Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#07203b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-300">
                    {selectedApp.referenceNo}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {selectedApp.jobTitle}
                  </span>
                </div>
                <h3 className="font-black text-lg text-white mt-0.5">
                  Preliminary Scrutiny: {selectedApp.candidateName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: 2 Columns */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Left Column: Candidate Dossier & Age Audit */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>Candidate Profile & Identity Audit</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">National ID (NIC):</span>
                      <span className="font-mono font-bold text-slate-800">{selectedApp.candidateNic}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Age as of Closing Date:</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{selectedApp.age} Years</span>
                        <span className="text-[10px] text-slate-400 block">(Gazette limit: 18 - 35)</span>
                      </div>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Gender & District:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedApp.gender} • {selectedApp.district}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Contact Email:</span>
                      <span className="font-medium text-slate-800">{selectedApp.candidateEmail}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Phone Number:</span>
                      <span className="font-medium text-slate-800">{selectedApp.candidatePhone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Academic & Experience Summary</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedApp.educationSummary}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Post-qualifying Experience:</span>
                    <span className="font-bold text-slate-900">{selectedApp.experienceYears} Years</span>
                  </div>
                </div>

                {selectedApp.statusRemark && (
                  <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                    <span className="font-bold text-sky-900 block mb-1">Current File Note / Remark:</span>
                    <p className="text-sky-800 leading-relaxed">{selectedApp.statusRemark}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Uploaded Documents Verification */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span>Submitted Certificates & Vault Files</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Click badge to toggle check</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedApp.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Type: {doc.type} • Size: {doc.size}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleDocStatus(doc.id)}
                            title="Click to toggle status (Verified / Rejected / Review)"
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer transition ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : doc.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            {doc.status}
                          </button>

                          <button
                            onClick={() => alert(`Opening preview of verified certificate: ${doc.name}`)}
                            title="Preview file"
                            className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scrutiny Decision Workspace Tabs */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    HR Scrutiny Determination
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveDecisionTab('ELIGIBLE')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                        activeDecisionTab === 'ELIGIBLE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ✓ Eligible
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDecisionTab('INELIGIBLE')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                        activeDecisionTab === 'INELIGIBLE'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ✕ Ineligible
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDecisionTab('REQUEST_INFO')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                        activeDecisionTab === 'REQUEST_INFO'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      + Request Docs
                    </button>
                  </div>

                  {/* Decision Tab Form Contents */}
                  {activeDecisionTab === 'ELIGIBLE' && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                        Certifying as <strong>Eligible</strong> enters this candidate into the
                        Written Competitive Examination & Interview Shortlist pool.
                      </p>
                      <label className="block text-[11px] font-bold text-slate-600">
                        Optional Scrutiny Committee Notes:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. All requirements verified against Gazette No. 2381."
                        value={customRemark}
                        onChange={(e) => setCustomRemark(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {activeDecisionTab === 'INELIGIBLE' && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Official Rejection Reason (SOR Clause) *:
                      </label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="Over age limit as specified in Gazette / Scheme of Recruitment">
                          Over age limit as specified in Gazette / SOR
                        </option>
                        <option value="Degree not recognized by IESL / UGC accredited university">
                          Degree not recognized by IESL / UGC
                        </option>
                        <option value="Post-qualifying field experience less than minimum requirement">
                          Post-qualifying experience less than required
                        </option>
                        <option value="Incomplete certified educational transcripts submitted">
                          Incomplete certified transcripts submitted
                        </option>
                        <option value="Did not satisfy required professional membership (IESL/CA Sri Lanka)">
                          Lack of required professional membership
                        </option>
                      </select>
                      <input
                        type="text"
                        placeholder="Additional notes for rejection letter..."
                        value={customRemark}
                        onChange={(e) => setCustomRemark(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}

                  {activeDecisionTab === 'REQUEST_INFO' && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Document / Information Required *:
                      </label>
                      <input
                        type="text"
                        value={infoRequestDocLabel}
                        onChange={(e) => setInfoRequestDocLabel(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <label className="block text-[11px] font-bold text-slate-600">
                        Instructions to Candidate:
                      </label>
                      <textarea
                        rows={2}
                        value={infoRequestNote}
                        onChange={(e) => setInfoRequestNote(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Close Without Saving
              </button>

              <div className="flex items-center gap-3">
                {activeDecisionTab === 'ELIGIBLE' && (
                  <button
                    onClick={() => handleApplyDecision('Eligible')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Confirm & Mark Eligible
                  </button>
                )}

                {activeDecisionTab === 'INELIGIBLE' && (
                  <button
                    onClick={() => handleApplyDecision('Ineligible')}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Reject Application
                  </button>
                )}

                {activeDecisionTab === 'REQUEST_INFO' && (
                  <button
                    onClick={() => handleApplyDecision('Requires Further Information')}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Dispatch Request to Candidate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
