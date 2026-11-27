import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

const ROLE_HOME_PATH: Record<UserRole, string> = {
  APPLICANT: '/applicant/dashboard',
  HR: '/hr/dashboard',
  DIRECTOR: '/director/dashboard',
  ADMIN: '/admin/dashboard',
};

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={ROLE_HOME_PATH[currentUser.role] || '/login'} replace />;
  }

  return <Outlet />;
};
