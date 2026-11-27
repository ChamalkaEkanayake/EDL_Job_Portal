import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ApplicantDashboard } from './pages/applicant/ApplicantDashboard';
import { ExploreVacanciesPage } from './pages/applicant/ExploreVacanciesPage';
import { MyApplicationsPage } from './pages/applicant/MyApplicationsPage';
import { CandidateProfilePage } from './pages/applicant/CandidateProfilePage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { DepartmentSettingsPage } from './pages/admin/DepartmentSettingsPage';
import { HrDashboardPage } from './pages/hr/HrDashboardPage';
import { HrVacanciesPage } from './pages/hr/HrVacanciesPage';
import { HrApplicationsReviewPage } from './pages/hr/HrApplicationsReviewPage';
import { HrShortlistPage } from './pages/hr/HrShortlistPage';
import { DirectorDashboardPage } from './pages/director/DirectorDashboardPage';
import { DirectorShortlistedPage } from './pages/director/DirectorShortlistedPage';
import { DirectorApprovalsPage } from './pages/director/DirectorApprovalsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Applicant Portal — protected + persistent DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['APPLICANT']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
              <Route path="/applicant/vacancies" element={<ExploreVacanciesPage />} />
              <Route path="/applicant/applications" element={<MyApplicationsPage />} />
              <Route path="/applicant/profile" element={<CandidateProfilePage />} />
            </Route>
          </Route>

          {/* HR Portal — protected + persistent DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/hr/dashboard" element={<HrDashboardPage />} />
              <Route path="/hr/vacancies" element={<HrVacanciesPage />} />
              <Route path="/hr/applications" element={<HrApplicationsReviewPage />} />
              <Route path="/hr/shortlist" element={<HrShortlistPage />} />
            </Route>
          </Route>

          {/* Director Board Portal — protected + persistent DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['DIRECTOR']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/director/dashboard" element={<DirectorDashboardPage />} />
              <Route path="/director/shortlisted" element={<DirectorShortlistedPage />} />
              <Route path="/director/approvals" element={<DirectorApprovalsPage />} />
            </Route>
          </Route>

          {/* Admin Portal — protected + persistent DashboardLayout */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/departments" element={<DepartmentSettingsPage />} />
            </Route>
          </Route>

          {/* Default redirect to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
