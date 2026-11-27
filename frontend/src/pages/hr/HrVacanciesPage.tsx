import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Building2,
  Calendar,
  Users,
  Edit,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
} from 'lucide-react';

import type { JobVacancy } from '../../types';
import {
  getHrVacancies,
  saveHrVacancies,
  appendAuditLog,
  pushNotification,
} from '../../utils/portalStorage';

export const HrVacanciesPage: React.FC = () => {
  const [vacancies, setVacancies] = useState<JobVacancy[]>(() => getHrVacancies());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'CLOSED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<JobVacancy | null>(null);

  // Form Fields
  const [formJobCode, setFormJobCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState('Transmission Division');
  const [formLocation, setFormLocation] = useState('Head Office, Colombo 02');
  const [formType, setFormType] = useState<'Permanent' | 'Contract' | 'Full-time'>('Permanent');
  const [formCount, setFormCount] = useState<number>(2);
  const [formClosingDate, setFormClosingDate] = useState('2026-12-31');
  const [formDescription, setFormDescription] = useState('');
  const [formQualifications, setFormQualifications] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formStatus, setFormStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CLOSED'>('PUBLISHED');

  // Stats
  const publishedCount = vacancies.filter((v) => v.status === 'PUBLISHED').length;
  const draftCount = vacancies.filter((v) => v.status === 'DRAFT').length;
  const closedCount = vacancies.filter((v) => v.status === 'CLOSED').length;
  const totalPosts = vacancies
    .filter((v) => v.status === 'PUBLISHED')
    .reduce((acc, v) => acc + v.vacanciesCount, 0);

  const departments = useMemo(() => {
    const list = Array.from(new Set(vacancies.map((v) => v.department)));
    return ['All', ...list];
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((vac) => {
      const matchesSearch =
        vac.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vac.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vac.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vac.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || vac.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || vac.status === selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [vacancies, searchQuery, selectedDept, selectedStatus]);

  const handleOpenCreateModal = () => {
    const nextNum = vacancies.length + 1;
    const pad = String(nextNum).padStart(3, '0');
    setEditingVacancy(null);
    setFormJobCode(`CEB-REC-2026-${pad}`);
    setFormTitle('');
    setFormDept('Transmission Division');
    setFormLocation('Head Office, Colombo / Substation Complex');
    setFormType('Permanent');
    setFormCount(3);
    setFormClosingDate('2026-12-31');
    setFormDescription('');
    setFormQualifications(
      'B.Sc. Engineering degree recognized by IESL\nMinimum of 2 years post-qualifying field experience\nAge below 35 years as of closing date'
    );
    setFormRequirements(
      'Valid associate or corporate membership in IESL\nProficiency in power system simulation software\nValid driving license'
    );
    setFormStatus('PUBLISHED');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vac: JobVacancy) => {
    setEditingVacancy(vac);
    setFormJobCode(vac.jobCode);
    setFormTitle(vac.title);
    setFormDept(vac.department);
    setFormLocation(vac.location);
    setFormType(vac.employmentType);
    setFormCount(vac.vacanciesCount);
    setFormClosingDate(vac.closingDate);
    setFormDescription(vac.description);
    setFormQualifications(vac.qualifications.join('\n'));
    setFormRequirements(vac.requirements.join('\n'));
    setFormStatus(vac.status);
    setIsModalOpen(true);
  };

  const handleSaveVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a job title.');
      return;
    }

    const qualsArray = formQualifications
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const reqsArray = formRequirements
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    let updated: JobVacancy[];

    if (editingVacancy) {
      updated = vacancies.map((v) =>
        v.id === editingVacancy.id
          ? {
              ...v,
              jobCode: formJobCode,
              title: formTitle,
              department: formDept,
              location: formLocation,
              employmentType: formType,
              vacanciesCount: Number(formCount) || 1,
              closingDate: formClosingDate,
              description: formDescription,
              qualifications: qualsArray,
              requirements: reqsArray,
              status: formStatus,
            }
          : v
      );

      appendAuditLog({
        actorName: 'Nimali Senanayake (HR)',
        actorRole: 'HR',
        action: 'Updated Vacancy Specification',
        target: `${formJobCode} (${formTitle})`,
        category: 'RECRUITMENT',
        severity: 'INFO',
        details: `Updated closing date to ${formClosingDate} and status to ${formStatus}.`,
      });
    } else {
      const newVac: JobVacancy = {
        id: `vac-${Date.now().toString().slice(-4)}`,
        jobCode: formJobCode,
        title: formTitle,
        department: formDept,
        location: formLocation,
        employmentType: formType,
        vacanciesCount: Number(formCount) || 1,
        closingDate: formClosingDate,
        description: formDescription,
        qualifications: qualsArray,
        requirements: reqsArray,
        status: formStatus,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      updated = [newVac, ...vacancies];

      appendAuditLog({
        actorName: 'Nimali Senanayake (HR)',
        actorRole: 'HR',
        action: 'Created New Recruitment Vacancy',
        target: `${formJobCode} (${formTitle})`,
        category: 'RECRUITMENT',
        severity: 'INFO',
        details: `Published official vacancy under ${formDept} with ${formCount} openings.`,
      });
    }

    setVacancies(updated);
    saveHrVacancies(updated);
    if (!editingVacancy && formStatus === 'PUBLISHED') {
      pushNotification({
        targetRole: 'APPLICANT',
        title: `New Vacancy Published: ${formTitle} (${formDept})`,
        category: 'Vacancy',
        statusTag: 'Open for Apply',
        actionPath: '/applicant/vacancies',
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (vac: JobVacancy) => {
    const nextStatus: 'PUBLISHED' | 'CLOSED' | 'DRAFT' =
      vac.status === 'PUBLISHED' ? 'CLOSED' : vac.status === 'CLOSED' ? 'DRAFT' : 'PUBLISHED';

    const updated = vacancies.map((v) => (v.id === vac.id ? { ...v, status: nextStatus } : v));
    setVacancies(updated);
    saveHrVacancies(updated);

    if (nextStatus === 'PUBLISHED') {
      pushNotification({
        targetRole: 'APPLICANT',
        title: `Vacancy Re-opened: ${vac.title} (${vac.jobCode})`,
        category: 'Vacancy',
        statusTag: 'Open for Apply',
        actionPath: '/applicant/vacancies',
      });
    }

    appendAuditLog({
      actorName: 'Nimali Senanayake (HR)',
      actorRole: 'HR',
      action: 'Changed Vacancy Status',
      target: `${vac.jobCode} (${vac.title})`,
      category: 'RECRUITMENT',
      severity: 'INFO',
      details: `Transitioned status from ${vac.status} to ${nextStatus}.`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Scheme of Recruitment (SOR) Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Vacancy & Gazette Postings
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Author and publish official CEB recruitment circulars, define eligibility criteria,
            and monitor applicant intake capacity across divisions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Vacancy</span>
        </button>
      </div>

      {/* 2. Stat Counts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Total Vacancies</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{vacancies.length}</span>
          <span className="text-[11px] text-slate-400">All cycles</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600 block">
            Published & Active
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{publishedCount}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{totalPosts} Total Open Posts</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-amber-600 block">Draft / Pending</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{draftCount}</span>
          <span className="text-[11px] text-amber-600">Awaiting gazette</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Closed / Past</span>
          <span className="text-2xl font-black text-slate-600 mt-1 block">{closedCount}</span>
          <span className="text-[11px] text-slate-400">Intake ended</span>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, code or division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Divisions' : d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            {(['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Vacancies List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-5">Job Code & Title</th>
                <th className="py-3.5 px-4">Division & Location</th>
                <th className="py-3.5 px-4">Posts & Type</th>
                <th className="py-3.5 px-4">Closing Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVacancies.map((vac) => (
                <tr key={vac.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 block w-fit mb-1">
                      {vac.jobCode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm block">{vac.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {vac.description}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{vac.department}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{vac.location}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 block">
                      {vac.vacanciesCount} Positions
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{vac.employmentType}</span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{vac.closingDate}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleStatus(vac)}
                      title="Click to toggle status"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition ${
                        vac.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : vac.status === 'DRAFT'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {vac.status === 'PUBLISHED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {vac.status === 'DRAFT' && <Sparkles className="w-3 h-3 text-amber-600" />}
                      {vac.status === 'CLOSED' && <XCircle className="w-3 h-3 text-slate-500" />}
                      <span>{vac.status}</span>
                    </button>
                  </td>

                  <td className="py-4 px-5 text-right space-x-2">
                    <Link
                      to="/hr/applications"
                      title="View submitted applications"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Apps</span>
                    </Link>

                    <button
                      onClick={() => handleOpenEditModal(vac)}
                      title="Edit Vacancy Details"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 transition inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create / Edit Vacancy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#07203b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingVacancy ? 'Edit Vacancy Specification' : 'Create New Official Vacancy'}
                </h3>
                <p className="text-xs text-sky-200">
                  Ceylon Electricity Board • Statutory Scheme of Recruitment (SOR)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveVacancy} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Reference Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formJobCode}
                    onChange={(e) => setFormJobCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recruitment Division *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Transmission Division">Transmission Division</option>
                    <option value="Generation Division">Generation Division</option>
                    <option value="Information Technology Division">Information Technology Division</option>
                    <option value="Finance Division">Finance Division</option>
                    <option value="Distribution Division">Distribution Division</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation / Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Engineer (High Voltage Systems)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location / Station *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employment Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Full-time">Full-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Openings *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formCount}
                    onChange={(e) => setFormCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Application Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formClosingDate}
                    onChange={(e) => setFormClosingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Publishing Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PUBLISHED">PUBLISHED (Active on Portal)</option>
                    <option value="DRAFT">DRAFT (Internal Review)</option>
                    <option value="CLOSED">CLOSED (Intake Stopped)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Overview & Scope
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summary of responsibilities and division role..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Educational & Professional Qualifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formQualifications}
                  onChange={(e) => setFormQualifications(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Requirements & Age Limit (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formRequirements}
                  onChange={(e) => setFormRequirements(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  {editingVacancy ? 'Save Changes' : 'Create & Publish Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
