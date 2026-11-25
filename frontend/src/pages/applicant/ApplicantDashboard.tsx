import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Info,
  Calendar,
  Building2,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Download,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_APPLICATIONS, MOCK_VACANCIES } from '../../data/mockRecruitmentData';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const ApplicantDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState(MOCK_APPLICATIONS[0]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeVacancyToApply, setActiveVacancyToApply] = useState<typeof MOCK_VACANCIES[0] | null>(null);

  // Status step labels conforming to the official workflow
  const workflowSteps = [
    { label: 'Submitted', desc: 'Application received' },
    { label: 'HR Review', desc: 'Eligibility check' },
    { label: 'Shortlisted', desc: 'Passed evaluation' },
    { label: 'Director Board', desc: 'Executive scrutiny' },
    { label: 'Approved', desc: 'Final appointment' },
  ];

  return (
    <DashboardLayout>
      {/* 1. Header & Welcome Area with Instructions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser?.name || 'Applicant'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track your recruitment progress, explore active CEB vacancies, and manage your credentials.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Candidate ID: {currentUser?.id ? `#${currentUser.id.slice(-6)}` : '#APP-7021'}
          </div>
        </div>

        {/* Instructions & Guidelines Banner (User Reading Material) */}
        <div className="bg-gradient-to-r from-sky-900 via-[#0f2d4a] to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden border border-slate-700/40">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 mb-2">
                <Info className="w-3.5 h-3.5" />
                Applicant Instructions & Submission Guidelines (2026/2027)
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                Official Guidelines for Ceylon Electricity Board Job Applications
              </h2>
              <ul className="text-xs text-slate-200 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  <strong className="text-amber-300">Document Requirements:</strong> All academic degrees, professional memberships (e.g. IESL), and experience letters must be uploaded as legible PDF documents (under 5MB).
                </li>
                <li>
                  <strong className="text-amber-300">Scrutiny & Eligibility:</strong> Applications are strictly evaluated against the Scheme of Recruitment (SOR) approved by the Director Board. Any false declaration results in immediate disqualification.
                </li>
                <li>
                  <strong className="text-amber-300">Transparency Notice:</strong> CEB does not charge any application or processing fee at any stage. All official communications occur through this portal and official CEB email addresses.
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-xs text-slate-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Candidate Checklist</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ensure your NIC, email, and mobile number match your official documents before submitting.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Need Guidance?</span>
                <a
                  href="#hotline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('CEB Recruitment Division Helpdesk: (011) 232 4471 / hr@ceb.lk');
                  }}
                  className="font-bold text-amber-300 hover:underline inline-flex items-center gap-1"
                >
                  Contact Helpdesk <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Summary Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        
        {/* Card 1: Active Applications */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Applications</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-none">2</div>
          <p className="text-[11px] text-slate-400 mt-1">Submitted in 2026 cycle</p>
        </div>

        {/* Card 2: Under Review */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Under Evaluation</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-none">1</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">HR Scrutiny Stage</p>
        </div>

        {/* Card 3: Shortlisted */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Shortlisted Status</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-none">1</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Aptitude Evaluation</p>
        </div>

        {/* Card 4: Profile Readiness */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Profile Readiness</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900 leading-none">85%</div>
            <span className="text-[10px] text-slate-400">Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full w-[85%]" />
          </div>
        </div>

      </div>

      {/* 3. Main Grid: Applications Tracker (Left) & Available Jobs / Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Progress Tracker */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Application Progress Tracker
                </h3>
                <p className="text-xs text-slate-500">
                  Select your application to view its real-time multi-stage recruitment status
                </p>
              </div>

              {/* Selector between the 2 applications */}
              <div className="flex gap-2">
                {MOCK_APPLICATIONS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApplication(app)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedApplication.id === app.id
                        ? 'bg-sky-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {app.referenceNo}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Application Header Detail */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded">
                    {selectedApplication.referenceNo}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {selectedApplication.jobTitle}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{selectedApplication.department}</span>
                    <span>•</span>
                    <span>Applied on {selectedApplication.appliedDate}</span>
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    • {selectedApplication.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Progress Visual Bar */}
            <div className="mb-6 px-2">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-sky-600 -z-0 transition-all duration-300"
                  style={{
                    width: `${(selectedApplication.currentStepIndex / (workflowSteps.length - 1)) * 90}%`,
                  }}
                />

                {/* Steps Nodes */}
                <div className="flex justify-between relative z-10">
                  {workflowSteps.map((step, idx) => {
                    const isPassed = idx < selectedApplication.currentStepIndex;
                    const isCurrent = idx === selectedApplication.currentStepIndex;
                    return (
                      <div key={step.label} className="flex flex-col items-center text-center max-w-[80px]">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-400 border-2 border-slate-200'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[11px] font-bold mt-2 ${
                            isCurrent
                              ? 'text-sky-700'
                              : isPassed
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:block">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Remarks / Notification box */}
            {selectedApplication.statusRemark && (
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Current Status Update: </strong>
                  <span>{selectedApplication.statusRemark}</span>
                </div>
              </div>
            )}

            {/* Submitted Documents preview */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 mb-2">Submitted Supporting Documents:</h5>
              <div className="flex flex-wrap gap-2">
                {selectedApplication.documentsSubmitted.map((doc) => (
                  <div
                    key={doc}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc}</span>
                    <button
                      onClick={() => alert(`Downloading verified copy of ${doc}`)}
                      title="Download"
                      className="text-slate-400 hover:text-sky-600 ml-1"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Open Vacancies & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Open Vacancies to Apply */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Explore Open Vacancies</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {MOCK_VACANCIES.length} Available
              </span>
            </div>

            <div className="space-y-3">
              {MOCK_VACANCIES.map((vac) => (
                <div
                  key={vac.id}
                  className="p-3 rounded-xl border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/30 transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 leading-snug">
                      {vac.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                      {vac.vacanciesCount} Posts
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    {vac.department}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Closes: {vac.closingDate}
                    </span>
                    <button
                      onClick={() => {
                        setActiveVacancyToApply(vac);
                        setShowApplyModal(true);
                      }}
                      className="font-bold text-sky-600 group-hover:text-sky-700 inline-flex items-center gap-0.5 hover:underline"
                    >
                      Apply <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5">
            <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
              Quick Management
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => alert('Profile Editor modal will open')}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 flex items-center justify-between shadow-2xs hover:bg-slate-50 transition"
              >
                <span>Edit Education & Qualifications</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => alert('Document Manager modal will open')}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 flex items-center justify-between shadow-2xs hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                  Upload Revised CV / Documents
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Application Modal */}
      {showApplyModal && activeVacancyToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Apply for {activeVacancyToApply.title}
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                <strong>Department:</strong> {activeVacancyToApply.department}
              </p>
              <p>
                <strong>Closing Date:</strong> {activeVacancyToApply.closingDate}
              </p>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">Attached Documents for this application:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                  <li>Current Primary CV (PDF)</li>
                  <li>National Identity Card Copy</li>
                  <li>Certified Degree Certificate & Transcripts</li>
                </ul>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" id="confirm" className="mt-0.5 rounded" defaultChecked />
                <label htmlFor="confirm" className="text-[11px] text-slate-500">
                  I confirm that all educational and professional credentials stored in my profile are valid.
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(
                    `Application submitted successfully for ${activeVacancyToApply.title}! Ref: #CEB-2026-${Math.floor(
                      1000 + Math.random() * 9000
                    )}`
                  );
                  setShowApplyModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
