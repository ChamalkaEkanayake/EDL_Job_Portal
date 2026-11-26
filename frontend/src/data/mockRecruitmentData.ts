import type { JobVacancy, ApplicationStatus, UserRole, HrApplication } from '../types';

export interface ApplicationTimelineEvent {
  id: string;
  date: string;
  status: ApplicationStatus;
  title: string;
  note: string;
  actor: string;
}

export interface CallLetterDetails {
  type: string;
  date: string;
  time: string;
  venue: string;
  instructions: string[];
}

export interface ApplicantApplication {
  id: string;
  referenceNo: string;
  vacancyId: string;
  jobCode?: string;
  jobTitle: string;
  department: string;
  location: string;
  employmentType?: 'Full-time' | 'Contract' | 'Permanent';
  appliedDate: string;
  status: ApplicationStatus;
  statusRemark?: string;
  currentStepIndex: number; // 0 to 4
  documentsSubmitted: string[];
  requestedInfoNote?: string;
  requestedDocLabel?: string;
  callLetter?: CallLetterDetails;
  timeline?: ApplicationTimelineEvent[];
}

export const MOCK_VACANCIES: JobVacancy[] = [
  {
    id: 'vac-1',
    jobCode: 'CEB-REC-2026-001',
    title: 'Electrical Engineer (Transmission & Grid Planning)',
    department: 'Transmission Division',
    location: 'Head Office, Colombo / Substation Networks',
    employmentType: 'Permanent',
    vacanciesCount: 5,
    closingDate: '2026-12-15',
    description:
      'Responsible for power system analysis, transmission line protection schemes, and grid expansion feasibility studies across Sri Lanka.',
    qualifications: [
      'B.Sc. Engineering degree in Electrical / Power Engineering recognized by IESL',
      'Minimum of 2 years post-qualifying field experience in HV/MV systems',
      'Age below 35 years as of the closing date',
    ],
    requirements: [
      'Valid registration with IESL as an Associate or Corporate Member',
      'Strong analytical proficiency in power flow simulation software (e.g. PSS/E, DigSILENT)',
      'Valid driving license',
    ],
    status: 'PUBLISHED',
    createdAt: '2026-11-01',
  },
  {
    id: 'vac-2',
    jobCode: 'CEB-REC-2026-002',
    title: 'Assistant Civil Engineer (Hydro Generation Projects)',
    department: 'Generation Division',
    location: 'Laxapana & Kotmale Hydro Complex',
    employmentType: 'Permanent',
    vacanciesCount: 3,
    closingDate: '2026-12-20',
    description:
      'Supervision of structural maintenance for dams, tunnels, penstocks, and powerhouses within major hydroelectric catchment reservoirs.',
    qualifications: [
      'B.Sc. in Civil Engineering from a recognized university',
      'Experience in hydraulic structures or dam monitoring is an added advantage',
      'Age below 32 years',
    ],
    requirements: [
      'Sound knowledge of geotechnical inspections and concrete durability tests',
      'Willingness to work stationed at hydro catchment project sites',
    ],
    status: 'PUBLISHED',
    createdAt: '2026-11-05',
  },
  {
    id: 'vac-3',
    jobCode: 'CEB-REC-2026-003',
    title: 'Systems & Network Engineer (Smart Grid Operations)',
    department: 'Information Technology Division',
    location: 'Colombo',
    employmentType: 'Permanent',
    vacanciesCount: 2,
    closingDate: '2026-12-25',
    description:
      'Maintenance and cybersecurity hardening of SCADA networks, AMI smart metering telemetry, and enterprise cloud infrastructure.',
    qualifications: [
      'B.Sc. in Computer Engineering, Computer Science or equivalent',
      'Industry certifications (CCNA/CCNP, RHCSA, or AWS/Azure)',
      '2+ years in OT/SCADA network security',
    ],
    requirements: [
      'Hands-on knowledge in Linux, industrial firewalls, and microservice architectures',
      'Experience with database clustering and real-time telemetry protocols',
    ],
    status: 'PUBLISHED',
    createdAt: '2026-11-10',
  },
  {
    id: 'vac-4',
    jobCode: 'CEB-REC-2026-004',
    title: 'Accountant (Financial Management & Audit)',
    department: 'Finance Division',
    location: 'Head Office, Colombo 02',
    employmentType: 'Permanent',
    vacanciesCount: 2,
    closingDate: '2026-12-28',
    description:
      'Oversee financial reporting, capital project budgeting, tariff cost analysis, and statutory audit coordination across regional divisions.',
    qualifications: [
      'Associate Member of CA Sri Lanka, CIMA, or ACCA',
      'B.Sc. in Accountancy / Financial Management from a recognized university',
      'Minimum 3 years post-qualifying experience in a large public or corporate entity',
    ],
    requirements: [
      'Proficiency in ERP accounting modules and Sri Lanka Accounting Standards (LKAS/SLFRS)',
      'Strong analytical and regulatory compliance reporting skills',
    ],
    status: 'PUBLISHED',
    createdAt: '2026-11-12',
  },
  {
    id: 'vac-5',
    jobCode: 'CEB-REC-2026-005',
    title: 'Electrical Superintendent (Distribution Operations)',
    department: 'Distribution Division',
    location: 'Kandy & Central Province Regions',
    employmentType: 'Contract',
    vacanciesCount: 6,
    closingDate: '2026-12-30',
    description:
      'Coordinate 33kV/11kV distribution network maintenance, breakdown restoration teams, and new consumer service connections.',
    qualifications: [
      'National Diploma in Technology (NDT) or HNDE in Electrical Engineering',
      'Minimum 3 years hands-on experience in medium/low voltage distribution networks',
    ],
    requirements: [
      'Strong field leadership and safety compliance awareness (CEB Safety Manual)',
      'Willingness to participate in emergency breakdown restoration rosters',
    ],
    status: 'PUBLISHED',
    createdAt: '2026-11-15',
  },
];

export const MOCK_APPLICATIONS: ApplicantApplication[] = [
  {
    id: 'app-101',
    referenceNo: 'CEB-2026-EE04',
    vacancyId: 'vac-1',
    jobCode: 'CEB-REC-2026-001',
    jobTitle: 'Electrical Engineer (Transmission & Grid Planning)',
    department: 'Transmission Division',
    location: 'Head Office, Colombo / Substation Networks',
    employmentType: 'Permanent',
    appliedDate: '2026-11-16',
    status: 'Under HR Review',
    statusRemark:
      'Documents verified by preliminary scrutiny committee; awaiting technical eligibility scoring.',
    currentStepIndex: 1,
    documentsSubmitted: ['CV_Chamalka_Ekanayaka_2026.pdf', 'Degree_Certificate_IESL.pdf', 'NIC_Copy.pdf'],
    timeline: [
      {
        id: 'tl-101-1',
        date: '2026-11-16 09:42 AM',
        status: 'Submitted',
        title: 'Application Submitted',
        note: 'Online application and 3 supporting documents received via CEB Job Portal.',
        actor: 'Applicant',
      },
      {
        id: 'tl-101-2',
        date: '2026-11-19 02:15 PM',
        status: 'Under HR Review',
        title: 'Preliminary HR Scrutiny Started',
        note: 'NIC and B.Sc. Engineering degree certificates verified against SOR criteria.',
        actor: 'HR Recruitment Unit',
      },
    ],
  },
  {
    id: 'app-102',
    referenceNo: 'CEB-2026-IT09',
    vacancyId: 'vac-3',
    jobCode: 'CEB-REC-2026-003',
    jobTitle: 'Systems & Network Engineer (Smart Grid Operations)',
    department: 'Information Technology Division',
    location: 'Colombo',
    employmentType: 'Permanent',
    appliedDate: '2026-11-12',
    status: 'Shortlisted',
    statusRemark:
      'Shortlisted for Written Aptitude & Practical Evaluation scheduled for 10th Dec 2026.',
    currentStepIndex: 2,
    documentsSubmitted: ['CV_Chamalka_Ekanayaka_2026.pdf', 'CCNA_Certificate.pdf', 'Degree_Transcript.pdf'],
    callLetter: {
      type: 'Written Aptitude & Practical Evaluation',
      date: '2026-12-10',
      time: '09:30 AM – 12:00 PM',
      venue: 'CEB Training Centre, Castlereagh Auditorium, Colombo 02',
      instructions: [
        'Bring your original National Identity Card (NIC) or valid Passport for verification.',
        'Carry a printed copy of this Call Letter along with original academic & CCNA certificates.',
        'Arrive at the examination hall at least 30 minutes prior to the scheduled time.',
      ],
    },
    timeline: [
      {
        id: 'tl-102-1',
        date: '2026-11-12 11:10 AM',
        status: 'Submitted',
        title: 'Application Submitted',
        note: 'Application registered with reference CEB-2026-IT09.',
        actor: 'Applicant',
      },
      {
        id: 'tl-102-2',
        date: '2026-11-15 10:05 AM',
        status: 'Eligible',
        title: 'Eligibility Confirmed',
        note: 'Candidate meets all educational and SCADA/network security experience requirements.',
        actor: 'HR Recruitment Unit',
      },
      {
        id: 'tl-102-3',
        date: '2026-11-21 04:30 PM',
        status: 'Shortlisted',
        title: 'Shortlisted for Evaluation',
        note: 'Written Aptitude & Practical Evaluation call letter issued.',
        actor: 'Selection Committee',
      },
    ],
  },
  {
    id: 'app-103',
    referenceNo: 'CEB-2026-CE12',
    vacancyId: 'vac-2',
    jobCode: 'CEB-REC-2026-002',
    jobTitle: 'Assistant Civil Engineer (Hydro Generation Projects)',
    department: 'Generation Division',
    location: 'Laxapana & Kotmale Hydro Complex',
    employmentType: 'Permanent',
    appliedDate: '2026-11-14',
    status: 'Requires Further Information',
    statusRemark:
      'Please upload a JP-certified copy of your B.Sc. Civil Engineering Degree Certificate (current scan is unclear).',
    currentStepIndex: 1,
    documentsSubmitted: ['CV_Chamalka_Ekanayaka_2026.pdf', 'Civil_Degree_Scan.pdf', 'NIC_Copy.pdf'],
    requestedDocLabel: 'Certified B.Sc. Civil Engineering Degree Certificate (PDF)',
    requestedInfoNote:
      'The uploaded degree scan lacks the Justice of the Peace (JP) certification seal. Please upload a clear certified true copy before 2026-12-05 to proceed to eligibility scoring.',
    timeline: [
      {
        id: 'tl-103-1',
        date: '2026-11-14 03:20 PM',
        status: 'Submitted',
        title: 'Application Submitted',
        note: 'Initial application submitted for Hydro Generation Division.',
        actor: 'Applicant',
      },
      {
        id: 'tl-103-2',
        date: '2026-11-20 09:50 AM',
        status: 'Under HR Review',
        title: 'Assigned to HR Scrutiny Officer',
        note: 'Document quality and SOR qualification review initiated.',
        actor: 'HR Recruitment Unit',
      },
      {
        id: 'tl-103-3',
        date: '2026-11-22 01:40 PM',
        status: 'Requires Further Information',
        title: 'Clarification & Re-upload Requested',
        note: 'JP-certified degree certificate copy requested from candidate.',
        actor: 'HR Scrutiny Officer',
      },
    ],
  },
  {
    id: 'app-104',
    referenceNo: 'CEB-2026-FN02',
    vacancyId: 'vac-4',
    jobCode: 'CEB-REC-2026-004',
    jobTitle: 'Accountant (Financial Management & Audit)',
    department: 'Finance Division',
    location: 'Head Office, Colombo 02',
    employmentType: 'Permanent',
    appliedDate: '2026-11-05',
    status: 'Approved',
    statusRemark:
      'Director Board approved final appointment recommendation. Official offer letter dispatched via registered post and email.',
    currentStepIndex: 4,
    documentsSubmitted: [
      'CV_Chamalka_Ekanayaka_2026.pdf',
      'CA_Sri_Lanka_Membership.pdf',
      'Service_Letters.pdf',
    ],
    timeline: [
      {
        id: 'tl-104-1',
        date: '2026-11-05 08:55 AM',
        status: 'Submitted',
        title: 'Application Submitted',
        note: 'Application received for Finance Division.',
        actor: 'Applicant',
      },
      {
        id: 'tl-104-2',
        date: '2026-11-09 11:30 AM',
        status: 'Shortlisted',
        title: 'Shortlisted by HR Panel',
        note: 'Passed eligibility and professional qualification audit.',
        actor: 'HR Recruitment Unit',
      },
      {
        id: 'tl-104-3',
        date: '2026-11-17 02:00 PM',
        status: 'Forwarded to Director Board',
        title: 'Forwarded to Director Board',
        note: 'Structured interview completed; recommendation submitted to Board.',
        actor: 'Interview Panel',
      },
      {
        id: 'tl-104-4',
        date: '2026-11-23 05:10 PM',
        status: 'Approved',
        title: 'Board Approval Granted',
        note: 'Final selection approved by CEB Director Board.',
        actor: 'Director Board',
      },
    ],
  },
];

export interface EducationEntry {
  id: string;
  title: string;
  institution: string;
  fieldOfStudy: string;
  completionYear: string;
  gradeOrClass: string;
  professionalBody?: string;
}

export interface WorkExperienceEntry {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

export interface VaultDocument {
  id: string;
  label: string;
  description: string;
  required: boolean;
  fileName?: string;
  uploadedDate?: string;
  fileSize?: string;
}

export interface CandidateProfile {
  fullName: string;
  nic: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  bio: string;
  education: EducationEntry[];
  experience: WorkExperienceEntry[];
  documents: VaultDocument[];
}

export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  fullName: 'Chamalka Ekanayaka',
  nic: '199724501892',
  dob: '1997-09-02',
  gender: 'Female',
  email: 'applicant@ceb.lk',
  phone: '+94 77 458 9210',
  address: 'No. 48/B, Temple Road, Maharagama',
  district: 'Colombo',
  province: 'Western Province',
  bio: 'B.Sc. Electrical Engineering graduate and IESL Associate Member with 3+ years of hands-on experience in HV/MV power system analysis, substation protection testing, and smart grid telemetry.',
  education: [
    {
      id: 'edu-1',
      title: 'B.Sc. Engineering (Hons) in Electrical Engineering',
      institution: 'University of Moratuwa',
      fieldOfStudy: 'Power Systems & High Voltage Engineering',
      completionYear: '2021',
      gradeOrClass: 'Second Class Upper Division',
      professionalBody: 'IESL Associate Member (AMIE-SL)',
    },
    {
      id: 'edu-2',
      title: 'G.C.E. Advanced Level (Physical Science Stream)',
      institution: 'Visakha Vidyalaya, Colombo 05',
      fieldOfStudy: 'Combined Mathematics, Physics, Chemistry',
      completionYear: '2016',
      gradeOrClass: '3 A Passes (Z-Score: 2.14)',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Electrical Project Engineer',
      organization: 'Lanka Grid Solutions (Pvt) Ltd',
      startDate: '2023-03',
      endDate: '',
      currentlyWorking: true,
      responsibilities:
        'Lead 33kV/132kV substation protection relay coordination, PSS/E load flow modeling, and commissioning inspections.',
    },
    {
      id: 'exp-2',
      role: 'Junior Maintenance Engineer (Trainee)',
      organization: 'Ceylon Electricity Board — Transmission Planning Branch',
      startDate: '2021-08',
      endDate: '2023-02',
      currentlyWorking: false,
      responsibilities:
        'Assisted senior engineers in grid expansion feasibility studies, transformer testing, and SCADA fault log analysis.',
    },
  ],
  documents: [
    {
      id: 'doc-cv',
      label: 'Primary Curriculum Vitae (CV)',
      description: 'Updated professional resume in PDF format (< 5MB)',
      required: true,
      fileName: 'CV_Chamalka_Ekanayaka_2026.pdf',
      uploadedDate: '2026-11-10',
      fileSize: '1.2 MB',
    },
    {
      id: 'doc-nic',
      label: 'Certified National Identity Card (NIC)',
      description: 'Front & back scan certified by a JP or Attorney-at-Law',
      required: true,
      fileName: 'NIC_Certified_Copy.pdf',
      uploadedDate: '2026-11-10',
      fileSize: '640 KB',
    },
    {
      id: 'doc-degree',
      label: 'Degree / Diploma Certificate(s)',
      description: 'Certified true copy of highest academic/technical qualification',
      required: true,
      fileName: 'Degree_Certificate_IESL.pdf',
      uploadedDate: '2026-11-11',
      fileSize: '2.1 MB',
    },
    {
      id: 'doc-birth',
      label: 'Birth Certificate / Service Letters',
      description: 'Certified copy of Birth Certificate and past employer letters',
      required: false,
    },
  ],
};

// ==========================================
// ADMIN CONSOLE & GOVERNANCE MOCK DATA
// ==========================================

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
  createdAt: string;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  headOfDivision: string;
  assignedHrCoordinator?: string;
  location: string;
  status: 'Active' | 'Inactive';
  openVacancies: number;
}

export interface PortalSettings {
  recruitmentCycle: string;
  maxUploadSizeMb: number;
  allowedFileTypes: 'PDF_ONLY' | 'PDF_AND_IMAGES';
  sessionTimeoutMinutes: number;
  allowApplicantRegistration: boolean;
  requireJpCertificationNotice: boolean;
  automatedCandidateAlerts: boolean;
  maintenanceMode: boolean;
  announcementBanner: string;
}

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  recruitmentCycle: '2026/2027',
  maxUploadSizeMb: 5,
  allowedFileTypes: 'PDF_ONLY',
  sessionTimeoutMinutes: 30,
  allowApplicantRegistration: true,
  requireJpCertificationNotice: true,
  automatedCandidateAlerts: true,
  maintenanceMode: false,
  announcementBanner:
    '2026/2027 Statutory Gazette recruitment cycle is currently active. Ensure all certified PDF uploads are clear and legible.',
};

export type NotificationEventKey =
  | 'APPLICATION_SUBMITTED'
  | 'FURTHER_INFO_REQUESTED'
  | 'SHORTLISTED_CALL_LETTER'
  | 'BOARD_APPROVED';

export interface NotificationTemplate {
  id: string;
  eventKey: NotificationEventKey;
  title: string;
  triggerStatus: string;
  channels: {
    email: boolean;
    sms: boolean;
    portalAlert: boolean;
  };
  subject: string;
  body: string;
  footerDisclaimer: string;
  lastUpdated: string;
}

export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-submitted',
    eventKey: 'APPLICATION_SUBMITTED',
    title: 'Application Acknowledgement',
    triggerStatus: 'Submitted',
    channels: { email: true, sms: true, portalAlert: true },
    subject: 'CEB Recruitment: Application Received ({{referenceNo}}) — {{jobTitle}}',
    body: 'Dear {{candidateName}},\n\nYour application for the position of {{jobTitle}} under {{division}} has been successfully registered with reference number {{referenceNo}} on {{date}}.\n\nYou may monitor preliminary HR screening updates directly from your Candidate Dashboard.',
    footerDisclaimer:
      'Ceylon Electricity Board never charges application or processing fees. Report suspicious requests to 1987.',
    lastUpdated: '2026-11-18',
  },
  {
    id: 'tpl-further-info',
    eventKey: 'FURTHER_INFO_REQUESTED',
    title: 'Further Information / Document Re-upload',
    triggerStatus: 'Requires Further Information',
    channels: { email: true, sms: true, portalAlert: true },
    subject: 'Action Required ({{referenceNo}}): Additional Verification Needed for {{jobTitle}}',
    body: 'Dear {{candidateName}},\n\nDuring preliminary scrutiny of your application ({{referenceNo}}) for {{jobTitle}}, the HR Recruitment Unit noted the following requirement:\n\n"{{remark}}"\n\nPlease sign in to the CEB Job Portal and upload a clear JP-certified PDF copy before the specified deadline.',
    footerDisclaimer:
      'Applications with unverified scans will not proceed to technical eligibility scoring under the SOR.',
    lastUpdated: '2026-11-20',
  },
  {
    id: 'tpl-shortlisted',
    eventKey: 'SHORTLISTED_CALL_LETTER',
    title: 'Written Exam / Interview Call Letter',
    triggerStatus: 'Shortlisted',
    channels: { email: true, sms: true, portalAlert: true },
    subject: 'Official Call Letter ({{referenceNo}}): Shortlisted for {{jobTitle}}',
    body: 'Dear {{candidateName}},\n\nCongratulations. Your application ({{referenceNo}}) for {{jobTitle}} ({{division}}) has been shortlisted.\n\nPlease log in to "My Applications" on the CEB Job Portal to download and print your official Written Aptitude / Interview Call Letter scheduled for {{date}}.',
    footerDisclaimer:
      'Bring your original NIC and original academic certificates to the examination/interview venue.',
    lastUpdated: '2026-11-22',
  },
  {
    id: 'tpl-approved',
    eventKey: 'BOARD_APPROVED',
    title: 'Director Board Approval & Offer Dispatch',
    triggerStatus: 'Approved',
    channels: { email: true, sms: false, portalAlert: true },
    subject: 'Appointment Approval Notice ({{referenceNo}}) — Ceylon Electricity Board',
    body: 'Dear {{candidateName}},\n\nWe are pleased to inform you that the CEB Board of Directors has approved your selection for the post of {{jobTitle}} ({{division}}) under reference {{referenceNo}}.\n\nYour formal appointment offer letter is being dispatched via registered post and official email.',
    footerDisclaimer:
      'Recruitment & Selection Branch, Ceylon Electricity Board Head Office, Colombo 02.',
    lastUpdated: '2026-11-24',
  },
];

export type AuditCategory = 'AUTH' | 'RECRUITMENT' | 'USER_ADMIN' | 'SYSTEM';
export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  category: AuditCategory;
  severity: AuditSeverity;
  ipAddress: string;
  details: string;
}

export const MOCK_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'usr-adm-01',
    name: 'Chaminda Rathnayake',
    email: 'admin@ceb.lk',
    role: 'ADMIN',
    department: 'IT & Digital Transformation',
    status: 'Active',
    lastActive: '2026-11-25 04:15 PM',
    createdAt: '2025-01-12',
  },
  {
    id: 'usr-hr-01',
    name: 'Nimali Senanayake',
    email: 'hr@ceb.lk',
    role: 'HR',
    department: 'Human Resources Division',
    status: 'Active',
    lastActive: '2026-11-25 03:48 PM',
    createdAt: '2025-02-04',
  },
  {
    id: 'usr-hr-02',
    name: 'Tharindu Jayawardena',
    email: 'tharindu.hr@ceb.lk',
    role: 'HR',
    department: 'Human Resources Division',
    status: 'Active',
    lastActive: '2026-11-25 11:20 AM',
    createdAt: '2025-06-18',
  },
  {
    id: 'usr-dir-01',
    name: 'Eng. Priyantha Silva',
    email: 'director@ceb.lk',
    role: 'DIRECTOR',
    department: 'Board of Directors',
    status: 'Active',
    lastActive: '2026-11-25 01:05 PM',
    createdAt: '2025-01-20',
  },
  {
    id: 'usr-dir-02',
    name: 'Dr. Malini Perera',
    email: 'malini.board@ceb.lk',
    role: 'DIRECTOR',
    department: 'Board of Directors',
    status: 'Active',
    lastActive: '2026-11-24 05:30 PM',
    createdAt: '2025-03-11',
  },
  {
    id: 'usr-app-01',
    name: 'Chamalka Ekanayaka',
    email: 'applicant@ceb.lk',
    role: 'APPLICANT',
    department: 'External Candidate',
    status: 'Active',
    lastActive: '2026-11-25 04:02 PM',
    createdAt: '2026-11-02',
  },
  {
    id: 'usr-app-02',
    name: 'Nuwan Wickramasinghe',
    email: 'nuwan.w@gmail.com',
    role: 'APPLICANT',
    department: 'External Candidate',
    status: 'Active',
    lastActive: '2026-11-24 08:14 PM',
    createdAt: '2026-11-08',
  },
  {
    id: 'usr-app-03',
    name: 'Suresh Karunaratne',
    email: 'suresh.k92@yahoo.com',
    role: 'APPLICANT',
    department: 'External Candidate',
    status: 'Suspended',
    lastActive: '2026-11-19 10:42 AM',
    createdAt: '2026-11-06',
  },
];

export const MOCK_DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'dept-1',
    code: 'TRN-01',
    name: 'Transmission Division',
    headOfDivision: 'Eng. R. M. Wickramasuriya',
    assignedHrCoordinator: 'Nimali Senanayake',
    location: 'Head Office, Colombo 02',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-2',
    code: 'GEN-02',
    name: 'Generation Division',
    headOfDivision: 'Eng. S. Abeysekara',
    assignedHrCoordinator: 'Tharindu Jayawardena',
    location: 'Laxapana & Hydro Complex',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-3',
    code: 'DST-03',
    name: 'Distribution Division',
    headOfDivision: 'Eng. K. Gunawardena',
    assignedHrCoordinator: 'Nimali Senanayake',
    location: 'Regional Operations (Colombo / Kandy)',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-4',
    code: 'ITD-04',
    name: 'Information Technology Division',
    headOfDivision: 'Eng. D. Rajapaksha',
    assignedHrCoordinator: 'Tharindu Jayawardena',
    location: 'Colombo 02',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-5',
    code: 'FIN-05',
    name: 'Finance Division',
    headOfDivision: 'Mrs. A. Fernando',
    assignedHrCoordinator: 'Nimali Senanayake',
    location: 'Head Office, Colombo 02',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-6',
    code: 'HRD-06',
    name: 'Human Resources Division',
    headOfDivision: 'Mrs. Nimali Senanayake',
    assignedHrCoordinator: 'Nimali Senanayake',
    location: 'Head Office, Colombo 02',
    status: 'Active',
    openVacancies: 0,
  },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-101',
    timestamp: '2026-11-25 16:05:12',
    actorName: 'Chaminda Rathnayake',
    actorRole: 'ADMIN',
    action: 'Exported Recruitment Audit Report',
    target: 'Cycle 2026/2027 Compliance Ledger',
    category: 'SYSTEM',
    severity: 'INFO',
    ipAddress: '10.24.18.42',
    details: 'Generated monthly governance snapshot across 6 CEB divisions.',
  },
  {
    id: 'aud-102',
    timestamp: '2026-11-25 15:22:40',
    actorName: 'Nimali Senanayake',
    actorRole: 'HR',
    action: 'Requested Further Information',
    target: 'Application CEB-2026-CE12',
    category: 'RECRUITMENT',
    severity: 'INFO',
    ipAddress: '10.24.12.19',
    details: 'Marked degree scan for JP-certified re-upload prior to eligibility scoring.',
  },
  {
    id: 'aud-103',
    timestamp: '2026-11-25 13:10:04',
    actorName: 'Eng. Priyantha Silva',
    actorRole: 'DIRECTOR',
    action: 'Board Approval Granted',
    target: 'Application CEB-2026-FN02',
    category: 'RECRUITMENT',
    severity: 'INFO',
    ipAddress: '10.24.5.101',
    details: 'Approved final recommendation for Accountant (Financial Management & Audit).',
  },
  {
    id: 'aud-104',
    timestamp: '2026-11-25 10:48:33',
    actorName: 'Chaminda Rathnayake',
    actorRole: 'ADMIN',
    action: 'Suspended User Account',
    target: 'suresh.k92@yahoo.com',
    category: 'USER_ADMIN',
    severity: 'CRITICAL',
    ipAddress: '10.24.18.42',
    details: 'Account temporarily suspended following duplicate NIC submission alert.',
  },
  {
    id: 'aud-105',
    timestamp: '2026-11-24 17:19:50',
    actorName: 'Tharindu Jayawardena',
    actorRole: 'HR',
    action: 'Shortlisted Candidate',
    target: 'Application CEB-2026-IT09',
    category: 'RECRUITMENT',
    severity: 'INFO',
    ipAddress: '10.24.12.24',
    details: 'Issued Written Aptitude & Practical Evaluation call letter for 10th Dec 2026.',
  },
  {
    id: 'aud-106',
    timestamp: '2026-11-24 09:03:17',
    actorName: 'Unknown Client',
    actorRole: 'APPLICANT',
    action: 'Multiple Failed Login Attempts (5x)',
    target: 'hr@ceb.lk',
    category: 'AUTH',
    severity: 'WARNING',
    ipAddress: '192.168.44.87',
    details: 'Rate limiter triggered temporary 15-minute cooldown after 5 invalid password attempts.',
  },
  {
    id: 'aud-107',
    timestamp: '2026-11-23 14:40:09',
    actorName: 'Chaminda Rathnayake',
    actorRole: 'ADMIN',
    action: 'Updated Division Metadata',
    target: 'Information Technology Division (ITD-04)',
    category: 'SYSTEM',
    severity: 'INFO',
    ipAddress: '10.24.18.42',
    details: 'Updated Head of Division record and enabled Smart Grid recruitment quota.',
  },
  {
    id: 'aud-108',
    timestamp: '2026-11-22 11:15:26',
    actorName: 'Nimali Senanayake',
    actorRole: 'HR',
    action: 'Published Job Vacancy',
    target: 'CEB-REC-2026-005 (Electrical Superintendent)',
    category: 'RECRUITMENT',
    severity: 'INFO',
    ipAddress: '10.24.12.19',
    details: 'Vacancy published to external Applicant Portal with closing date 2026-12-30.',
  },
];

export const MOCK_ADMIN_ACTIVITY_SERIES = [
  { day: 'Nov 19', submissions: 18, reviews: 12 },
  { day: 'Nov 20', submissions: 24, reviews: 16 },
  { day: 'Nov 21', submissions: 19, reviews: 21 },
  { day: 'Nov 22', submissions: 31, reviews: 19 },
  { day: 'Nov 23', submissions: 27, reviews: 24 },
  { day: 'Nov 24', submissions: 35, reviews: 28 },
  { day: 'Nov 25', submissions: 29, reviews: 26 },
];

export const MOCK_HR_APPLICATIONS: HrApplication[] = [
  {
    id: 'hr-app-101',
    referenceNo: 'CEB-2026-EE04',
    candidateName: 'Chamalka Ekanayaka',
    candidateNic: '199724501892',
    candidateEmail: 'applicant@ceb.lk',
    candidatePhone: '+94 77 458 9210',
    age: 29,
    gender: 'Female',
    district: 'Colombo',
    vacancyId: 'vac-1',
    jobCode: 'CEB-REC-2026-001',
    jobTitle: 'Electrical Engineer (Transmission & Grid Planning)',
    department: 'Transmission Division',
    appliedDate: '2026-11-16',
    status: 'Under HR Review',
    statusRemark: 'Documents verified by preliminary scrutiny committee; awaiting technical eligibility scoring.',
    educationSummary: 'B.Sc. Eng (Hons) in Electrical Eng (UoM), IESL Associate Member (AMIE-SL)',
    experienceYears: 3,
    documents: [
      { id: 'd-1', name: 'CV_Chamalka_Ekanayaka_2026.pdf', type: 'CV', status: 'Verified', size: '1.2 MB' },
      { id: 'd-2', name: 'Degree_Certificate_IESL.pdf', type: 'Educational', status: 'Verified', size: '2.4 MB' },
      { id: 'd-3', name: 'NIC_Copy.pdf', type: 'Identity', status: 'Verified', size: '850 KB' },
    ],
  },
  {
    id: 'hr-app-102',
    referenceNo: 'CEB-2026-EE08',
    candidateName: 'Kaveen Jayasinghe',
    candidateNic: '199611204891',
    candidateEmail: 'kaveen.j@gmail.com',
    candidatePhone: '+94 71 884 1290',
    age: 30,
    gender: 'Male',
    district: 'Gampaha',
    vacancyId: 'vac-1',
    jobCode: 'CEB-REC-2026-001',
    jobTitle: 'Electrical Engineer (Transmission & Grid Planning)',
    department: 'Transmission Division',
    appliedDate: '2026-11-15',
    status: 'Eligible',
    statusRemark: 'Educational & field experience criteria fully satisfied. Qualified for Written Competitive Examination.',
    educationSummary: 'B.Sc. Eng (Hons) Electrical & Electronic (University of Peradeniya), AMIE-SL',
    experienceYears: 4,
    documents: [
      { id: 'd-4', name: 'Kaveen_Resume.pdf', type: 'CV', status: 'Verified', size: '1.5 MB' },
      { id: 'd-5', name: 'Peradeniya_Eng_Degree.pdf', type: 'Educational', status: 'Verified', size: '3.1 MB' },
      { id: 'd-6', name: 'IESL_Membership_Card.pdf', type: 'Professional', status: 'Verified', size: '920 KB' },
    ],
  },
  {
    id: 'hr-app-103',
    referenceNo: 'CEB-2026-EE14',
    candidateName: 'Dilini Samaranayake',
    candidateNic: '198758902144',
    candidateEmail: 'dilini.sam@yahoo.com',
    candidatePhone: '+94 76 331 4500',
    age: 39,
    gender: 'Female',
    district: 'Kalutara',
    vacancyId: 'vac-1',
    jobCode: 'CEB-REC-2026-001',
    jobTitle: 'Electrical Engineer (Transmission & Grid Planning)',
    department: 'Transmission Division',
    appliedDate: '2026-11-17',
    status: 'Ineligible',
    statusRemark: 'Application rejected due to exceeding maximum age limit specified in Gazette/SOR (Max 35 years).',
    ineligibleReason: 'Over age limit (Candidate is 39 years old as of closing date; limit is 35 years)',
    educationSummary: 'B.Sc. Eng in Electrical Engineering (OUSL)',
    experienceYears: 11,
    documents: [
      { id: 'd-7', name: 'Dilini_CV.pdf', type: 'CV', status: 'Verified', size: '1.1 MB' },
      { id: 'd-8', name: 'NIC_Front_Back.pdf', type: 'Identity', status: 'Rejected', size: '1.0 MB' },
    ],
  },
  {
    id: 'hr-app-104',
    referenceNo: 'CEB-2026-IT09',
    candidateName: 'Nuwan Bandara',
    candidateNic: '199814402911',
    candidateEmail: 'nuwan.bandara@outlook.com',
    candidatePhone: '+94 77 912 3456',
    age: 28,
    gender: 'Male',
    district: 'Kandy',
    vacancyId: 'vac-3',
    jobCode: 'CEB-REC-2026-003',
    jobTitle: 'Systems & Network Engineer (Smart Grid Operations)',
    department: 'Information Technology Division',
    appliedDate: '2026-11-12',
    status: 'Shortlisted',
    statusRemark: 'Written examination completed with 78/100. Call letter issued for Technical Interview.',
    educationSummary: 'B.Sc. in Computer Systems & Networking (SLIIT), CCNA & RHCSA certified',
    experienceYears: 3,
    documents: [
      { id: 'd-9', name: 'Nuwan_CV_2026.pdf', type: 'CV', status: 'Verified', size: '1.4 MB' },
      { id: 'd-10', name: 'Degree_SLIIT.pdf', type: 'Educational', status: 'Verified', size: '2.0 MB' },
      { id: 'd-11', name: 'CCNA_Cert.pdf', type: 'Professional', status: 'Verified', size: '800 KB' },
    ],
    callLetter: {
      type: 'Technical Viva & Interview',
      date: '2026-12-10',
      time: '09:30 AM – 12:00 PM',
      venue: 'CEB Training Centre, Castlereagh Auditorium, Colombo 02',
      indexNo: 'CEB-IT-2026-042',
      instructions: [
        'Bring original National Identity Card and degree certificates.',
        'Present original CCNA/RHCSA certification credentials.',
      ],
    },
    examMarks: 78,
    interviewMarks: 82,
    meritRank: 2,
  },
  {
    id: 'hr-app-105',
    referenceNo: 'CEB-2026-IT15',
    candidateName: 'Rasika Senaratne',
    candidateNic: '199528901234',
    candidateEmail: 'rasika.s@gmail.com',
    candidatePhone: '+94 70 234 5678',
    age: 31,
    gender: 'Male',
    district: 'Colombo',
    vacancyId: 'vac-3',
    jobCode: 'CEB-REC-2026-003',
    jobTitle: 'Systems & Network Engineer (Smart Grid Operations)',
    department: 'Information Technology Division',
    appliedDate: '2026-11-11',
    status: 'Shortlisted',
    statusRemark: 'Highest scorer in Written Aptitude Test (86/100). Interview conducted.',
    educationSummary: 'B.Sc. (Hons) in Computer Science (UCSC), CCNP Enterprise, AWS Solutions Architect',
    experienceYears: 4,
    documents: [
      { id: 'd-12', name: 'Rasika_CV.pdf', type: 'CV', status: 'Verified', size: '1.6 MB' },
      { id: 'd-13', name: 'UCSC_Degree_Cert.pdf', type: 'Educational', status: 'Verified', size: '2.8 MB' },
    ],
    examMarks: 86,
    interviewMarks: 88,
    meritRank: 1,
  },
  {
    id: 'hr-app-106',
    referenceNo: 'CEB-2026-CE12',
    candidateName: 'Manjula Wickramasinghe',
    candidateNic: '199620503412',
    candidateEmail: 'manjula.w@live.com',
    candidatePhone: '+94 77 123 9876',
    age: 30,
    gender: 'Male',
    district: 'Nuwara Eliya',
    vacancyId: 'vac-2',
    jobCode: 'CEB-REC-2026-002',
    jobTitle: 'Assistant Civil Engineer (Hydro Generation Projects)',
    department: 'Generation Division',
    appliedDate: '2026-11-14',
    status: 'Requires Further Information',
    statusRemark: 'Uploaded Civil Engineering degree copy lacks clear JP certification stamp.',
    requestedDocLabel: 'Certified B.Sc. Civil Engineering Degree Certificate (PDF)',
    requestedInfoNote: 'The uploaded degree scan lacks the Justice of the Peace (JP) certification seal. Please upload a clear certified true copy before 2026-12-05.',
    educationSummary: 'B.Sc. in Civil Engineering (University of Ruhuna)',
    experienceYears: 2,
    documents: [
      { id: 'd-14', name: 'Manjula_CV.pdf', type: 'CV', status: 'Verified', size: '1.2 MB' },
      { id: 'd-15', name: 'Civil_Degree_Uncertified.pdf', type: 'Educational', status: 'Under Review', size: '1.9 MB' },
    ],
  },
  {
    id: 'hr-app-107',
    referenceNo: 'CEB-2026-FN02',
    candidateName: 'Anusha Fernando',
    candidateNic: '199468903120',
    candidateEmail: 'anusha.f@ceb.lk',
    candidatePhone: '+94 71 456 7890',
    age: 32,
    gender: 'Female',
    district: 'Kurunegala',
    vacancyId: 'vac-4',
    jobCode: 'CEB-REC-2026-004',
    jobTitle: 'Accountant (Financial Management & Audit)',
    department: 'Finance Division',
    appliedDate: '2026-11-05',
    status: 'Forwarded to Director Board',
    statusRemark: 'Ranked #1 in Finance Division interview. Final recruitment docket submitted for Director Board approval.',
    educationSummary: 'B.Sc. Accountancy (Sp.) (USJ), Associate Member of CA Sri Lanka (ACA)',
    experienceYears: 5,
    documents: [
      { id: 'd-16', name: 'Anusha_Resume_Finance.pdf', type: 'CV', status: 'Verified', size: '1.3 MB' },
      { id: 'd-17', name: 'CA_Membership_Certificate.pdf', type: 'Professional', status: 'Verified', size: '1.5 MB' },
      { id: 'd-18', name: 'USJ_Degree_Cert.pdf', type: 'Educational', status: 'Verified', size: '2.1 MB' },
    ],
    examMarks: 84,
    interviewMarks: 90,
    meritRank: 1,
    hrRemarks: 'Highly recommended by HR Interview Committee. Demonstrates in-depth knowledge of LKAS/SLFRS public finance standards.',
  },
  {
    id: 'hr-app-108',
    referenceNo: 'CEB-2026-DS06',
    candidateName: 'Thilina Perera',
    candidateNic: '199924508976',
    candidateEmail: 'thilina.p@gmail.com',
    candidatePhone: '+94 78 554 2130',
    age: 27,
    gender: 'Male',
    district: 'Matale',
    vacancyId: 'vac-5',
    jobCode: 'CEB-REC-2026-005',
    jobTitle: 'Electrical Superintendent (Distribution Operations)',
    department: 'Distribution Division',
    appliedDate: '2026-11-20',
    status: 'Submitted',
    statusRemark: 'Newly received application. Pending preliminary document scrutiny.',
    educationSummary: 'NDT in Electrical Engineering (Institute of Technology, University of Moratuwa)',
    experienceYears: 3,
    documents: [
      { id: 'd-19', name: 'Thilina_NDT_CV.pdf', type: 'CV', status: 'Pending', size: '1.1 MB' },
      { id: 'd-20', name: 'NDT_Diploma_Copy.pdf', type: 'Educational', status: 'Pending', size: '2.2 MB' },
    ],
  },
  {
    id: 'hr-app-109',
    referenceNo: 'CEB-2026-FN05',
    candidateName: 'Lasith Karunaratne',
    candidateNic: '199318902567',
    candidateEmail: 'lasith.k@yahoo.com',
    candidatePhone: '+94 77 654 3210',
    age: 33,
    gender: 'Male',
    district: 'Colombo',
    vacancyId: 'vac-4',
    jobCode: 'CEB-REC-2026-004',
    jobTitle: 'Accountant (Financial Management & Audit)',
    department: 'Finance Division',
    appliedDate: '2026-11-08',
    status: 'Approved',
    statusRemark: 'Appointment confirmed by Director Board. Official offer letter dispatched via registered post.',
    educationSummary: 'B.Com (Sp.) (University of Kelaniya), ACMA, CGMA (CIMA UK)',
    experienceYears: 6,
    documents: [
      { id: 'd-21', name: 'Lasith_CIMA_CV.pdf', type: 'CV', status: 'Verified', size: '1.4 MB' },
      { id: 'd-22', name: 'CIMA_Certificate.pdf', type: 'Professional', status: 'Verified', size: '1.2 MB' },
    ],
    examMarks: 80,
    interviewMarks: 85,
    meritRank: 2,
    boardRemarks: 'Director Board ratified appointment during Board Meeting #412.',
  },
];
