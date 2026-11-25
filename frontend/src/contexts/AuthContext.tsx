import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

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

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, role?: UserRole) => boolean;
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

  const login = (email: string, forcedRole?: UserRole): boolean => {
    const matchedAccount = MOCK_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase() || (forcedRole && acc.role === forcedRole)
    );

    if (matchedAccount) {
      const user: User = {
        id: `usr-${Date.now()}`,
        name: matchedAccount.name,
        email: matchedAccount.email,
        role: matchedAccount.role,
        department: matchedAccount.department,
        avatar: matchedAccount.avatar,
      };
      setCurrentUser(user);
      return true;
    }

    // Default fallback as Applicant if not in mock list
    const fallbackUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: forcedRole || 'APPLICANT',
    };
    setCurrentUser(fallbackUser);
    return true;
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
