export type UserRole = 'APPLICANT' | 'HR' | 'DIRECTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Under HR Review'
  | 'Requires Further Information'
  | 'Eligible'
  | 'Ineligible'
  | 'Shortlisted'
  | 'Forwarded to Director Board'
  | 'Approved'
  | 'Rejected';

export interface JobVacancy {
  id: string;
  jobCode: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Contract' | 'Permanent';
  vacanciesCount: number;
  closingDate: string;
  description: string;
  qualifications: string[];
  requirements: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt: string;
}

export interface HrDocumentItem {
  id: string;
  name: string;
  type: string;
  status: 'Verified' | 'Under Review' | 'Pending' | 'Rejected';
  size: string;
}

export interface HrApplication {
  id: string;
  referenceNo: string;
  candidateName: string;
  candidateNic: string;
  candidateEmail: string;
  candidatePhone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  district: string;
  vacancyId: string;
  jobCode: string;
  jobTitle: string;
  department: string;
  appliedDate: string;
  status: ApplicationStatus;
  statusRemark?: string;
  ineligibleReason?: string;
  requestedDocLabel?: string;
  requestedInfoNote?: string;
  educationSummary: string;
  experienceYears: number;
  documents: HrDocumentItem[];
  callLetter?: {
    type: string;
    date: string;
    time: string;
    venue: string;
    indexNo?: string;
    instructions?: string[];
  };
  examMarks?: number;
  interviewMarks?: number;
  meritRank?: number;
  hrRemarks?: string;
  boardRemarks?: string;
}
