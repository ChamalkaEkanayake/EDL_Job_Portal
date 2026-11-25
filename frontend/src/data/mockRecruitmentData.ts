import type { JobVacancy, ApplicationStatus, UserRole } from '../types';

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
  location: string;
  status: 'Active' | 'Inactive';
  openVacancies: number;
}

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
    location: 'Head Office, Colombo 02',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-2',
    code: 'GEN-02',
    name: 'Generation Division',
    headOfDivision: 'Eng. S. Abeysekara',
    location: 'Laxapana & Hydro Complex',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-3',
    code: 'DST-03',
    name: 'Distribution Division',
    headOfDivision: 'Eng. K. Gunawardena',
    location: 'Regional Operations (Colombo / Kandy)',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-4',
    code: 'ITD-04',
    name: 'Information Technology Division',
    headOfDivision: 'Eng. D. Rajapaksha',
    location: 'Colombo 02',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-5',
    code: 'FIN-05',
    name: 'Finance Division',
    headOfDivision: 'Mrs. A. Fernando',
    location: 'Head Office, Colombo 02',
    status: 'Active',
    openVacancies: 1,
  },
  {
    id: 'dept-6',
    code: 'HRD-06',
    name: 'Human Resources Division',
    headOfDivision: 'Mrs. Nimali Senanayake',
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
