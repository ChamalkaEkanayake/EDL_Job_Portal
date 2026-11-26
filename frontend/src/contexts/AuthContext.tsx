import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import {
  getSystemUsers,
  saveSystemUsers,
  getPortalSettings,
  appendAuditLog,
} from '../utils/portalStorage';

export interface MockAccount {
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department?: string;
  avatar?: string;
  description: string;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    name: 'Chamalka Ekanayaka',
    email: 'applicant@ceb.lk',
    role: 'APPLICANT',
    roleLabel: 'Job Applicant',
    description: 'Browse vacancies, submit applications & track status',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Nimali Senanayake',
    email: 'hr@ceb.lk',
    role: 'HR',
    roleLabel: 'HR / Recruitment Staff',
    department: 'Human Resources Division',
    description: 'Create vacancies, screen applications & shortlist candidates',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Eng. Priyantha Silva',
    email: 'director@ceb.lk',
    role: 'DIRECTOR',
    roleLabel: 'Director Board Member',
    department: 'Board of Directors',
    description: 'Review shortlisted candidates & grant final approval/rejection',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    name: 'Chaminda Rathnayake',
    email: 'admin@ceb.lk',
    role: 'ADMIN',
    roleLabel: 'System Administrator',
    department: 'IT & Digital Transformation',
    description: 'Manage user access, role permissions & system audit logs',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
];

export interface LoginResult {
  ok: boolean;
  error?: string;
  role?: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, role?: UserRole, customName?: string) => LoginResult;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ceb_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ceb_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ceb_user');
    }
  }, [currentUser]);

  const login = (email: string, forcedRole?: UserRole, customName?: string): LoginResult => {
    const cleanEmail = email.trim().toLowerCase();
    const systemUsers = getSystemUsers();
    const settings = getPortalSettings();

    const matchedSystemUser = systemUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // 1. Block Suspended accounts managed in Admin User Management
    if (matchedSystemUser?.status === 'Suspended') {
      appendAuditLog({
        actorName: matchedSystemUser.name,
        actorRole: matchedSystemUser.role,
        action: 'Blocked Login for Suspended Account',
        target: matchedSystemUser.email,
        category: 'AUTH',
        severity: 'WARNING',
        details: 'Sign-in rejected because the account is currently suspended by System Admin.',
      });
      return {
        ok: false,
        error:
          'Your account has been suspended by a System Administrator. Please contact CEB Helpdesk (1987).',
      };
    }

    const matchedMock = MOCK_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === cleanEmail || (forcedRole && acc.role === forcedRole)
    );

    const resolvedRole: UserRole =
      matchedSystemUser?.role || matchedMock?.role || forcedRole || 'APPLICANT';

    // 2. Enforce Maintenance Mode for non-Admin users
    if (settings.maintenanceMode && resolvedRole !== 'ADMIN') {
      return {
        ok: false,
        error:
          'The CEB Job Portal is currently in Maintenance Mode. Only System Administrators can sign in right now.',
      };
    }

    // Build authenticated user from live System Users (supports newly provisioned staff) or mock defaults
    let user: User;
    if (matchedSystemUser) {
      user = {
        id: matchedSystemUser.id,
        name: customName?.trim() || matchedSystemUser.name,
        email: matchedSystemUser.email,
        role: matchedSystemUser.role,
        department: matchedSystemUser.department,
        avatar: matchedMock?.avatar,
      };
      const updatedUsers = systemUsers.map((u) =>
        u.id === matchedSystemUser.id ? { ...u, lastActive: 'Just now' } : u
      );
      saveSystemUsers(updatedUsers);
    } else if (matchedMock && !customName) {
      user = {
        id: `usr-${Date.now()}`,
        name: matchedMock.name,
        email: matchedMock.email,
        role: matchedMock.role,
        department: matchedMock.department,
        avatar: matchedMock.avatar,
      };
    } else {
      user = {
        id: `usr-${Date.now()}`,
        name: customName?.trim() || email.split('@')[0],
        email: cleanEmail || email,
        role: resolvedRole,
      };
    }

    setCurrentUser(user);
    return { ok: true, role: user.role };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ceb_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
