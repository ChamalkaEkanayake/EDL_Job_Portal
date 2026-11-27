import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  ChevronRight,
  X,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

import {
  getHrVacancies,
  getApplicantApplications,
  submitApplicantApplication,
} from '../../utils/portalStorage';
import { useAuth } from '../../contexts/AuthContext';
import type { JobVacancy } from '../../types';

export const ExploreVacanciesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const vacancies = useMemo(() => getHrVacancies(), []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Track applied vacancy IDs (initialized from persisted applications)
  const [appliedVacancyIds, setAppliedVacancyIds] = useState<string[]>(() =>
    getApplicantApplications(currentUser?.email).map((app) => app.vacancyId)
  );

  // Modal state: viewing details vs applying vs submitted confirmation
  const [activeVacancy, setActiveVacancy] = useState<JobVacancy | null>(null);
  const [modalStep, setModalStep] = useState<'DETAILS' | 'APPLY' | 'SUCCESS'>('DETAILS');
  const [submittedRef, setSubmittedRef] = useState('');

  // Simple Application form state
  const [qualificationSummary, setQualificationSummary] = useState('');
  const [experienceYears, setExperienceYears] = useState('2');
  const [uploadedCvName, setUploadedCvName] = useState('CV_Chamalka_Ekanayaka_2026.pdf');
  const [extraDocName, setExtraDocName] = useState('');
  const [agreed, setAgreed] = useState(true);

  const departments = useMemo(() => {
    const depts = Array.from(new Set(vacancies.map((v) => v.department)));
    return ['All', ...depts];
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((vac) => {
      if (vac.status !== 'PUBLISHED') return false;
      const matchesSearch =
        vac.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vac.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vac.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vac.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepartment === 'All' || vac.department === selectedDepartment;
      const matchesType = selectedType === 'All' || vac.employmentType === selectedType;
      return matchesSearch && matchesDept && matchesType;
    });
  }, [vacancies, searchQuery, selectedDepartment, selectedType]);

  const openVacancyModal = (vacancy: JobVacancy, startInApply = false) => {
    setActiveVacancy(vacancy);
    setModalStep(startInApply ? 'APPLY' : 'DETAILS');
    setQualificationSummary('');
    setExtraDocName('');
  };

  const closeModal = () => {
    setActiveVacancy(null);
    setModalStep('DETAILS');
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVacancy || !agreed) return;

    const docs = [uploadedCvName, extraDocName].filter((d) => Boolean(d && d.trim()));
    const { referenceNo } = submitApplicantApplication({
      vacancy: activeVacancy,
      candidateName: currentUser?.name || 'Chamalka Ekanayaka',
      candidateEmail: currentUser?.email || 'applicant@ceb.lk',
      qualificationSummary,
      experienceYears: Number(experienceYears) || 0,
      documentsSubmitted: docs,
    });
    setSubmittedRef(referenceNo);
    setAppliedVacancyIds((prev) =>
      prev.includes(activeVacancy.id) ? prev : [...prev, activeVacancy.id]
    );
    setModalStep('SUCCESS');
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Vacancies</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover current career opportunities at the Ceylon Electricity Board
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto">
          <Briefcase className="w-3.5 h-3.5 text-sky-600" />
          <span>{filteredVacancies.length} Open Positions</span>
        </div>
      </div>

      {/* Search & Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, reference code, division, or location..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
            />
          </div>

          {/* Employment Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 font-medium cursor-pointer"
          >
            <option value="All">All Employment Types</option>
            <option value="Permanent">Permanent</option>
            <option value="Contract">Contract</option>
            <option value="Full-time">Full-time</option>
          </select>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {departments.map((dept) => {
            const isActive = selectedDepartment === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vacancies Grid */}
      {filteredVacancies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No matching vacancies found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your search filter or selecting a different division.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDepartment('All');
              setSelectedType('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVacancies.map((vac) => {
            const isApplied = appliedVacancyIds.includes(vac.id);

            return (
              <div
                key={vac.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                      {vac.jobCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Applied
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {vac.employmentType}
                      </span>
                    </div>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-700 transition leading-snug">
                    {vac.title}
                  </h3>

                  {/* Division & Location */}
                  <div className="mt-2.5 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vac.department}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vac.location}</span>
                    </p>
                  </div>

                  {/* Short Description */}
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {vac.description}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p className="flex items-center gap-1 font-medium text-slate-700">
                      <Users className="w-3 h-3 text-slate-400" />
                      {vac.vacanciesCount} {vac.vacanciesCount === 1 ? 'Vacancy' : 'Vacancies'}
                    </p>
                    <p className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      Closes: {vac.closingDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openVacancyModal(vac, false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      Details
                    </button>
                    {!isApplied && (
                      <button
                        onClick={() => openVacancyModal(vac, true)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      >
                        Apply
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vacancy Details & Quick Apply Modal */}
      {activeVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={closeModal} />

          <div className="relative z-10 bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4 bg-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {activeVacancy.jobCode}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
                    {activeVacancy.employmentType}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeVacancy.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeVacancy.department} • {activeVacancy.location}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {modalStep === 'DETAILS' && (
                <div className="space-y-5 text-xs sm:text-sm text-slate-600">
                  {/* Quick Meta Strip */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block">Open Posts</span>
                      <strong className="text-slate-800">{activeVacancy.vacanciesCount} Positions</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Closing Date</span>
                      <strong className="text-rose-600">{activeVacancy.closingDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Published</span>
                      <strong className="text-slate-800">{activeVacancy.createdAt}</strong>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                      Role Overview
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      {activeVacancy.description}
                    </p>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Required Qualifications
                    </h4>
                    <ul className="space-y-1.5">
                      {activeVacancy.qualifications.map((qual, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                      Key Requirements & Skills
                    </h4>
                    <ul className="space-y-1.5">
                      {activeVacancy.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {modalStep === 'APPLY' && (
                <form id="vacancy-apply-form" onSubmit={handleApplicationSubmit} className="space-y-4">
                  {/* Candidate Auto-filled Info */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Applicant Name</span>
                      <strong className="text-slate-800">{currentUser?.name || 'Chamalka Ekanayaka'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Registered Email</span>
                      <strong className="text-slate-800">{currentUser?.email || 'applicant@ceb.lk'}</strong>
                    </div>
                  </div>

                  {/* Highest Qualification & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Highest Relevant Qualification *
                      </label>
                      <input
                        type="text"
                        required
                        value={qualificationSummary}
                        onChange={(e) => setQualificationSummary(e.target.value)}
                        placeholder="e.g. B.Sc. Engineering (Hons) - University of Moratuwa"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* CV Attachment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Curriculum Vitae (PDF) *
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/40 hover:bg-sky-50 cursor-pointer transition">
                      <div className="flex items-center gap-2.5 text-xs">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span className="font-semibold text-slate-700">{uploadedCvName}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-sky-600 flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5" />
                        Change File
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setUploadedCvName(file.name);
                        }}
                      />
                    </label>
                  </div>

                  {/* Supporting Certificates */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Supporting Certificates (Degree / NIC / Service Letters - PDF)
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition">
                      <span className="text-xs text-slate-500">
                        {extraDocName || 'Select certified documents bundle (optional)'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <UploadCloud className="w-3.5 h-3.5" />
                        Browse
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setExtraDocName(file.name);
                        }}
                      />
                    </label>
                  </div>

                  {/* Declaration */}
                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      required
                      className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-[11px] text-slate-500 leading-relaxed">
                      I hereby certify that all details and attached documents are true and accurate in accordance with the CEB Scheme of Recruitment.
                    </span>
                  </label>
                </form>
              )}

              {modalStep === 'SUCCESS' && (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Your application for <strong>{activeVacancy.title}</strong> has been successfully logged in the CEB Recruitment Portal.
                  </p>
                  <div className="inline-block px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-400">Reference No: </span>
                    <strong className="text-sky-700 font-mono">{submittedRef}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              {modalStep === 'DETAILS' && (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    Close
                  </button>
                  {appliedVacancyIds.includes(activeVacancy.id) ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Already Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => setModalStep('APPLY')}
                      className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Apply
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              {modalStep === 'APPLY' && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalStep('DETAILS')}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Details
                  </button>
                  <button
                    type="submit"
                    form="vacancy-apply-form"
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
                  >
                    Submit Application
                  </button>
                </>
              )}

              {modalStep === 'SUCCESS' && (
                <div className="w-full flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
