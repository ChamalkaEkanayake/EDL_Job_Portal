import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ApplicantDashboard } from './pages/applicant/ApplicantDashboard';
import { ExploreVacanciesPage } from './pages/applicant/ExploreVacanciesPage';
import { PlaceholderDashboard } from './components/PlaceholderDashboard';
import { DashboardLayout } from './components/layout/DashboardLayout';

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
            <Route path="/applicant/applications" element={<ApplicantDashboard />} />
            <Route path="/applicant/profile" element={<ApplicantDashboard />} />
          </Route>

          <Route
            path="/hr/dashboard"
            element={
              <PlaceholderDashboard
                title="HR & Recruitment Management Dashboard"
                subtitle="Manage vacancies, evaluate candidate applications, eligibility checks, and shortlist candidates."
                roleTag="HR Staff View"
              />
            }
          />
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
          <Route
            path="/admin/dashboard"
            element={
              <PlaceholderDashboard
                title="System Administration & Audit Console"
                subtitle="Manage user accounts, assign role permissions, configure departments, and review audit logs."
                roleTag="System Admin View"
              />
            }
          />

          {/* Default redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
