import type { JobVacancy, ApplicationStatus } from '../types';

export interface ApplicantApplication {
  id: string;
  referenceNo: string;
  vacancyId: string;
  jobTitle: string;
  department: string;
  location: string;
  appliedDate: string;
  status: ApplicationStatus;
  statusRemark?: string;
  currentStepIndex: number; // 0 to 4
  documentsSubmitted: string[];
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
    jobTitle: 'Electrical Engineer (Transmission & Grid Planning)',
    department: 'Transmission Division',
    location: 'Colombo / Substation Networks',
    appliedDate: '2026-11-16',
    status: 'Under HR Review',
    statusRemark: 'Documents verified by preliminary scrutiny committee; awaiting technical eligibility scoring.',
    currentStepIndex: 1, // 0: Submitted, 1: HR Review, 2: Shortlisted, 3: Board Review, 4: Approved
    documentsSubmitted: ['CV_Kasun_Bandara_2026.pdf', 'Degree_Certificate_IESL.pdf', 'NIC_Copy.pdf'],
  },
  {
    id: 'app-102',
    referenceNo: 'CEB-2026-IT09',
    vacancyId: 'vac-3',
    jobTitle: 'Systems & Network Engineer (Smart Grid Operations)',
    department: 'Information Technology Division',
    location: 'Colombo',
    appliedDate: '2026-11-12',
    status: 'Shortlisted',
    statusRemark: 'Shortlisted for Written Aptitude & Practical Evaluation scheduled for 10th Dec 2026.',
    currentStepIndex: 2,
    documentsSubmitted: ['CV_Kasun_Bandara_2026.pdf', 'CCNA_Certificate.pdf', 'Degree_Transcript.pdf'],
  },
];
