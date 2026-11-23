import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CebJobPortalLogo } from './common/CebJobPortalLogo';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlaceholderDashboard: React.FC<{ title: string; subtitle: string; roleTag: string }> = ({
  title,
  subtitle,
  roleTag,
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CebJobPortalLogo size="sm" />
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {roleTag}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            {currentUser?.avatar && (
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
            )}
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-slate-800 leading-none">{currentUser?.name}</p>
              <p className="text-slate-400 text-[10px]">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col justify-center items-center text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-lg w-full">
          <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-4 p-2 border border-slate-100">
            <CebJobPortalLogo size="sm" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
            {roleTag} Successfully Authenticated
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-3">{title}</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subtitle}</p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
            <p className="text-slate-500">
              <strong className="text-slate-700">Logged in User:</strong> {currentUser?.name}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Role:</strong> {currentUser?.role}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Department:</strong>{' '}
              {currentUser?.department || 'General Public'}
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Role Login Switcher
          </button>
        </div>
      </main>
    </div>
  );
};
