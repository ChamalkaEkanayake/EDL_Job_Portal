import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileCheck2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Download,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { getHrVacancies, getHrApplications } from '../../utils/portalStorage';

export const HrDashboardPage: React.FC = () => {
  const vacancies = useMemo(() => getHrVacancies(), []);
  const applications = useMemo(() => getHrApplications(), []);

  // Compute key stats
  const activeVacancies = vacancies.filter((v) => v.status === 'PUBLISHED');
  const totalPostsCount = activeVacancies.reduce((acc, v) => acc + v.vacanciesCount, 0);

  const pendingScrutinyCount = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under HR Review'
  ).length;

  const eligibleCount = applications.filter(
    (a) => a.status === 'Eligible' || a.status === 'Shortlisted'
  ).length;

  const forwardedToBoardCount = applications.filter(
    (a) => a.status === 'Forwarded to Director Board' || a.status === 'Approved'
  ).length;

  const infoRequestedCount = applications.filter(
    (a) => a.status === 'Requires Further Information'
  ).length;

  // Pipeline funnel stages
  const pipelineStages = [
    {
      label: 'Submitted',
      count: applications.filter((a) => a.status === 'Submitted').length,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Under Review',
      count: applications.filter((a) => a.status === 'Under HR Review').length,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Info Requested',
      count: infoRequestedCount,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Eligible',
      count: applications.filter((a) => a.status === 'Eligible').length,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Shortlisted',
      count: applications.filter((a) => a.status === 'Shortlisted').length,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Board Forwarded',
      count: forwardedToBoardCount,
      color: 'bg-sky-500',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
    },
  ];

  // Chart data: Applications by Department
  const departmentChartData = useMemo(() => {
    const counts: Record<string, { total: number; eligible: number }> = {};
    vacancies.forEach((v) => {
      const shortName = v.department.replace(' Division', '');
      counts[shortName] = { total: 0, eligible: 0 };
    });

    applications.forEach((app) => {
      const shortName = app.department.replace(' Division', '');
      if (!counts[shortName]) {
        counts[shortName] = { total: 0, eligible: 0 };
      }
      counts[shortName].total += 1;
      if (
        app.status === 'Eligible' ||
        app.status === 'Shortlisted' ||
        app.status === 'Forwarded to Director Board' ||
        app.status === 'Approved'
      ) {
        counts[shortName].eligible += 1;
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      Applications: data.total,
      Qualified: data.eligible,
    }));
  }, [vacancies, applications]);

  const handleExportSummary = () => {
    const summaryCsv = [
      'Reference No,Candidate Name,NIC,Age,Job Title,Department,Status,Exam Marks,Interview Marks',
      ...applications.map(
        (a) =>
          `"${a.referenceNo}","${a.candidateName}","${a.candidateNic}",${a.age},"${a.jobTitle}","${a.department}","${a.status}",${a.examMarks || '-'},${a.interviewMarks || '-'}`
      ),
    ].join('\n');

    const blob = new Blob([summaryCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CEB_Recruitment_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Top Header Banner — CEB Navy Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-[#07203b] border border-slate-700/60 p-6 md:p-8 text-white shadow-md">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 -mb-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>CEB Recruitment & Selection Directorate</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              HR Recruitment Operations Console
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervise gazette vacancies, preliminary document scrutiny, competitive examination
              schedules, and shortlisting for the Ceylon Electricity Board Director Board.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportSummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-600/60 font-semibold text-xs tracking-wide shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Export CSV Dossier</span>
            </button>
            <Link
              to="/hr/vacancies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs tracking-wide shadow-xs shadow-sky-900/30 transition cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Vacancies</span>
            </Link>
            <Link
              to="/hr/applications"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-xs shadow-amber-950/30 transition cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-slate-950" />
              <span>Open Scrutiny Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Vacancies */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Vacancies
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeVacancies.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {totalPostsCount} Total Posts Open
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Published gazettes</span>
            <Link
              to="/hr/vacancies"
              className="text-sky-600 hover:underline font-semibold flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        {/* Total Received Applications */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Ingested Apps
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{applications.length}</span>
            <span className="text-xs font-semibold text-blue-600">Across 5 Divisions</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>All candidate dossiers</span>
            <Link
              to="/hr/applications"
              className="text-sky-600 hover:underline font-semibold flex items-center gap-0.5"
            >
              Inspect <ChevronRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        {/* Pending Document Scrutiny */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Scrutiny
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{pendingScrutinyCount}</span>
            {infoRequestedCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {infoRequestedCount} Docs Requested
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Requires HR check</span>
            <Link
              to="/hr/applications"
              className="text-amber-600 hover:underline font-semibold flex items-center gap-0.5"
            >
              Verify Docs <ChevronRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        {/* Forwarded to Director Board */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Director Board Stage
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{forwardedToBoardCount}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {eligibleCount} Total Qualified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Final merit selection</span>
            <Link
              to="/hr/shortlist"
              className="text-emerald-700 hover:underline font-semibold flex items-center gap-0.5"
            >
              Shortlist <ChevronRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>

      {/* 3. Recruitment Pipeline Funnel Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Recruitment Lifecycle Pipeline Funnel</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Cycle 2026/Q4
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status distribution of applications from submission to final Board appointment
            </p>
          </div>
          <Link
            to="/hr/applications"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pipeline Stage Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stage) => (
            <div
              key={stage.label}
              className={`p-3.5 rounded-xl border border-slate-200/80 ${stage.bgColor} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${stage.textColor}`}>
                  {stage.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${stage.color}`} />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{stage.count}</span>
                <span className="text-[11px] text-slate-500 block">Candidates</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Division Chart & Immediate Action Center (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Division Breakdown Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Applications & Qualifications by CEB Division
                </h3>
                <p className="text-xs text-slate-500">
                  Total applications received vs. candidates meeting Scheme of Recruitment (SOR)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-sm bg-[#07203b]" /> Total
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-sm bg-sky-500" /> Qualified
                </span>
              </div>
            </div>

            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07203b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="Applications" fill="#07203b" radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="Qualified" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Data synced from CEB Central HR Database</span>
            <span className="font-semibold text-slate-700">5 Divisions Represented</span>
          </div>
        </div>

        {/* Right Col: Urgent Action Required Center */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Urgent Actions Required</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Action Items
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-amber-200/70 text-amber-800 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">
                      Supplementary Degree Certificate Uploaded
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Candidate Manjula Wickramasinghe (CEB-2026-CE12) submitted JP-certified degree copy.
                    </p>
                    <Link
                      to="/hr/applications"
                      className="inline-block mt-2 text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                    >
                      Review Document →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-sky-200/70 text-sky-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-950">
                      Director Board Shortlist Ready
                    </h4>
                    <p className="text-[11px] text-sky-800 mt-0.5">
                      Systems & Network Engineer candidates finalized. Awaiting HR sign-off.
                    </p>
                    <Link
                      to="/hr/shortlist"
                      className="inline-block mt-2 text-[11px] font-bold text-sky-900 underline hover:text-sky-950"
                    >
                      Open Shortlist Docket →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-slate-200 text-slate-700 shrink-0 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Closing Date Approaching
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Electrical Engineer (Transmission) closes on 2026-12-15. 3 applications received.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              to="/hr/applications"
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>Go to Full Applications List</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Recent Scrutiny Ingestion Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Application Scrutiny Queue
            </h3>
            <p className="text-xs text-slate-500">
              Latest candidate submissions awaiting eligibility audit or interview marks
            </p>
          </div>
          <Link
            to="/hr/applications"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4">Ref No & Candidate</th>
                <th className="py-3 px-4">Vacancy & Division</th>
                <th className="py-3 px-4">Age & Qualifications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{app.candidateName}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {app.referenceNo} • NIC: {app.candidateNic}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{app.jobTitle}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{app.department}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-700">Age: {app.age} yrs</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {app.educationSummary}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
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
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/hr/applications"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1"
                    >
                      <span>Scrutinize</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
