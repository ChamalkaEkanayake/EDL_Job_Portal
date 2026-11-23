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
