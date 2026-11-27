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
import type { ApplicationStatus, JobVacancy, HrApplication, UserRole } from '../types';

export interface PortalNotification {
  id: string;
  targetRole: UserRole;
  targetEmail?: string;
  title: string;
  category: 'Application' | 'Vacancy' | 'System' | 'Deadline' | 'Approval';
  statusTag: string;
  actionRequired?: boolean;
  actionPath?: string;
  timestamp: string;
  isRead: boolean;
}

export const NOTIFICATIONS_UPDATED_EVENT = 'ceb-notifications-updated';

const DEFAULT_PORTAL_NOTIFICATIONS: PortalNotification[] = [
  // Applicant
  {
    id: 'notif-app-1',
    targetRole: 'APPLICANT',
    title: 'Document Verification Required: Upload JP-certified Degree copy (CEB-2026-CE12)',
    category: 'Application',
    statusTag: 'Action Required',
    actionRequired: true,
    actionPath: '/applicant/applications',
    timestamp: '11/25/2026, 2:15 PM',
    isRead: false,
  },
  {
    id: 'notif-app-2',
    targetRole: 'APPLICANT',
    title: 'Written Exam Call Letter Ready: Systems & Network Engineer (CEB-2026-IT09)',
    category: 'Approval',
    statusTag: 'Shortlisted',
    actionRequired: true,
    actionPath: '/applicant/applications',
    timestamp: '11/25/2026, 11:20 AM',
    isRead: false,
  },
  {
    id: 'notif-app-3',
    targetRole: 'APPLICANT',
    title: 'Application Ref #CEB-2026-EE04 received and under HR scrutiny',
    category: 'Application',
    statusTag: 'Under HR Review',
    actionPath: '/applicant/applications',
    timestamp: '11/23/2026, 2:39 PM',
    isRead: true,
  },
  // HR Staff
  {
    id: 'notif-hr-1',
    targetRole: 'HR',
    title: 'New Application Pending Scrutiny: Thilina Perera (CEB-2026-DS06)',
    category: 'Application',
    statusTag: 'Pending Scrutiny',
    actionRequired: true,
    actionPath: '/hr/applications',
    timestamp: '11/26/2026, 10:12 AM',
    isRead: false,
  },
  {
    id: 'notif-hr-2',
    targetRole: 'HR',
    title: '2 Shortlisted Candidates Ready for Exam Marks & Board Forwarding',
    category: 'Vacancy',
    statusTag: 'Shortlist Queue',
    actionRequired: true,
    actionPath: '/hr/shortlist',
    timestamp: '11/25/2026, 4:05 PM',
    isRead: false,
  },
  {
    id: 'notif-hr-3',
    targetRole: 'HR',
    title: 'Director Board Ratified Appointment: Lasith Karunaratne (CEB-2026-FN05)',
    category: 'Approval',
    statusTag: 'Board Approved',
    actionPath: '/hr/applications',
    timestamp: '11/24/2026, 5:10 PM',
    isRead: true,
  },
  // Director Board
  {
    id: 'notif-dir-1',
    targetRole: 'DIRECTOR',
    title: '2 Recommended Candidate Dockets Awaiting Final Board Approval',
    category: 'Approval',
    statusTag: 'Board Decision Pending',
    actionRequired: true,
    actionPath: '/director/shortlisted',
    timestamp: '11/26/2026, 1:45 PM',
    isRead: false,
  },
  {
    id: 'notif-dir-2',
    targetRole: 'DIRECTOR',
    title: 'Finance Division Merit Memo Submitted by HR Panel (CEB-2026-FN02)',
    category: 'Application',
    statusTag: 'HR Memo Ready',
    actionRequired: true,
    actionPath: '/director/shortlisted',
    timestamp: '11/25/2026, 3:20 PM',
    isRead: false,
  },
  // System Admin
  {
    id: 'notif-adm-1',
    targetRole: 'ADMIN',
    title: 'Security Alert: Rate-limiter cooldown triggered on hr@ceb.lk (5 failed attempts)',
    category: 'System',
    statusTag: 'Security Warning',
    actionRequired: true,
    actionPath: '/admin/dashboard',
    timestamp: '11/25/2026, 9:03 AM',
    isRead: false,
  },
  {
    id: 'notif-adm-2',
    targetRole: 'ADMIN',
    title: 'Recruitment Cycle 2026/2027 Policy & Template Configuration Active',
    category: 'System',
    statusTag: 'System Notice',
    actionPath: '/admin/departments',
    timestamp: '11/24/2026, 2:00 PM',
    isRead: true,
  },
];

export const STORAGE_KEYS = {
  SYSTEM_USERS: 'ceb_admin_system_users',
  DEPARTMENTS: 'ceb_admin_departments',
  PORTAL_SETTINGS: 'ceb_admin_portal_settings',
  AUDIT_LOGS: 'ceb_admin_audit_logs',
  NOTIFICATION_TEMPLATES: 'ceb_admin_notification_templates',
  HR_VACANCIES: 'ceb_hr_vacancies',
  HR_APPLICATIONS: 'ceb_hr_applications',
  APPLICANT_APPLICATIONS: 'ceb_applicant_applications',
  PORTAL_NOTIFICATIONS: 'ceb_portal_notifications',
  NOTIFICATION_PREFERENCES: 'ceb_notification_preferences',
} as const;

export interface NotificationPreferences {
  enabled: boolean;
  applicationUpdates: boolean;
  vacancyAlerts: boolean;
  systemNotices: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  enabled: true,
  applicationUpdates: true,
  vacancyAlerts: true,
  systemNotices: true,
};

function getPrefStorageKey(email?: string): string {
  const clean = email?.trim().toLowerCase();
  return clean
    ? `${STORAGE_KEYS.NOTIFICATION_PREFERENCES}_${clean}`
    : STORAGE_KEYS.NOTIFICATION_PREFERENCES;
}

export function getNotificationPreferences(email?: string): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFS,
    ...readJson<Partial<NotificationPreferences>>(
      getPrefStorageKey(email),
      DEFAULT_NOTIFICATION_PREFS
    ),
  };
}

export function saveNotificationPreferences(
  prefs: NotificationPreferences,
  email?: string
): void {
  writeJson(getPrefStorageKey(email), prefs);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  }
}

export function isCategoryEnabled(
  category: PortalNotification['category'],
  prefs: NotificationPreferences
): boolean {
  if (!prefs.enabled) return false;
  if (category === 'Vacancy') return prefs.vacancyAlerts;
  if (category === 'System') return prefs.systemNotices;
  if (category === 'Application' || category === 'Approval') return prefs.applicationUpdates;
  return true;
}

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

  pushNotification({
    targetRole: 'HR',
    title: `New Application Submitted: ${input.candidateName} (${referenceNo})`,
    category: 'Application',
    statusTag: 'Pending Scrutiny',
    actionRequired: true,
    actionPath: '/hr/applications',
  });

  pushNotification({
    targetRole: 'APPLICANT',
    targetEmail: input.candidateEmail,
    title: `Application Ref #${referenceNo} submitted for ${input.vacancy.title}`,
    category: 'Application',
    statusTag: 'Submitted',
    actionPath: '/applicant/applications',
  });

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

    pushNotification({
      targetRole: 'HR',
      title: `Clarification Document Uploaded: ${target.referenceNo} (${uploadedFile})`,
      category: 'Application',
      statusTag: 'Ready for Re-verification',
      actionRequired: true,
      actionPath: '/hr/applications',
    });

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

  if (entry.severity === 'WARNING' || entry.severity === 'CRITICAL') {
    pushNotification({
      targetRole: 'ADMIN',
      title: `${entry.action}: ${entry.target}`,
      category: 'System',
      statusTag: entry.severity === 'CRITICAL' ? 'Critical Alert' : 'Security Warning',
      actionRequired: true,
      actionPath: '/admin/dashboard',
    });
  }

  return next;
}

function getAllNotifications(): PortalNotification[] {
  return readJson<PortalNotification[]>(
    STORAGE_KEYS.PORTAL_NOTIFICATIONS,
    DEFAULT_PORTAL_NOTIFICATIONS
  );
}

function saveAllNotifications(list: PortalNotification[]): void {
  writeJson(STORAGE_KEYS.PORTAL_NOTIFICATIONS, list);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  }
}

export function getNotificationsForUser(
  role?: UserRole,
  email?: string
): PortalNotification[] {
  if (!role) return [];
  const cleanEmail = email?.trim().toLowerCase();
  const prefs = getNotificationPreferences(email);
  return getAllNotifications().filter(
    (n) =>
      n.targetRole === role &&
      (!n.targetEmail || !cleanEmail || n.targetEmail.toLowerCase() === cleanEmail) &&
      (!prefs.enabled || isCategoryEnabled(n.category, prefs))
  );
}

export function pushNotification(
  input: Omit<PortalNotification, 'id' | 'timestamp' | 'isRead'>
): void {
  const settings = getPortalSettings();
  if (
    input.targetRole === 'APPLICANT' &&
    !settings.automatedCandidateAlerts &&
    !input.actionRequired
  ) {
    return;
  }

  // Respect per-user mute / category settings when targeted or currently active
  const targetPrefs = getNotificationPreferences(input.targetEmail);
  if (input.targetEmail && !isCategoryEnabled(input.category, targetPrefs)) {
    return;
  }

  const nextItem: PortalNotification = {
    ...input,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
    isRead: false,
  };
  saveAllNotifications([nextItem, ...getAllNotifications()]);
}

export function markNotificationRead(id: string): void {
  const updated = getAllNotifications().map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
  saveAllNotifications(updated);
}

export function removeNotificationById(id: string): void {
  const updated = getAllNotifications().filter((n) => n.id !== id);
  saveAllNotifications(updated);
}

export function markAllNotificationsReadForUser(role?: UserRole, email?: string): void {
  if (!role) return;
  const cleanEmail = email?.trim().toLowerCase();
  const updated = getAllNotifications().map((n) => {
    const matches =
      n.targetRole === role &&
      (!n.targetEmail || !cleanEmail || n.targetEmail.toLowerCase() === cleanEmail);
    return matches ? { ...n, isRead: true } : n;
  });
  saveAllNotifications(updated);
}

export function clearNotificationsForUser(role?: UserRole, email?: string): void {
  if (!role) return;
  const cleanEmail = email?.trim().toLowerCase();
  const updated = getAllNotifications().filter((n) => {
    const matches =
      n.targetRole === role &&
      (!n.targetEmail || !cleanEmail || n.targetEmail.toLowerCase() === cleanEmail);
    return !matches;
  });
  saveAllNotifications(updated);
}
