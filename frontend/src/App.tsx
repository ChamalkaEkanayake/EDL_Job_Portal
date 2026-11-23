import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { PlaceholderDashboard } from './components/PlaceholderDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Placeholders for 4 Role Dashboards (to be implemented next) */}
          <Route
            path="/applicant/dashboard"
            element={
              <PlaceholderDashboard
                title="Applicant Portal & Dashboard"
                subtitle="Here the applicant can browse vacancies, submit applications, upload CVs, and track application progress."
                roleTag="Applicant View"
              />
            }
          />
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
