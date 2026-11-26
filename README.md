# CEB Job & Recruitment Portal (`EDL_Job_Portal`)

A modern, enterprise web-based recruitment and job management platform designed for the **Ceylon Electricity Board (CEB)**. The portal streamlines the full public-sector recruitment lifecycle—from vacancy publication and online applications to HR preliminary scrutiny, exam/interview shortlisting, Director Board ratification, and system-wide governance.

---

## Key Features & Role Portals

### 1. Public Authentication (`/login`, `/register`)
- **Unified Portal Login (`LoginPage.tsx`):** Automatic role detection, quick demo sign-in buttons for all 4 roles, and live enforcement of suspended accounts and Maintenance Mode.
- **Applicant Registration (`RegisterPage.tsx`):** Candidate self-registration (`APPLICANT`) with NIC/mobile capture, live registration toggle enforcement, and automatic audit logging.

### 2. Applicant Portal (`/applicant/*`)
- **Applicant Overview (`/applicant/dashboard`):** Live admin announcement banner, rotating CEB Recruitment Guidelines & SOR carousel, application metrics, 5-step progress tracker, and quick vacancy overview.
- **Explore Vacancies (`/applicant/vacancies`):** Searchable vacancy directory with division & employment-type filters and a 3-step application modal (`Details` → `Apply` → `Confirmation`).
- **My Applications (`/applicant/applications`):** Status filter tabs across all 9 recruitment statuses, vertical audit timeline modal, early-stage withdrawal, missing-document resubmission (`Requires Further Information`), and printable exam/interview call letters.
- **My Candidate Profile (`/applicant/profile`):** Dynamic profile completeness meter, Personal Details, Education & Qualifications CRUD, Work Experience CRUD, Reusable Document Vault (enforcing Admin-configured file limits), and password settings.

### 3. HR & Recruitment Portal (`/hr/*`)
- **HR Dashboard (`/hr/dashboard`):** Live recruitment KPIs, pipeline & division charts (`Recharts`), and recent candidate activity.
- **Vacancy Management (`/hr/vacancies`):** Create, edit, publish (`DRAFT` → `PUBLISHED`), and close (`CLOSED`) CEB vacancies with audit trail tracking.
- **Review Applications (`/hr/applications`):** Preliminary Scheme of Recruitment (SOR) scrutiny, document verification, and status updates (`Eligible`, `Ineligible` with reason, `Requires Further Information`).
- **Shortlisting & Board Forwarding (`/hr/shortlist`):** Written exam & interview mark entry, merit ranking, call letter dispatch, and forwarding recommendation dockets to the Director Board.

### 4. Director Board Portal (`/director/*`)
- **Board Dashboard (`/director/dashboard`):** Live board-stage KPIs, division selection chart (`Recharts`), and merit-ranked priority dockets awaiting decision.
- **Shortlisted Applications (`/director/shortlisted`):** Searchable merit table and `DirectorEvaluationModal` displaying candidate dossiers, score breakdowns (`/200`), verified supporting documents, HR panel memos, and **Approve Appointment / Reject Candidate** actions with confirmation and remarks.
- **Approvals & Remarks (`/director/approvals`):** Final Board decision ledger, CSV export, and printable Official Board Recruitment Resolution records.

### 5. System Admin Portal (`/admin/*`)
- **Admin Console (`/admin/dashboard`):** Live system KPIs, 7-day recruitment & review activity chart (`Recharts`), role distribution breakdown, portal policy indicators, and searchable System Audit Trail with CSV export and event inspector modal.
- **User & Role Management (`/admin/users`):** Provision internal `HR`, `DIRECTOR`, and `ADMIN` accounts, edit roles & division assignments, suspend/reactivate accounts, and view the RBAC Role Permissions Matrix.
- **Department & Portal Settings (`/admin/departments`):**
  - **CEB Divisions Directory:** Add, edit, activate/deactivate divisions, and assign HR coordinators.
  - **Portal Configuration:** Configure active recruitment cycle, max upload size (`2/5/10 MB`), allowed file formats, session idle timeout, registration/alert/maintenance toggles, and global portal announcement notice.
  - **Notification & Email Templates:** Customize Email/SMS/Portal notification templates with dynamic tokens (`{{candidateName}}`, `{{referenceNo}}`, etc.) and live rendered preview.

---

## Application Lifecycle (9 Statuses)

```text
Submitted
   │
   ▼
Under HR Review
   ├──► Requires Further Information ──► (Candidate re-uploads docs) ──► Under HR Review
   ├──► Ineligible
   └──► Eligible
           │
           ▼
       Shortlisted (Exam / Interview Call Letter issued)
           │
           ▼
       Forwarded to Director Board
           ├──► Approved
           └──► Rejected
```

---

## Tech Stack (Frontend)

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v3.4
- **Routing:** React Router DOM v7 (with persistent `<Outlet />` layout shell in `DashboardLayout.tsx`)
- **Icons & Charts:** Lucide React, Recharts
- **HTTP Client:** Axios (ready for future backend API integration)
- **Persistence (Frontend Demo):** Shared `localStorage` state layer (`src/utils/portalStorage.ts`) syncing live changes across Applicant, HR, Director Board, and Admin portals.

---

## Project Structure

```text
EDL_Job_Portal/
├── README.md
└── frontend/
    ├── package.json
    └── src/
        ├── App.tsx                             # Route configuration & persistent layouts
        ├── components/
        │   ├── common/                         # Branding logo components
        │   ├── director/                       # DirectorEvaluationModal
        │   └── layout/                         # DashboardLayout (hover-expand sidebar) & NotificationModal
        ├── contexts/
        │   └── AuthContext.tsx                 # Mock auth, live suspension & maintenance enforcement
        ├── data/
        │   └── mockRecruitmentData.ts          # Vacancies, applications, users, divisions, templates, audit logs
        ├── pages/
        │   ├── public/                         # LoginPage, RegisterPage
        │   ├── applicant/                      # ApplicantDashboard, ExploreVacanciesPage, MyApplicationsPage, CandidateProfilePage
        │   ├── hr/                             # HrDashboardPage, HrVacanciesPage, HrApplicationsReviewPage, HrShortlistPage
        │   ├── director/                       # DirectorDashboardPage, DirectorShortlistedPage, DirectorApprovalsPage
        │   └── admin/                          # AdminDashboard, UserManagementPage, DepartmentSettingsPage
        ├── types/
        │   └── index.ts                        # Shared TypeScript interfaces & status unions
        └── utils/
            └── portalStorage.ts                # Shared localStorage helpers & appendAuditLog
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

### Build & Lint

```bash
cd frontend
npm run build   # Runs TypeScript check (tsc -b) + Vite production build
npm run lint    # Runs oxlint
```

---

## Quick Demo Accounts

Use the **Quick Test Logins** on `/login` or sign in with the following mock emails (any non-empty password):

| Role | Email | Default User |
|---|---|---|
| **Job Applicant** | `applicant@ceb.lk` | Chamalka Ekanayaka |
| **HR / Recruitment Staff** | `hr@ceb.lk` | Nimali Senanayake |
| **Director Board Member** | `director@ceb.lk` | Eng. Priyantha Silva |
| **System Administrator** | `admin@ceb.lk` | Chaminda Rathnayake |
