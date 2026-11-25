import React, { useState } from 'react';import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  UserCheck,
  Building,
  Shield,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CebJobPortalLogo } from '../common/CebJobPortalLogo';
import { NotificationModal } from './NotificationModal';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Sidebar is "open" when: not collapsed, OR when collapsed but hovered
  const isSidebarOpen = !isSidebarCollapsed || isSidebarHovered;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic Navigation Items strictly tailored by Role
  const getNavItems = (role?: UserRole): NavItem[] => {
    switch (role) {
      case 'APPLICANT':
        return [
          {
            label: 'Applicant Overview',
            to: '/applicant/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'Explore Vacancies',
            to: '/applicant/vacancies',
            icon: <Briefcase className="w-4 h-4" />,
          },
          {
            label: 'My Applications',
            to: '/applicant/applications',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'My Candidate Profile',
            to: '/applicant/profile',
            icon: <UserCheck className="w-4 h-4" />,
          },
        ];
      case 'HR':
        return [
          {
            label: 'HR Dashboard',
            to: '/hr/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'Vacancy Management',
            to: '/hr/vacancies',
            icon: <Briefcase className="w-4 h-4" />,
          },
          {
            label: 'Review Applications',
            to: '/hr/applications',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'Shortlisting & Board',
            to: '/hr/shortlist',
            icon: <UserCheck className="w-4 h-4" />,
          },
        ];
      case 'DIRECTOR':
        return [
          {
            label: 'Board Dashboard',
            to: '/director/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'Shortlisted Applications',
            to: '/director/shortlisted',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            label: 'Approvals & Remarks',
            to: '/director/approvals',
            icon: <Building className="w-4 h-4" />,
          },
        ];
      case 'ADMIN':
        return [
          {
            label: 'Admin Console',
            to: '/admin/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
          {
            label: 'User & Role Management',
            to: '/admin/users',
            icon: <Shield className="w-4 h-4" />,
          },
          {
            label: 'Department Settings',
            to: '/admin/departments',
            icon: <Building className="w-4 h-4" />,
          },
        ];
      default:
        return [
          {
            label: 'Dashboard',
            to: '/applicant/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
        ];
    }
  };

  const navItems = getNavItems(currentUser?.role);

  // Generate breadcrumb from path
  const currentPathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbSection = currentPathSegments[0]
    ? currentPathSegments[0].toUpperCase()
    : 'PORTAL';
  const breadcrumbPage = currentPathSegments[1]
    ? currentPathSegments[1].charAt(0).toUpperCase() + currentPathSegments[1].slice(1)
    : 'Overview';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navbar matching exact CEBAssist header pattern */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        
        {/* Left: Collapse toggle + Logo + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          <CebJobPortalLogo size="sm" />

          {/* Breadcrumb matching CEBAssist screenshot: < Section > Page */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-slate-200">
            <span>&lt;</span>
            <span className="font-medium text-slate-600">{breadcrumbSection}</span>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">{breadcrumbPage}</span>
          </div>
        </div>

        {/* Right: Search + Notifications + User Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search box matching screenshot */}
          <div className="relative hidden lg:block w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vacancies, applications..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Notification Bell Icon with Red Badge (matching screenshot count 5) */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              3
            </span>
          </button>

          {/* User profile dropdown trigger */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="relative">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>

            <div className="hidden sm:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-800 line-clamp-1">{currentUser?.name}</p>
              <span className="text-[10px] text-slate-500 font-medium">
                {currentUser?.role === 'APPLICANT'
                  ? 'Job Applicant'
                  : currentUser?.role === 'HR'
                  ? 'HR Staff'
                  : currentUser?.role === 'DIRECTOR'
                  ? 'Director Board'
                  : 'System Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Dynamic Sidebar matching CEBAssist collapsible + hover-expand pattern */}
        <aside
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col justify-between shrink-0 overflow-hidden z-20 ${
            isSidebarOpen ? 'w-60' : 'w-16'
          } ${isSidebarCollapsed && isSidebarHovered ? 'shadow-xl' : ''}`}
        >
          {/* Nav Items */}
          <div className="p-3 space-y-1">
            {isSidebarOpen && (
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
                Recruitment Portal
              </div>
            )}

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${!isSidebarOpen ? 'justify-center' : ''}`
                }
                title={!isSidebarOpen ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {isSidebarOpen && (
                  <span className="whitespace-nowrap overflow-hidden transition-all duration-150">
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 space-y-1">
            {isSidebarOpen ? (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="whitespace-nowrap">CEB Helpdesk</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">Hotline: 1987 / hr@ceb.lk</p>
              </div>
            ) : (
              <button
                className="w-full p-2 flex justify-center text-slate-400 hover:text-slate-700"
                title="Help & Support: 1987"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Dynamic Outlet / Page Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Notification Center Modal */}
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
