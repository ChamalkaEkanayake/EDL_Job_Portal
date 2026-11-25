import type { JobVacancy, ApplicationStatus } from '../types';

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
    documentsSubmitted: ['CV_Kasun_Bandara_2026.pdf', 'Degree_Certificate_IESL.pdf', 'NIC_Copy.pdf'],
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
    documentsSubmitted: ['CV_Kasun_Bandara_2026.pdf', 'CCNA_Certificate.pdf', 'Degree_Transcript.pdf'],
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
    documentsSubmitted: ['CV_Kasun_Bandara_2026.pdf', 'Civil_Degree_Scan.pdf', 'NIC_Copy.pdf'],
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
      'CV_Kasun_Bandara_2026.pdf',
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
