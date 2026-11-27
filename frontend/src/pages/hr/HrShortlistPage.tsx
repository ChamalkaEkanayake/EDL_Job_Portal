import React, { useState, useMemo } from 'react';
import {
  Award,
  Send,
  Calendar,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

import type { HrApplication } from '../../types';
import {
  getHrApplications,
  saveHrApplications,
  getHrVacancies,
  appendAuditLog,
  pushNotification,
} from '../../utils/portalStorage';

export const HrShortlistPage: React.FC = () => {
  const [applications, setApplications] = useState<HrApplication[]>(() => getHrApplications());
  const vacancies = useMemo(() => getHrVacancies(), []);

  // Filter state
  const [selectedVacancyId, setSelectedVacancyId] = useState('ALL');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Modals
  const [isCallLetterModalOpen, setIsCallLetterModalOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingMarksApp, setEditingMarksApp] = useState<HrApplication | null>(null);

  // Call letter form
  const [clType, setClType] = useState('Written Competitive Aptitude Examination');
  const [clDate, setClDate] = useState('2026-12-15');
  const [clTime, setClTime] = useState('09:00 AM – 12:00 PM');
  const [clVenue, setClVenue] = useState(
    'CEB Training Centre Auditorium, Castlereagh Complex, Colombo 02'
  );
  const [clInstructions, setClInstructions] = useState(
    'Bring original National Identity Card (NIC) or valid Sri Lankan Passport.\nBring printed Call Letter admission slip.\nReport to exam hall 30 minutes prior to scheduled start.'
  );

  // Board docket form
  const [boardSignOffOfficer, setBoardSignOffOfficer] = useState(
    'Nimali Senanayake (Chief HR Recruitment Officer)'
  );
  const [boardMemo, setBoardMemo] = useState(
    'The CEB Selection Committee has scrutinized all academic credentials, conducted competitive written assessments, and interviewed qualified candidates. The attached merit list is formally recommended to the Board of Directors for final ratification and issuance of letters of appointment.'
  );

  // Marks modal form
  const [inputExamMarks, setInputExamMarks] = useState<number>(80);
  const [inputInterviewMarks, setInputInterviewMarks] = useState<number>(85);

  // Filtered eligible / shortlisted / board candidates
  const eligibleCandidates = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesVac = selectedVacancyId === 'ALL' || app.vacancyId === selectedVacancyId;
        const validStatus =
          app.status === 'Eligible' ||
          app.status === 'Shortlisted' ||
          app.status === 'Forwarded to Director Board' ||
          app.status === 'Approved';
        return matchesVac && validStatus;
      })
      .sort((a, b) => {
        const scoreA = (a.examMarks || 0) + (a.interviewMarks || 0);
        const scoreB = (b.examMarks || 0) + (b.interviewMarks || 0);
        return scoreB - scoreA;
      });
  }, [applications, selectedVacancyId]);

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCandidateIds(eligibleCandidates.map((c) => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleToggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Dispatch Call Letters
  const handleDispatchCallLetters = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIds.length === 0) {
      alert('Please select at least one candidate to issue call letters.');
      return;
    }

    const instructionsArray = clInstructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = applications.map((app) => {
      if (selectedCandidateIds.includes(app.id)) {
        const indexNo = `CEB-EXAM-2026-${app.referenceNo.split('-').pop() || '001'}`;
        return {
          ...app,
          status: 'Shortlisted' as const,
          statusRemark: `Call letter dispatched for ${clType} on ${clDate} at ${clVenue}.`,
          callLetter: {
            type: clType,
            date: clDate,
            time: clTime,
            venue: clVenue,
            indexNo,
            instructions: instructionsArray,
          },
        };
      }
      return app;
    });

    setApplications(updated);
    saveHrApplications(updated);

    updated
      .filter((a) => selectedCandidateIds.includes(a.id))
      .forEach((cand) => {
        pushNotification({
          targetRole: 'APPLICANT',
          targetEmail: cand.candidateEmail,
          title: `Call Letter Issued (${cand.referenceNo}): ${clType} on ${clDate}`,
          category: 'Approval',
          statusTag: 'Shortlisted',
          actionRequired: true,
          actionPath: '/applicant/applications',
        });
      });

    appendAuditLog({
      actorName: 'Nimali Senanayake (HR)',
      actorRole: 'HR',
      action: 'Issued Competitive Exam Call Letters',
      target: `${selectedCandidateIds.length} Shortlisted Candidates`,
      category: 'RECRUITMENT',
      severity: 'INFO',
      details: `Generated admissions for ${clType} scheduled on ${clDate} at ${clVenue}.`,
    });

    setIsCallLetterModalOpen(false);
    setSelectedCandidateIds([]);
  };

  // Forward to Director Board
  const handleSubmitToBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIds.length === 0) {
      alert('Please select candidates to forward to the Director Board.');
      return;
    }

    const updated = applications.map((app) => {
      if (selectedCandidateIds.includes(app.id)) {
        return {
          ...app,
          status: 'Forwarded to Director Board' as const,
          statusRemark: 'Selection docket submitted to CEB Director Board for final appointment ratification.',
          hrRemarks: boardMemo,
        };
      }
      return app;
    });

    setApplications(updated);
    saveHrApplications(updated);

    pushNotification({
      targetRole: 'DIRECTOR',
      title: `${selectedCandidateIds.length} Candidate Docket(s) Forwarded by HR for Board Ratification`,
      category: 'Approval',
      statusTag: 'Board Decision Pending',
      actionRequired: true,
      actionPath: '/director/shortlisted',
    });

    updated
      .filter((a) => selectedCandidateIds.includes(a.id))
      .forEach((cand) => {
        pushNotification({
          targetRole: 'APPLICANT',
          targetEmail: cand.candidateEmail,
          title: `Application ${cand.referenceNo} Forwarded to CEB Director Board`,
          category: 'Approval',
          statusTag: 'Forwarded to Director Board',
          actionPath: '/applicant/applications',
        });
      });

    appendAuditLog({
      actorName: boardSignOffOfficer,
      actorRole: 'HR',
      action: 'Forwarded Shortlist to Director Board',
      target: `${selectedCandidateIds.length} Recommended Candidates`,
      category: 'RECRUITMENT',
      severity: 'INFO',
      details: `Official HR recommendation memo submitted for Director Board Ratification.`,
    });

    setIsBoardModalOpen(false);
    setSelectedCandidateIds([]);
  };

  // Save Marks
  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarksApp) return;

    const updated = applications.map((app) => {
      if (app.id === editingMarksApp.id) {
        return {
          ...app,
          examMarks: Number(inputExamMarks) || 0,
          interviewMarks: Number(inputInterviewMarks) || 0,
        };
      }
      return app;
    });

    setApplications(updated);
    saveHrApplications(updated);
    setEditingMarksApp(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Merit Evaluation & Board Approval Gateway</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Shortlisting, Examination & Board Docket
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Schedule written exams, record competitive assessment scores, generate admissions,
            and transmit certified recruitment recommendations to the CEB Director Board.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              if (selectedCandidateIds.length === 0) {
                alert('Please select candidate(s) using the checkboxes below to issue call letters.');
                return;
              }
              setIsCallLetterModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Bulk Call Letters ({selectedCandidateIds.length})</span>
          </button>

          <button
            onClick={() => {
              if (selectedCandidateIds.length === 0) {
                alert('Please select candidate(s) using the checkboxes below to forward to the Board.');
                return;
              }
              setIsBoardModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#07203b] hover:bg-[#0c2b4d] text-white font-bold text-xs shadow-2xs transition cursor-pointer"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>Forward to Board ({selectedCandidateIds.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 block">Qualified Pool</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {eligibleCandidates.length}
          </span>
          <span className="text-[11px] text-slate-400">Met preliminary criteria</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-purple-600 block">
            Admissions Issued
          </span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {applications.filter((a) => a.callLetter).length}
          </span>
          <span className="text-[11px] text-purple-600 font-semibold">Exams / Interviews set</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-sky-600 block">At Director Board</span>
          <span className="text-2xl font-black text-sky-700 mt-1 block">
            {applications.filter((a) => a.status === 'Forwarded to Director Board').length}
          </span>
          <span className="text-[11px] text-sky-600">Pending ratification</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600 block">Board Confirmed</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {applications.filter((a) => a.status === 'Approved').length}
          </span>
          <span className="text-[11px] text-emerald-600">Appointed officers</span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Filter by Vacancy:</span>
          <select
            value={selectedVacancyId}
            onChange={(e) => setSelectedVacancyId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-80"
          >
            <option value="ALL">All Vacancies (Combined Merit Pool)</option>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>
                {v.jobCode} • {v.title.slice(0, 36)}...
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{eligibleCandidates.length}</strong> candidates ranked by combined score
        </div>
      </div>

      {/* 4. Merit Ranking Candidates Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      eligibleCandidates.length > 0 &&
                      selectedCandidateIds.length === eligibleCandidates.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">Merit Rank</th>
                <th className="py-3.5 px-4">Candidate & Ref</th>
                <th className="py-3.5 px-4">Vacancy & Division</th>
                <th className="py-3.5 px-4 text-center">Exam (100)</th>
                <th className="py-3.5 px-4 text-center">Interview (100)</th>
                <th className="py-3.5 px-4 text-center">Total Score</th>
                <th className="py-3.5 px-4">Call Letter</th>
                <th className="py-3.5 px-4">Stage Status</th>
                <th className="py-3.5 px-5 text-right">Scores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {eligibleCandidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No eligible candidates found for the selected vacancy.
                  </td>
                </tr>
              ) : (
                eligibleCandidates.map((cand, idx) => {
                  const isSelected = selectedCandidateIds.includes(cand.id);
                  const totalScore = (cand.examMarks || 0) + (cand.interviewMarks || 0);

                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectCandidate(cand.id)}
                          className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-700 border border-slate-300'
                              : idx === 2
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{cand.candidateName}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {cand.referenceNo} • NIC: {cand.candidateNic}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{cand.jobTitle}</span>
                        <span className="text-[11px] text-slate-500">{cand.department}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {cand.examMarks !== undefined ? `${cand.examMarks}` : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {cand.interviewMarks !== undefined ? `${cand.interviewMarks}` : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-black text-sm text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-mono">
                          {totalScore > 0 ? `${totalScore} / 200` : 'Pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {cand.callLetter ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Issued</span>
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {cand.callLetter.date}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            Not Generated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            cand.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : cand.status === 'Forwarded to Director Board'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : cand.status === 'Shortlisted'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {cand.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => {
                            setEditingMarksApp(cand);
                            setInputExamMarks(cand.examMarks || 75);
                            setInputInterviewMarks(cand.interviewMarks || 80);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 font-semibold text-xs transition cursor-pointer"
                        >
                          Enter Marks
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

      {/* 5. Modal: Bulk Issue Call Letters */}
      {isCallLetterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#07203b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Bulk Generate Call Letters (Admissions)</h3>
                <p className="text-xs text-sky-200">
                  Issuing official admissions to {selectedCandidateIds.length} candidate(s)
                </p>
              </div>
              <button
                onClick={() => setIsCallLetterModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchCallLetters} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Examination / Evaluation Type *
                </label>
                <input
                  type="text"
                  required
                  value={clType}
                  onChange={(e) => setClType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={clDate}
                    onChange={(e) => setClDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Window *
                  </label>
                  <input
                    type="text"
                    required
                    value={clTime}
                    onChange={(e) => setClTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Examination Venue *
                </label>
                <input
                  type="text"
                  required
                  value={clVenue}
                  onChange={(e) => setClVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Instructions to Candidates (One per line)
                </label>
                <textarea
                  rows={3}
                  value={clInstructions}
                  onChange={(e) => setClInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCallLetterModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  Dispatch Official Admissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Forward to Director Board Docket */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#07203b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Forward Merit List to CEB Director Board</h3>
                <p className="text-xs text-sky-200">
                  Submitting {selectedCandidateIds.length} candidate(s) for final board ratification
                </p>
              </div>
              <button
                onClick={() => setIsBoardModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitToBoard} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certifying HR Officer *
                </label>
                <input
                  type="text"
                  required
                  value={boardSignOffOfficer}
                  onChange={(e) => setBoardSignOffOfficer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HR Committee Recommendation Memo *
                </label>
                <textarea
                  rows={4}
                  required
                  value={boardMemo}
                  onChange={(e) => setBoardMemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                ⚠️ Once submitted, these candidate records will appear directly on the{' '}
                <strong>Director Board Portal</strong> for final appointment approval or remarks.
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBoardModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#07203b] hover:bg-[#0c2b4d] text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  Submit Docket to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Enter Assessment Marks */}
      {editingMarksApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#07203b] px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Evaluation Marks</h3>
                <p className="text-[11px] text-sky-200">{editingMarksApp.candidateName}</p>
              </div>
              <button
                onClick={() => setEditingMarksApp(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Written Examination Marks (Out of 100) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={inputExamMarks}
                  onChange={(e) => setInputExamMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technical Viva / Interview Marks (Out of 100) *
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={inputInterviewMarks}
                  onChange={(e) => setInputInterviewMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between font-bold">
                <span className="text-slate-600">Combined Total:</span>
                <span className="text-sky-700 font-mono">
                  {Number(inputExamMarks) + Number(inputInterviewMarks)} / 200
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMarksApp(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
