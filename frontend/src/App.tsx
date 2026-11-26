import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ApplicantDashboard } from './pages/applicant/ApplicantDashboard';
import { ExploreVacanciesPage } from './pages/applicant/ExploreVacanciesPage';
import { MyApplicationsPage } from './pages/applicant/MyApplicationsPage';
import { CandidateProfilePage } from './pages/applicant/CandidateProfilePage';
import { PlaceholderDashboard } from './components/PlaceholderDashboard';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { DepartmentSettingsPage } from './pages/admin/DepartmentSettingsPage';
import { HrDashboardPage } from './pages/hr/HrDashboardPage';
import { HrVacanciesPage } from './pages/hr/HrVacanciesPage';
import { HrApplicationsReviewPage } from './pages/hr/HrApplicationsReviewPage';
import { HrShortlistPage } from './pages/hr/HrShortlistPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Applicant Portal — persistent DashboardLayout via Outlet */}
          <Route element={<DashboardLayout />}>
            <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
            <Route path="/applicant/vacancies" element={<ExploreVacanciesPage />} />
            <Route path="/applicant/applications" element={<MyApplicationsPage />} />
            <Route path="/applicant/profile" element={<CandidateProfilePage />} />
          </Route>

          {/* HR Portal — persistent DashboardLayout via Outlet */}
          <Route element={<DashboardLayout />}>
            <Route path="/hr/dashboard" element={<HrDashboardPage />} />
            <Route path="/hr/vacancies" element={<HrVacanciesPage />} />
            <Route path="/hr/applications" element={<HrApplicationsReviewPage />} />
            <Route path="/hr/shortlist" element={<HrShortlistPage />} />
          </Route>
          <Route
            path="/director/dashboard"
            element={
              <PlaceholderDashboard
                title="Director Board Evaluation Portal"
                subtitle="Review shortlisted applications, inspect CV/supporting documents, grant approval/rejection with remarks."
                roleTag="Director Board View"
              />
            }
          />
          {/* Admin Portal — persistent DashboardLayout via Outlet */}
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/departments" element={<DepartmentSettingsPage />} />
          </Route>

          {/* Default redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
