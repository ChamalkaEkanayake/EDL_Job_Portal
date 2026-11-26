import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  UploadCloud,
  Download,
  X,
  Briefcase,
  Award,
  Printer,
  Trash2,
  FileCheck2,
  Info,
} from 'lucide-react';
import { MOCK_APPLICATIONS, type ApplicantApplication } from '../../data/mockRecruitmentData';
import { useAuth } from '../../contexts/AuthContext';
import { getPortalSettings } from '../../utils/portalStorage';
import type { ApplicationStatus } from '../../types';

type FilterTab = 'ALL' | 'IN_REVIEW' | 'ACTION_REQUIRED' | 'SHORTLISTED_BOARD' | 'COMPLETED';

const PIPELINE_STEPS = ['Submitted', 'HR Screening', 'Shortlisted', 'Director Board', 'Approved'];

const STATUS_BADGE_MAP: Record<ApplicationStatus, { bg: string; text: string; dot: string }> = {
  Submitted: {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  },
  'Under HR Review': {
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
  },
  'Requires Further Information': {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  Eligible: {
    bg: 'bg-cyan-50 border-cyan-200',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },
  Ineligible: {
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  Shortlisted: {
    bg: 'bg-indigo-50 border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  'Forwarded to Director Board': {
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  Approved: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

const matchesFilterTab = (status: ApplicationStatus, tab: FilterTab): boolean => {
  switch (tab) {
    case 'IN_REVIEW':
      return status === 'Submitted' || status === 'Under HR Review' || status === 'Eligible';
    case 'ACTION_REQUIRED':
      return status === 'Requires Further Information';
    case 'SHORTLISTED_BOARD':
      return status === 'Shortlisted' || status === 'Forwarded to Director Board';
    case 'COMPLETED':
      return status === 'Approved' || status === 'Rejected' || status === 'Ineligible';
    case 'ALL':
    default:
      return true;
  }
};

export const MyApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const portalSettings = getPortalSettings();
  const [applications, setApplications] = useState<ApplicantApplication[]>(MOCK_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Modal states
  const [detailApp, setDetailApp] = useState<ApplicantApplication | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [resubmitApp, setResubmitApp] = useState<ApplicantApplication | null>(null);
  const [callLetterApp, setCallLetterApp] = useState<ApplicantApplication | null>(null);

  // Re-upload modal form state
  const [selectedDocFile, setSelectedDocFile] = useState<string>('');
  const [applicantNote, setApplicantNote] = useState('');

  // Summary metrics
  const counts = useMemo(() => {
    return {
      total: applications.length,
      inReview: applications.filter((a) => matchesFilterTab(a.status, 'IN_REVIEW')).length,
      actionRequired: applications.filter((a) => matchesFilterTab(a.status, 'ACTION_REQUIRED')).length,
      shortlistedOrApproved: applications.filter(
        (a) =>
          a.status === 'Shortlisted' ||
          a.status === 'Forwarded to Director Board' ||
          a.status === 'Approved'
      ).length,
      shortlistedBoardTab: applications.filter((a) =>
        matchesFilterTab(a.status, 'SHORTLISTED_BOARD')
      ).length,
      completed: applications.filter((a) => matchesFilterTab(a.status, 'COMPLETED')).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.referenceNo.toLowerCase().includes(q) ||
        app.department.toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q) ||
        (app.jobCode && app.jobCode.toLowerCase().includes(q));
      return matchesSearch && matchesFilterTab(app.status, activeTab);
    });
  }, [applications, searchQuery, activeTab]);

  const showToast = (message: string) => {
    setFeedbackBanner(message);
    setTimeout(() => {
      setFeedbackBanner((prev) => (prev === message ? null : prev));
    }, 5000);
  };

  const openResubmitModal = (app: ApplicantApplication) => {
    setResubmitApp(app);
    setSelectedDocFile('');
    setApplicantNote('');
  };

  const handleResubmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitApp) return;

    const uploadedFile = selectedDocFile.trim() || 'Certified_Degree_Copy_JP.pdf';
    const nowLabel = '2026-11-25 02:20 PM';

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== resubmitApp.id) return app;
        const updatedTimeline = [
          ...(app.timeline || []),
          {
            id: `tl-${Date.now()}`,
            date: nowLabel,
            status: 'Under HR Review' as ApplicationStatus,
            title: 'Requested Document Re-submitted',
            note: applicantNote.trim()
              ? `Uploaded ${uploadedFile}. Applicant note: "${applicantNote.trim()}"`
              : `Uploaded ${uploadedFile} for HR re-verification.`,
            actor: currentUser?.name || 'Applicant',
          },
        ];
        return {
          ...app,
          status: 'Under HR Review',
          statusRemark: `Updated document (${uploadedFile}) submitted; queued for HR verification.`,
          documentsSubmitted: app.documentsSubmitted.includes(uploadedFile)
            ? app.documentsSubmitted
            : [...app.documentsSubmitted, uploadedFile],
          timeline: updatedTimeline,
        };
      })
    );

    showToast(
      `Document "${uploadedFile}" submitted for ${resubmitApp.referenceNo}. Status updated to Under HR Review.`
    );
    setResubmitApp(null);
  };

  const handleWithdrawApplication = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    setConfirmWithdrawId(null);
    setDetailApp(null);
    if (target) {
      showToast(`Application ${target.referenceNo} (${target.jobTitle}) has been withdrawn.`);
    }
  };

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Applications', count: counts.total },
    { id: 'IN_REVIEW', label: 'In Review', count: counts.inReview },
    { id: 'ACTION_REQUIRED', label: 'Action Required', count: counts.actionRequired },
    { id: 'SHORTLISTED_BOARD', label: 'Shortlisted & Board', count: counts.shortlistedBoardTab },
    { id: 'COMPLETED', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track submitted applications, review status timelines, and respond to HR document requests.
          </p>
        </div>

        <Link
          to="/applicant/vacancies"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Explore Vacancies</span>
        </Link>
      </div>

      {/* Inline Feedback Toast */}
      {feedbackBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Applied
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.total}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">2026 Recruitment Cycle</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.inReview}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">HR scrutiny & scoring</p>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-2xs transition ${
            counts.actionRequired > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Action Required
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{counts.actionRequired}</div>
          <p className="text-[11px] text-amber-800/80 mt-0.5">
            {counts.actionRequired > 0 ? 'Document upload pending' : 'No pending requests'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Shortlisted / Approved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{counts.shortlistedOrApproved}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Board & interview pipeline</p>
        </div>
      </div>

      {/* 3. Search & Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference number (e.g. CEB-2026-EE04), job title, or division..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {filterTabs.map((tab) => {
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
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.id === 'ACTION_REQUIRED' && tab.count > 0
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching applications</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No applications matched your current search or filter selection. Try clearing filters or explore open CEB vacancies.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {(searchQuery || activeTab !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('ALL');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            <Link
              to="/applicant/vacancies"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              Browse Open Vacancies
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const badge = STATUS_BADGE_MAP[app.status];
            const isRejected = app.status === 'Rejected' || app.status === 'Ineligible';
            const isActionNeeded = app.status === 'Requires Further Information';

            return (
              <div
                key={app.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-sm transition ${
                  isActionNeeded ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Meta, Title, Pipeline, Remark */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 rounded-md">
                        {app.referenceNo}
                      </span>
                      {app.jobCode && (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {app.jobCode}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {app.status}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {app.jobTitle}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {app.department}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {app.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Applied: <strong className="text-slate-700">{app.appliedDate}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                          {app.documentsSubmitted.length} Documents
                        </span>
                      </div>
                    </div>

                    {/* Compact 5-step progress bar */}
                    <div className="pt-1">
                      <div className="grid grid-cols-5 gap-1.5">
                        {PIPELINE_STEPS.map((stepLabel, idx) => {
                          const isCompleted = !isRejected && idx <= app.currentStepIndex;
                          const isCurrent = !isRejected && idx === app.currentStepIndex;
                          return (
                            <div key={stepLabel} className="space-y-1">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  isRejected && idx === app.currentStepIndex
                                    ? 'bg-rose-500'
                                    : isActionNeeded && isCurrent
                                    ? 'bg-amber-500'
                                    : isCompleted
                                    ? 'bg-sky-600'
                                    : 'bg-slate-200'
                                }`}
                              />
                              <p
                                className={`text-[10px] truncate ${
                                  isCurrent
                                    ? 'font-bold text-slate-800'
                                    : isCompleted
                                    ? 'font-medium text-slate-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stepLabel}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Latest HR / Board Remark */}
                    {app.statusRemark && (
                      <div
                        className={`rounded-xl px-3.5 py-2.5 border text-xs flex items-start gap-2 ${
                          isActionNeeded
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600'
                        }`}
                      >
                        <Info
                          className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            isActionNeeded ? 'text-amber-600' : 'text-sky-600'
                          }`}
                        />
                        <p className="leading-relaxed">
                          <strong className="font-semibold">Latest Remark:</strong> {app.statusRemark}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {isActionNeeded && (
                      <button
                        type="button"
                        onClick={() => openResubmitModal(app)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs transition cursor-pointer w-full sm:w-auto lg:w-48"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Requested Docs</span>
                      </button>
                    )}

                    {app.callLetter && (
                      <button
                        type="button"
                        onClick={() => setCallLetterApp(app)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer w-full sm:w-auto lg:w-48"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Call Letter</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDetailApp(app);
                        setConfirmWithdrawId(null);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer w-full sm:w-auto lg:w-48"
                    >
                      <span>Details & Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Application Details & Timeline */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/70">
                    {detailApp.referenceNo}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      STATUS_BADGE_MAP[detailApp.status].bg
                    } ${STATUS_BADGE_MAP[detailApp.status].text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${STATUS_BADGE_MAP[detailApp.status].dot}`}
                    />
                    {detailApp.status}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  {detailApp.jobTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {detailApp.department} • {detailApp.location} • Applied {detailApp.appliedDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-6">
              {/* Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Status History & Audit Timeline
                </h3>
                <div className="space-y-4 pl-2">
                  {(detailApp.timeline && detailApp.timeline.length > 0
                    ? detailApp.timeline
                    : [
                        {
                          id: 'default-tl',
                          date: detailApp.appliedDate,
                          status: detailApp.status,
                          title: detailApp.status,
                          note: detailApp.statusRemark || 'Application registered in portal.',
                          actor: 'CEB Recruitment Portal',
                        },
                      ]
                  ).map((event, idx, arr) => {
                    const isLatest = idx === arr.length - 1;
                    return (
                      <div key={event.id} className="relative pl-6 pb-1">
                        {idx < arr.length - 1 && (
                          <span className="absolute left-[7px] top-3.5 bottom-[-16px] w-0.5 bg-slate-200" />
                        )}
                        <span
                          className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs ${
                            isLatest ? 'bg-sky-600 ring-2 ring-sky-100' : 'bg-slate-400'
                          }`}
                        />
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{event.title}</span>
                            <span className="text-[11px] font-medium text-slate-400">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{event.note}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                            Updated by: {event.actor}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submitted Documents */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Submitted Documents ({detailApp.documentsSubmitted.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailApp.documentsSubmitted.map((docName) => (
                    <div
                      key={docName}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{docName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast(`Previewing/downloading "${docName}"...`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition cursor-pointer shrink-0"
                        title="Download document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early-stage Withdraw Option */}
              {(detailApp.status === 'Submitted' || detailApp.status === 'Under HR Review') && (
                <div className="pt-3 border-t border-slate-100">
                  {confirmWithdrawId === detailApp.id ? (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-rose-800 font-medium">
                        Withdraw application <strong>{detailApp.referenceNo}</strong>? This removes it from your active list.
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setConfirmWithdrawId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWithdrawApplication(detailApp.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          Confirm Withdraw
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmWithdrawId(detailApp.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Withdraw this application</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              {detailApp.status === 'Requires Further Information' && (
                <button
                  type="button"
                  onClick={() => {
                    const target = detailApp;
                    setDetailApp(null);
                    openResubmitModal(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                >
                  Upload Requested Docs
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Requested Documents (Requires Further Information) */}
      {resubmitApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleResubmitSubmit}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4"
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Action Required • {resubmitApp.referenceNo}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                  Submit Requested Documents
                </h2>
                <p className="text-xs text-slate-500">{resubmitApp.jobTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setResubmitApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">HR Clarification Request:</p>
              <p className="leading-relaxed">
                {resubmitApp.requestedInfoNote || resubmitApp.statusRemark}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {resubmitApp.requestedDocLabel || 'Upload Requested PDF Document'} *
              </label>
              <label className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 cursor-pointer transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UploadCloud className="w-5 h-5 text-sky-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {selectedDocFile ||
                      `Click to choose ${
                        portalSettings.allowedFileTypes === 'PDF_ONLY'
                          ? 'PDF'
                          : 'PDF / image'
                      } file (max ${portalSettings.maxUploadSizeMb}MB)`}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-1 rounded-lg border border-sky-200 shrink-0">
                  Browse
                </span>
                <input
                  type="file"
                  accept={
                    portalSettings.allowedFileTypes === 'PDF_ONLY'
                      ? '.pdf'
                      : '.pdf,.jpg,.jpeg,.png'
                  }
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > portalSettings.maxUploadSizeMb * 1024 * 1024) {
                        showToast(
                          `File exceeds the ${portalSettings.maxUploadSizeMb}MB limit configured by Admin.`
                        );
                        return;
                      }
                      setSelectedDocFile(file.name);
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Response Note to HR Officer (Optional)
              </label>
              <textarea
                rows={3}
                value={applicantNote}
                onChange={(e) => setApplicantNote(e.target.value)}
                placeholder="Briefly describe the newly attached certified document..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResubmitApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                Submit & Resume Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Exam / Interview Call Letter */}
      {callLetterApp && callLetterApp.callLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200/70">
                  Official CEB Call Letter
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                  {callLetterApp.callLetter.type}
                </h2>
                <p className="text-xs text-slate-500">
                  Ceylon Electricity Board • Recruitment & Selection Division
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCallLetterApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Candidate Name</span>
                  <span className="font-bold text-slate-900">
                    {currentUser?.name || 'Chamalka Ekanayaka'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Application Reference</span>
                  <span className="font-mono font-bold text-sky-700">
                    {callLetterApp.referenceNo}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Applied Position</span>
                  <span className="font-bold text-slate-900">{callLetterApp.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Scheduled Date</span>
                  <span className="font-bold text-slate-900">{callLetterApp.callLetter.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Time</span>
                  <span className="font-bold text-slate-900">{callLetterApp.callLetter.time}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Venue</span>
                  <span className="font-bold text-slate-900">{callLetterApp.callLetter.venue}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Mandatory Instructions
              </h3>
              <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-700">
                {callLetterApp.callLetter.instructions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setCallLetterApp(null)}
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
