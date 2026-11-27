import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2,
  ShieldCheck,
  Download,
  X,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Info,
  Zap,
  Award,
  PhoneCall,
  Pause,
  Play,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { type ApplicantApplication } from '../../data/mockRecruitmentData';
import {
  getPortalSettings,
  getHrVacancies,
  getApplicantApplications,
  submitApplicantApplication,
} from '../../utils/portalStorage';
import type { JobVacancy } from '../../types';

export const ApplicantDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<ApplicantApplication[]>(() =>
    getApplicantApplications(currentUser?.email)
  );
  const openVacancies = getHrVacancies().filter((v) => v.status === 'PUBLISHED');
  const [selectedApplication, setSelectedApplication] = useState<ApplicantApplication | undefined>(
    applications[0]
  );
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeVacancyToApply, setActiveVacancyToApply] = useState<JobVacancy | null>(null);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [isGuidelineBarVisible, setIsGuidelineBarVisible] = useState(true);
  const portalSettings = getPortalSettings();
  const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(
    Boolean(portalSettings.announcementBanner.trim())
  );

  // 4 Detailed Core Guideline Slides for the compact alternating Showcase (No Photos, Reduced Height)
  const guidelineSlides = [
    {
      id: 1,
      badge: 'Scheme of Recruitment (SOR)',
      tagColor: 'bg-sky-400/20 text-sky-300 border-sky-400/30',
      icon: Award,
      iconColor: 'text-sky-300 bg-sky-500/20',
      title: '1. Strict Eligibility & Minimum Age (18+)',
      subtitle: 'Official Gazette Requirements & Citizenship Verification',
      description:
        'All candidates must be citizens of Sri Lanka aged 18 years or above as of the closing date specified in the Gazette. Engineering positions require accredited B.Sc. Engineering degrees recognized by IESL. Technical and operational roles are strictly audited against gazetted Scheme of Recruitment (SOR) standards.',
      keyPoints: [
        'Sri Lankan Citizenship & Minimum Age 18 Years',
        'IESL, UGC, or NVQ recognized educational certifications',
        'Strict disqualification for any misrepresented credentials',
      ],
    },
    {
      id: 2,
      badge: 'Document Authentication',
      tagColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
      icon: FileCheck,
      iconColor: 'text-emerald-300 bg-emerald-500/20',
      title: '2. Mandatory Certified PDF Submissions',
      subtitle: 'Clear, Legible Digital Document Uploads',
      description:
        'Certified true copies of Degree/Diploma certificates, GCE Advanced Level (A/L), GCE Ordinary Level (O/L), and National Identity Card (NIC) must be uploaded as legible PDF files under 5MB each. Certification by an authorized Justice of the Peace (JP), Attorney-at-Law, or Principal is mandatory prior to digital upload.',
      keyPoints: [
        'Legible PDF format only (< 5MB per document)',
        'Official Certified True Copy seal and signature mandatory',
        'Preliminary scrutiny committee rejects unverified scans',
      ],
    },
    {
      id: 3,
      badge: 'Public Transparency',
      tagColor: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      icon: ShieldCheck,
      iconColor: 'text-amber-300 bg-amber-500/20',
      title: '3. Zero Application & Processing Fees',
      subtitle: '100% Free Official Recruitment • No Middlemen',
      description:
        'The Ceylon Electricity Board strictly never requests cash deposits, application processing charges, examination fees, or interview fees at any stage. All submissions are conducted solely through this official portal. Beware of fraudulent recruitment agents or fake fee solicitations.',
      keyPoints: [
        '100% Free Application Process for all citizens',
        'Direct recruitment with zero third-party agency involvement',
        'Report fraudulent requests directly to CEB Vigilance hotline',
      ],
    },
    {
      id: 4,
      badge: 'Live Portal Updates',
      tagColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
      icon: Calendar,
      iconColor: 'text-purple-300 bg-purple-500/20',
      title: '4. Examination & Interview Call Letters',
      subtitle: 'Direct Digital Dispatch & Multi-Tier Review',
      description:
        'Official admission letters for written competitive examinations and scheduled interview call letters are published directly to your candidate dashboard tracker. Shortlisted applicants also receive instant SMS and email notifications with allocated dates, times, and venue locations.',
      keyPoints: [
        'Digital call letters downloadable directly from dashboard',
        'Automated SMS and email alerts upon shortlisting',
        'Multi-stage transparent tracking through to Director Board',
      ],
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % guidelineSlides.length);
    }, 5500); // changes every 5.5 seconds smoothly
    return () => clearInterval(interval);
  }, [isCarouselPaused, guidelineSlides.length]);

  const activeSlide = guidelineSlides[currentSlideIndex];
  const ActiveIcon = activeSlide.icon;

  // Status step labels conforming to the official CEB recruitment workflow
  const workflowSteps = [
    { label: 'Submitted', desc: 'Application received' },
    { label: 'HR Screening', desc: 'Eligibility & documents' },
    { label: 'Shortlisted', desc: 'Passed evaluation' },
    { label: 'Director Board', desc: 'Interview & review' },
    { label: 'Approved', desc: 'Final appointment' },
  ];

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* 1. Header & Welcome Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser?.name?.trim().split(/\s+/)[0] || 'Applicant'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track your recruitment progress, view interview calls, and apply for open CEB vacancies.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Candidate ID: <strong className="text-sky-700">{currentUser?.id ? `#${currentUser.id.slice(-6)}` : '#APP-7021'}</strong></span>
          </div>
        </div>

        {/* Live Admin Portal Announcement Notice */}
        {showAnnouncementBanner && portalSettings.announcementBanner.trim() && (
          <div className="rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3 flex items-start sm:items-center justify-between gap-3 text-xs text-sky-950 shadow-2xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <p className="leading-relaxed">
                <strong className="font-bold text-sky-900">Portal Notice ({portalSettings.recruitmentCycle}): </strong>
                {portalSettings.announcementBanner}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAnnouncementBanner(false)}
              className="p-1 rounded-lg text-sky-600 hover:bg-sky-100 cursor-pointer shrink-0"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 2. Compact Dynamic Rotating Guidelines Showcase (No Photos, Reduced Height) */}
        {isGuidelineBarVisible && (
          <div
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#07203b] via-[#0c2b4d] to-[#081a2e] text-white border border-sky-400/30 shadow-lg shadow-sky-950/20 transition-all p-3.5 sm:p-4"
          >
            {/* Subtle background glow effect */}
            <div className="absolute top-0 right-1/4 w-72 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-3">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 text-[11px]">
                    <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                    Official CEB Recruitment Advisory • {portalSettings.recruitmentCycle}
                  </span>
                  <span className="text-[11px] text-sky-200/70 hidden md:inline">
                    Statutory Scheme of Recruitment (SOR)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <a
                    href="#helpdesk"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('CEB Recruitment Helpdesk: (011) 232 4471 / hr.recruitment@ceb.lk');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white text-[11px] font-medium border border-white/10 transition cursor-pointer"
                  >
                    <PhoneCall className="w-3 h-3 text-amber-400" />
                    <span>Helpdesk: <strong className="text-white">(011) 232 4471</strong></span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowGuidelineModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] shadow-xs transition cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    <span>Full Gazette Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGuidelineBarVisible(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition cursor-pointer"
                    title="Hide banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Content: Slim horizontal showcase (Icon + Text on Left, Checklist on Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center py-0.5">
                {/* Left: Active Guideline Details */}
                <div className="lg:col-span-7 flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 border border-white/15 ${activeSlide.iconColor}`}>
                    <ActiveIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {activeSlide.title}
                      </h2>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${activeSlide.tagColor}`}>
                        {activeSlide.badge}
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                      {activeSlide.subtitle}
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                      {activeSlide.description}
                    </p>
                  </div>
                </div>

                {/* Right: Key Point Verification Checklist */}
                <div className="lg:col-span-5 flex flex-col justify-center gap-1.5 bg-black/25 p-2.5 rounded-xl border border-white/10">
                  {activeSlide.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate text-[11px] sm:text-xs">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Interactive Navigation: 4 quick tabs + Carousel controls */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* 4 Interactive Guideline Tab Buttons */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {guidelineSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        currentSlideIndex === idx
                          ? 'bg-sky-500 text-slate-950 shadow-xs'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{slide.title.split('.')[0]}.</span>
                      <span>{slide.title.split('.')[1]?.trim().split('&')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Controls: Prev / Pause / Next */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] text-slate-400 italic hidden sm:inline mr-1">
                    Hover to pause
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsCarouselPaused(!isCarouselPaused)}
                    className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                    title={isCarouselPaused ? 'Resume auto-play' : 'Pause auto-play'}
                  >
                    {isCarouselPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlideIndex(
                        (prev) => (prev - 1 + guidelineSlides.length) % guidelineSlides.length
                      )
                    }
                    className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Previous Guideline"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-mono font-bold text-sky-300 px-1">
                    0{currentSlideIndex + 1} / 0{guidelineSlides.length}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlideIndex((prev) => (prev + 1) % guidelineSlides.length)
                    }
                    className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Next Guideline"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Clean Metric Overview Cards (Spacious, balanced, beautiful) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Stat 1: Applications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Applications</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {applications.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active in 2026 recruitment cycle
            </p>
          </div>

          {/* Stat 2: Active Stage */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Pipeline Stage</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-amber-600 leading-tight truncate">
              {selectedApplication?.status || 'No Active Submissions'}
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {selectedApplication?.jobTitle?.split('(')[0] || 'Check available vacancies below'}
            </p>
          </div>

          {/* Stat 3: Profile Readiness */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Completeness</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-black text-slate-900 leading-tight">85%</div>
              <span className="text-xs font-semibold text-emerald-600">Verified</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full w-[85%]" />
            </div>
          </div>

        </div>

        {/* 4. Beautiful Progress Tracker Section (De-cluttered and clean) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          
          {/* Tracker Header with Application Switcher Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Application Journey & Status Tracker
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-tier recruitment review process (HR, Technical Board, Executive Approval)
              </p>
            </div>

            {/* Application selector tabs */}
            <div className="flex flex-wrap gap-2">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    selectedApplication?.id === app.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{app.referenceNo}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    selectedApplication?.id === app.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {app.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Application Detail Banner */}
          {selectedApplication ? (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-md">
                    Ref: {selectedApplication.referenceNo}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                    {selectedApplication.jobTitle}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {selectedApplication.department}
                    </span>
                    <span>•</span>
                    <span>Applied on: <strong className="text-slate-700">{selectedApplication.appliedDate}</strong></span>
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {selectedApplication.status}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Clean Visual Progress Stepper */}
          <div className="py-4 px-2">
            <div className="relative">
              {/* Base Line */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -z-0" />
              {/* Progress Line */}
              <div
                className="absolute top-4 left-6 h-1 bg-sky-600 -z-0 transition-all duration-500"
                style={{
                  width: `${(((selectedApplication?.currentStepIndex ?? 0) / (workflowSteps.length - 1))) * 92}%`,
                }}
              />

              {/* Step Circles & Labels */}
              <div className="flex justify-between relative z-10">
                {workflowSteps.map((step, idx) => {
                  const isPassed = idx < (selectedApplication?.currentStepIndex ?? 0);
                  const isCurrent = idx === (selectedApplication?.currentStepIndex ?? 0);
                  return (
                    <div key={step.label} className="flex flex-col items-center text-center max-w-[90px] sm:max-w-[120px]">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? 'bg-sky-600 text-white ring-4 ring-sky-100 ring-offset-1'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-400 border-2 border-slate-200'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      
                      <span
                        className={`text-xs font-bold mt-2.5 ${
                          isCurrent
                            ? 'text-sky-700'
                            : isPassed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      
                      <span className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Committee Remarks Alert Card */}
          {selectedApplication?.statusRemark && (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/70 text-xs text-sky-950 flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-sky-900">Latest Review Remarks: </strong>
                <span className="text-sky-800 leading-relaxed">{selectedApplication.statusRemark}</span>
              </div>
            </div>
          )}

          {/* Attached Supporting Documents */}
          {selectedApplication?.documentsSubmitted && selectedApplication.documentsSubmitted.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Verified Documents on File:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedApplication.documentsSubmitted.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 truncate">{doc}</span>
                    </div>
                    <button
                      onClick={() => alert(`Downloading verified copy of ${doc}`)}
                      title="Download verified PDF"
                      className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 5. Explore Available Vacancies Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Current CEB Job Openings
              </h2>
              <p className="text-xs text-slate-500">
                Official Gazette & Circular vacancies currently accepting candidate submissions
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {openVacancies.length} Vacancies Open
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {openVacancies.map((vac) => (
              <div
                key={vac.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-sky-300 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {vac.jobCode}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {vac.vacanciesCount} Posts
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                    {vac.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{vac.department}</span>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {vac.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    <span>Closes: <strong className="text-slate-700">{vac.closingDate}</strong></span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveVacancyToApply(vac);
                      setShowApplyModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Apply</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full Guidelines Modal */}
      {showGuidelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Official Recruitment Guidelines & Instructions
                  </h3>
                  <p className="text-xs text-slate-500">Ceylon Electricity Board • 2026/2027 Recruitment Cycle</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuidelineModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                <h4 className="font-bold text-sky-900 text-sm mb-1">General Applicant Eligibility</h4>
                <p className="text-slate-700 text-xs">
                  Applicants must be citizens of Sri Lanka, aged 18 years or above as of the closing date specified in the vacancy notification.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Key Instructions:</h4>
                <ul className="space-y-2 list-disc pl-5 text-xs text-slate-700">
                  <li>
                    <strong>Document Uploads:</strong> Certified true copies of Degree/Diploma certificates, GCE O/L and A/L certificates, and National Identity Card (NIC) must be uploaded as clear, legible PDF files under 5MB.
                  </li>
                  <li>
                    <strong>Scheme of Recruitment (SOR):</strong> Shortlisting is strictly executed according to the approved CEB Scheme of Recruitment. Applications with missing or unverified documents will be rejected at the preliminary screening stage.
                  </li>
                  <li>
                    <strong>Zero Fee Policy:</strong> The Ceylon Electricity Board never requests cash deposits or application processing fees. Any request for payment should be reported immediately.
                  </li>
                  <li>
                    <strong>Communication:</strong> Official call letters for written examinations and interviews will be published on your candidate dashboard and sent to your registered email address.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-900 text-xs mb-1">Recruitment Helpdesk Contact</h4>
                <p className="text-xs text-slate-600">
                  For technical queries or recruitment clarifications:
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-sky-700">
                  <span>Telephone: (011) 232 4471</span>
                  <span>Email: hr.recruitment@ceb.lk</span>
                  <span>Location: CEB Head Office, Sir Chittampalam A. Gardiner Mawatha, Colombo 02</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowGuidelineModal(false)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                I Understand
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Application Modal */}
      {showApplyModal && activeVacancyToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {activeVacancyToApply.jobCode}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Apply for {activeVacancyToApply.title}
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Division</span>
                  <span className="font-bold text-slate-800">{activeVacancyToApply.department}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Closing Date</span>
                  <span className="font-bold text-amber-600">{activeVacancyToApply.closingDate}</span>
                </div>
              </div>
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-slate-800 mb-1.5">Documents to be attached from your profile:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li>Primary Curriculum Vitae (PDF)</li>
                  <li>Certified National Identity Card (NIC)</li>
                  <li>Relevant Educational & Professional Certificates</li>
                </ul>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="confirm-app" className="mt-0.5 rounded" defaultChecked />
                <label htmlFor="confirm-app" className="text-[11px] text-slate-600 leading-normal">
                  I confirm that all particulars and documents submitted in my profile are true, complete, and correct.
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { referenceNo, applicantApp } = submitApplicantApplication({
                    vacancy: activeVacancyToApply,
                    candidateName: currentUser?.name || 'Chamalka Ekanayaka',
                    candidateEmail: currentUser?.email || 'applicant@ceb.lk',
                  });
                  const refreshed = getApplicantApplications(currentUser?.email);
                  setApplications(refreshed);
                  setSelectedApplication(applicantApp);
                  alert(
                    `Application submitted successfully for ${activeVacancyToApply.title}! Ref No: #${referenceNo}`
                  );
                  setShowApplyModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition cursor-pointer"
              >
                Confirm & Submit Application
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
