import {
  MOCK_SYSTEM_USERS,
  MOCK_DEPARTMENTS,
  MOCK_AUDIT_LOGS,
  MOCK_VACANCIES,
  MOCK_HR_APPLICATIONS,
  MOCK_APPLICATIONS,
  MOCK_CANDIDATE_PROFILE,
  DEFAULT_PORTAL_SETTINGS,
  DEFAULT_NOTIFICATION_TEMPLATES,
  type SystemUser,
  type DepartmentItem,
  type AuditLogEntry,
  type PortalSettings,
  type NotificationTemplate,
  type ApplicantApplication,
  type CandidateProfile,
} from '../data/mockRecruitmentData';
import type { ApplicationStatus, JobVacancy, HrApplication } from '../types';

export const STORAGE_KEYS = {
  SYSTEM_USERS: 'ceb_admin_system_users',
  DEPARTMENTS: 'ceb_admin_departments',
  PORTAL_SETTINGS: 'ceb_admin_portal_settings',
  AUDIT_LOGS: 'ceb_admin_audit_logs',
  NOTIFICATION_TEMPLATES: 'ceb_admin_notification_templates',
  HR_VACANCIES: 'ceb_hr_vacancies',
  HR_APPLICATIONS: 'ceb_hr_applications',
  APPLICANT_APPLICATIONS: 'ceb_applicant_applications',
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export function getSystemUsers(): SystemUser[] {
  return readJson<SystemUser[]>(STORAGE_KEYS.SYSTEM_USERS, MOCK_SYSTEM_USERS);
}

export function saveSystemUsers(users: SystemUser[]): void {
  writeJson(STORAGE_KEYS.SYSTEM_USERS, users);
}

export function getDepartments(): DepartmentItem[] {
  return readJson<DepartmentItem[]>(STORAGE_KEYS.DEPARTMENTS, MOCK_DEPARTMENTS);
}

export function saveDepartments(departments: DepartmentItem[]): void {
  writeJson(STORAGE_KEYS.DEPARTMENTS, departments);
}

export function getPortalSettings(): PortalSettings {
  return {
    ...DEFAULT_PORTAL_SETTINGS,
    ...readJson<Partial<PortalSettings>>(STORAGE_KEYS.PORTAL_SETTINGS, DEFAULT_PORTAL_SETTINGS),
  };
}

export function savePortalSettings(settings: PortalSettings): void {
  writeJson(STORAGE_KEYS.PORTAL_SETTINGS, settings);
}

export function getNotificationTemplates(): NotificationTemplate[] {
  return readJson<NotificationTemplate[]>(
    STORAGE_KEYS.NOTIFICATION_TEMPLATES,
    DEFAULT_NOTIFICATION_TEMPLATES
  );
}

export function saveNotificationTemplates(templates: NotificationTemplate[]): void {
  writeJson(STORAGE_KEYS.NOTIFICATION_TEMPLATES, templates);
}

export function getAuditLogs(): AuditLogEntry[] {
  return readJson<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);
}

export function getHrVacancies(): JobVacancy[] {
  return readJson<JobVacancy[]>(STORAGE_KEYS.HR_VACANCIES, MOCK_VACANCIES);
}

export function saveHrVacancies(vacancies: JobVacancy[]): void {
  writeJson(STORAGE_KEYS.HR_VACANCIES, vacancies);
}

export function getHrApplications(): HrApplication[] {
  return readJson<HrApplication[]>(STORAGE_KEYS.HR_APPLICATIONS, MOCK_HR_APPLICATIONS);
}

export function saveHrApplications(applications: HrApplication[]): void {
  writeJson(STORAGE_KEYS.HR_APPLICATIONS, applications);
}

function getStepIndexForStatus(status: ApplicationStatus): number {
  switch (status) {
    case 'Submitted':
      return 0;
    case 'Under HR Review':
    case 'Requires Further Information':
    case 'Eligible':
    case 'Ineligible':
      return 1;
    case 'Shortlisted':
      return 2;
    case 'Forwarded to Director Board':
      return 3;
    case 'Approved':
    case 'Rejected':
      return 4;
    default:
      return 0;
  }
}

export function getApplicantApplications(candidateEmail?: string): ApplicantApplication[] {
  const baseApps = readJson<ApplicantApplication[]>(
    STORAGE_KEYS.APPLICANT_APPLICATIONS,
    MOCK_APPLICATIONS
  );
  const hrApps = getHrApplications();
  const cleanEmail = candidateEmail?.trim().toLowerCase();

  return baseApps.map((app) => {
    const matchedHr = hrApps.find(
      (hr) =>
        hr.referenceNo === app.referenceNo &&
        (!cleanEmail || hr.candidateEmail.toLowerCase() === cleanEmail)
    );
    if (!matchedHr) return app;

    return {
      ...app,
      status: matchedHr.status,
      statusRemark: matchedHr.boardRemarks || matchedHr.statusRemark || app.statusRemark,
      currentStepIndex: getStepIndexForStatus(matchedHr.status),
      requestedDocLabel: matchedHr.requestedDocLabel ?? app.requestedDocLabel,
      requestedInfoNote: matchedHr.requestedInfoNote ?? app.requestedInfoNote,
      callLetter: matchedHr.callLetter
        ? {
            type: matchedHr.callLetter.type,
            date: matchedHr.callLetter.date,
            time: matchedHr.callLetter.time,
            venue: matchedHr.callLetter.venue,
            instructions: matchedHr.callLetter.instructions || [],
          }
        : app.callLetter,
    };
  });
}

export function saveApplicantApplications(applications: ApplicantApplication[]): void {
  writeJson(STORAGE_KEYS.APPLICANT_APPLICATIONS, applications);
}

export interface SubmitApplicationInput {
  vacancy: JobVacancy;
  candidateName: string;
  candidateEmail: string;
  qualificationSummary?: string;
  experienceYears?: number;
  documentsSubmitted?: string[];
}

export function submitApplicantApplication(input: SubmitApplicationInput): {
  referenceNo: string;
  applicantApp: ApplicantApplication;
} {
  const referenceNo = `CEB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toISOString().slice(0, 10);
  const docs =
    input.documentsSubmitted && input.documentsSubmitted.length > 0
      ? input.documentsSubmitted
      : [
          `CV_${input.candidateName.trim().replace(/\s+/g, '_')}_2026.pdf`,
          'NIC_Certified_Copy.pdf',
          'Academic_Certificates.pdf',
        ];

  const applicantApp: ApplicantApplication = {
    id: `app-${Date.now()}`,
    referenceNo,
    vacancyId: input.vacancy.id,
    jobCode: input.vacancy.jobCode,
    jobTitle: input.vacancy.title,
    department: input.vacancy.department,
    location: input.vacancy.location,
    employmentType: input.vacancy.employmentType,
    appliedDate: today,
    status: 'Submitted',
    statusRemark: 'Online application submitted; awaiting HR preliminary scrutiny.',
    currentStepIndex: 0,
    documentsSubmitted: docs,
    timeline: [
      {
        id: `tl-${Date.now()}`,
        date: `${today} • Just now`,
        status: 'Submitted',
        title: 'Application Submitted',
        note: `Application registered with reference ${referenceNo} via CEB Job Portal.`,
        actor: input.candidateName,
      },
    ],
  };

  const currentApplicantApps = getApplicantApplications(input.candidateEmail);
  saveApplicantApplications([applicantApp, ...currentApplicantApps]);

  // Load candidate profile details if customized in CandidateProfilePage
  const savedProfile = readJson<CandidateProfile>(
    `ceb_candidate_profile_${input.candidateEmail || 'default'}`,
    MOCK_CANDIDATE_PROFILE
  );

  const hrApp: HrApplication = {
    id: `hr-app-${Date.now()}`,
    referenceNo,
    candidateName: input.candidateName,
    candidateNic: savedProfile.nic || '199724501892',
    candidateEmail: input.candidateEmail,
    candidatePhone: savedProfile.phone || '+94 77 458 9210',
    age: 29,
    gender: savedProfile.gender === 'Male' || savedProfile.gender === 'Female' ? savedProfile.gender : 'Other',
    district: savedProfile.district || 'Colombo',
    vacancyId: input.vacancy.id,
    jobCode: input.vacancy.jobCode,
    jobTitle: input.vacancy.title,
    department: input.vacancy.department,
    appliedDate: today,
    status: 'Submitted',
    statusRemark: 'Newly received application. Pending preliminary document scrutiny.',
    educationSummary:
      input.qualificationSummary?.trim() ||
      savedProfile.education[0]?.title ||
      'Verified academic qualifications on candidate profile',
    experienceYears:
      input.experienceYears !== undefined ? input.experienceYears : 2,
    documents: docs.map((fileName, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: fileName,
      type: idx === 0 ? 'CV' : 'Supporting',
      status: 'Pending',
      size: '1.2 MB',
    })),
  };

  const currentHrApps = getHrApplications();
  saveHrApplications([hrApp, ...currentHrApps]);

  appendAuditLog({
    actorName: input.candidateName,
    actorRole: 'APPLICANT',
    action: 'Submitted Job Application',
    target: `${referenceNo} (${input.vacancy.title})`,
    category: 'RECRUITMENT',
    severity: 'INFO',
    details: `Submitted ${docs.length} document(s) for ${input.vacancy.jobCode}.`,
  });

  return { referenceNo, applicantApp };
}

export function resubmitApplicantDocuments(
  appId: string,
  uploadedFile: string,
  applicantNote: string,
  actorName: string,
  candidateEmail?: string
): ApplicantApplication[] {
  const currentApps = getApplicantApplications(candidateEmail);
  const target = currentApps.find((a) => a.id === appId);
  const nowLabel = formatNowTimestamp();

  const updatedApplicantApps = currentApps.map((app) => {
    if (app.id !== appId) return app;
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
        actor: actorName,
      },
    ];
    return {
      ...app,
      status: 'Under HR Review' as ApplicationStatus,
      statusRemark: `Updated document (${uploadedFile}) submitted; queued for HR verification.`,
      currentStepIndex: 1,
      documentsSubmitted: app.documentsSubmitted.includes(uploadedFile)
        ? app.documentsSubmitted
        : [...app.documentsSubmitted, uploadedFile],
      timeline: updatedTimeline,
    };
  });

  saveApplicantApplications(updatedApplicantApps);

  if (target) {
    const hrApps = getHrApplications();
    const updatedHrApps = hrApps.map((hr) => {
      if (hr.referenceNo !== target.referenceNo) return hr;
      const hasDoc = hr.documents.some((d) => d.name === uploadedFile);
      return {
        ...hr,
        status: 'Under HR Review' as ApplicationStatus,
        statusRemark: `Candidate uploaded requested document (${uploadedFile}); awaiting verification.`,
        documents: hasDoc
          ? hr.documents
          : [
              ...hr.documents,
              {
                id: `doc-${Date.now()}`,
                name: uploadedFile,
                type: 'Clarification',
                status: 'Under Review' as const,
                size: '1.1 MB',
              },
            ],
      };
    });
    saveHrApplications(updatedHrApps);

    appendAuditLog({
      actorName,
      actorRole: 'APPLICANT',
      action: 'Re-submitted Requested Document',
      target: `${target.referenceNo} (${uploadedFile})`,
      category: 'RECRUITMENT',
      severity: 'INFO',
      details: applicantNote.trim() || 'Uploaded requested certified document for HR review.',
    });
  }

  return updatedApplicantApps;
}

export function withdrawApplicantApplication(
  appId: string,
  candidateEmail?: string,
  actorName?: string
): ApplicantApplication[] {
  const currentApps = getApplicantApplications(candidateEmail);
  const target = currentApps.find((a) => a.id === appId);
  const nextApplicantApps = currentApps.filter((a) => a.id !== appId);
  saveApplicantApplications(nextApplicantApps);

  if (target) {
    const hrApps = getHrApplications().filter((hr) => hr.referenceNo !== target.referenceNo);
    saveHrApplications(hrApps);

    appendAuditLog({
      actorName: actorName || 'Applicant',
      actorRole: 'APPLICANT',
      action: 'Withdrew Job Application',
      target: `${target.referenceNo} (${target.jobTitle})`,
      category: 'RECRUITMENT',
      severity: 'INFO',
      details: 'Candidate withdrew application during preliminary screening stage.',
    });
  }

  return nextApplicantApps;
}

function formatNowTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function appendAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }
): AuditLogEntry[] {
  const current = getAuditLogs();
  const nextEntry: AuditLogEntry = {
    id: `aud-${Date.now().toString().slice(-5)}`,
    timestamp: formatNowTimestamp(),
    ipAddress: entry.ipAddress || '10.24.18.42',
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    target: entry.target,
    category: entry.category,
    severity: entry.severity,
    details: entry.details,
  };
  const next = [nextEntry, ...current];
  writeJson(STORAGE_KEYS.AUDIT_LOGS, next);
  return next;
}
