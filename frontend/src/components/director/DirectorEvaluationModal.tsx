import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  GraduationCap,
  Briefcase,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  MessageSquare,
} from 'lucide-react';
import type { HrApplication } from '../../types';

interface DirectorEvaluationModalProps {
  application: HrApplication | null;
  onClose: () => void;
  onDecision?: (
    applicationId: string,
    decision: 'Approved' | 'Rejected',
    boardRemarks: string
  ) => void;
  onToast?: (message: string) => void;
}

export const DirectorEvaluationModal: React.FC<DirectorEvaluationModalProps> = ({
  application,
  onClose,
  onDecision,
  onToast,
}) => {
  const [boardRemarks, setBoardRemarks] = useState('');
  const [pendingAction, setPendingAction] = useState<'Approved' | 'Rejected' | null>(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setBoardRemarks(application?.boardRemarks || '');
    setPendingAction(null);
    setValidationError('');
  }, [application]);

  if (!application) return null;

  const canDecide = application.status === 'Forwarded to Director Board' && Boolean(onDecision);
  const totalMarks = (application.examMarks || 0) + (application.interviewMarks || 0);

  const handleRequestDecision = (decision: 'Approved' | 'Rejected') => {
    setValidationError('');
    if (decision === 'Rejected' && !boardRemarks.trim()) {
      setValidationError('Please provide official Board remarks explaining the rejection.');
      return;
    }
    setPendingAction(decision);
  };

  const handleConfirmDecision = () => {
    if (!pendingAction || !onDecision) return;
    const finalRemarks =
      boardRemarks.trim() ||
      (pendingAction === 'Approved'
        ? 'Appointment approved by CEB Director Board following review of HR merit docket.'
        : 'Candidate not selected by Director Board.');
    onDecision(application.id, pendingAction, finalRemarks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 rounded-md">
                {application.referenceNo}
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {application.jobCode}
              </span>
              {application.meritRank && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Award className="w-3 h-3" />
                  Merit Rank #{application.meritRank}
                </span>
              )}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  application.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : application.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : application.status === 'Forwarded to Director Board'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}
              >
                {application.status}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
              {application.candidateName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applied for <strong className="text-slate-700">{application.jobTitle}</strong> •{' '}
              {application.department}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Profile + Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2.5 text-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Candidate Dossier
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <p className="flex items-center gap-1.5 text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  NIC: <strong>{application.candidateNic}</strong>
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Age {application.age} • {application.gender}
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{application.candidateEmail}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{application.candidatePhone}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{application.district} District</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong>{application.experienceYears} yrs</strong> experience
                </span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-slate-700 leading-relaxed">{application.educationSummary}</p>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between gap-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Evaluation Score Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-xl border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 block">Exam</span>
                <span className="text-base font-black text-slate-900">
                  {application.examMarks ?? '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">/100</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-2.5">
                <span className="text-[10px] text-slate-400 block">Interview</span>
                <span className="text-base font-black text-slate-900">
                  {application.interviewMarks ?? '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">/100</span>
              </div>
              <div className="bg-sky-600 rounded-xl p-2.5 text-white">
                <span className="text-[10px] text-sky-100 block">Total</span>
                <span className="text-base font-black">
                  {totalMarks > 0 ? totalMarks : '—'}
                </span>
                <span className="text-[10px] text-sky-100 block">/200</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Applied Date: <strong className="text-slate-700">{application.appliedDate}</strong>
            </p>
          </div>
        </div>

        {/* HR Recommendation Memo */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/70 text-xs space-y-1">
          <p className="font-bold text-sky-900 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            HR Selection Committee Recommendation
          </p>
          <p className="text-sky-950 leading-relaxed">
            {application.hrRemarks || application.statusRemark || 'No additional HR committee remarks.'}
          </p>
        </div>

        {/* Verified Supporting Documents */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Verified Supporting Documents ({application.documents.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {application.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {doc.type} • {doc.size} •{' '}
                      <span className="text-emerald-600 font-semibold">{doc.status}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onToast && onToast(`Opening verified document "${doc.name}"...`)
                  }
                  className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition cursor-pointer shrink-0"
                  title="Preview / Download document"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Director Board Decision Section */}
        {canDecide ? (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Director Board Remarks / Decision Justification
              </label>
              <textarea
                rows={3}
                value={boardRemarks}
                onChange={(e) => {
                  setBoardRemarks(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Enter official Board approval endorsement or rejection justification (required if rejecting)..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
              {validationError && (
                <p className="text-xs text-rose-600 font-semibold mt-1">{validationError}</p>
              )}
            </div>

            {pendingAction ? (
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  pendingAction === 'Approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Confirm <strong>{pendingAction}</strong> decision for{' '}
                    <strong>{application.candidateName}</strong> ({application.referenceNo})?
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPendingAction(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDecision}
                    className={`px-3.5 py-1.5 rounded-lg text-white font-semibold cursor-pointer ${
                      pendingAction === 'Approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    Confirm {pendingAction}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestDecision('Rejected')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestDecision('Approved')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Appointment</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {application.boardRemarks && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900 block mb-0.5">Recorded Board Remarks:</strong>
                {application.boardRemarks}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
