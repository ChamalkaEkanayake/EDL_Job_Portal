import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, MOCK_ACCOUNTS } from '../../contexts/AuthContext';
import { CebJobPortalLogo } from '../../components/common/CebJobPortalLogo';
import { getPortalSettings, getSystemUsers } from '../../utils/portalStorage';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const portalSettings = getPortalSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email/username and password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = usernameOrEmail.trim().toLowerCase();

      // Check live system users first (supports Admin-provisioned accounts), then fallback heuristics
      const liveUser = getSystemUsers().find(
        (u) => u.email.toLowerCase() === cleanInput
      );
      const matched = MOCK_ACCOUNTS.find(
        (acc) =>
          acc.email.toLowerCase() === cleanInput ||
          acc.email.toLowerCase().startsWith(cleanInput)
      );

      let targetRole: UserRole = 'APPLICANT';
      let targetEmail = usernameOrEmail;

      if (liveUser) {
        targetRole = liveUser.role;
        targetEmail = liveUser.email;
      } else if (matched) {
        targetRole = matched.role;
        targetEmail = matched.email;
      } else if (cleanInput.includes('admin')) {
        targetRole = 'ADMIN';
      } else if (cleanInput.includes('hr')) {
        targetRole = 'HR';
      } else if (cleanInput.includes('director') || cleanInput.includes('board')) {
        targetRole = 'DIRECTOR';
      } else {
        targetRole = 'APPLICANT';
      }

      const result = login(targetEmail, targetRole);
      setIsLoading(false);

      if (!result.ok) {
        setErrorMsg(result.error || 'Unable to sign in.');
        return;
      }

      const effectiveRole = result.role || targetRole;
      switch (effectiveRole) {
        case 'APPLICANT':
          navigate('/applicant/dashboard');
          break;
        case 'HR':
          navigate('/hr/dashboard');
          break;
        case 'DIRECTOR':
          navigate('/director/dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/applicant/dashboard');
      }
    }, 450);
  };

  const handleQuickFill = (accEmail: string) => {
    setUsernameOrEmail(accEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <CebJobPortalLogo size="md" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">New applicant?</span>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#f59e0b] text-[#d97706] hover:bg-amber-50 transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Register (18+)
          </Link>
        </div>
      </header>

      {/* Main Login Body: 2-Column Presentation + Form Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Side: CEB Careers Presentation & Description */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0c2b4d] to-[#04172a] text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-400/30 mb-6">
                <Briefcase className="w-3.5 h-3.5" />
                CEB Careers
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Join the Nation's <br />
                <span className="text-sky-400">Power Pioneer</span>
              </h2>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Welcome to the Ceylon Electricity Board Recruitment Portal. Discover career opportunities across engineering, technical services, finance, and administration.
              </p>

              <div className="mt-8 space-y-3 border-t border-slate-700/60 pt-6">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct vacancy applications & real-time status tracking</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transparent multi-level evaluation by HR & Director Board</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Official digital document submission (Ages 18+)</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-slate-700/60 mt-6">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Official CEB Recruitment Platform
              </p>
            </div>
          </div>

          {/* Right Side: Clean Login Form + Quick Demo Logins */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Login</h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your job applications or management dashboard.
              </p>
            </div>

            {portalSettings.maintenanceMode && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                <strong>Scheduled Maintenance Active:</strong> Only System Administrators can sign in right now.
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    required
                    placeholder="e.g. applicant@ceb.lk or hr@ceb.lk"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset instructions will be sent to your registered email.');
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Register Callout */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Don't have an account yet?</span>
                <Link
                  to="/register"
                  className="font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                >
                  Create an Account
                </Link>
              </div>
            </form>

            {/* Quick-Fill Helper for Testing/Reviewing All 4 Roles */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2">
                Quick Test Logins (Click to autofill):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickFill(acc.email)}
                    className="text-left p-2 rounded-lg border border-slate-200 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/50 text-[11px] transition flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-medium text-slate-700 truncate">{acc.roleLabel.split('/')[0]}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400">
        © 2026 Ceylon Electricity Board. All rights reserved. Job & Recruitment Portal.
      </footer>
    </div>
  );
};
