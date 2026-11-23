import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Phone,
  CreditCard,
  CheckCircle2,
  Briefcase,
  LogIn,
} from 'lucide-react';
import { CebJobPortalLogo } from '../../components/common/CebJobPortalLogo';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the CEB recruitment declarations.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Register candidate and log in as APPLICANT
      login(email, 'APPLICANT');
      setIsLoading(false);
      navigate('/applicant/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Simple Header */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <CebJobPortalLogo size="md" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Register Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">

          {/* Left Presentation Panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0c2b4d] to-[#04172a] text-white p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-400/30 mb-6">
                <Briefcase className="w-3.5 h-3.5" />
                Applicant Registration
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Create Your <br />
                <span className="text-sky-400">Candidate Profile</span>
              </h2>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Registering an account allows you to apply for vacancies, upload your CV and certificates, and monitor your application journey at Ceylon Electricity Board.
              </p>

              <div className="mt-6 space-y-3 border-t border-slate-700/60 pt-6">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>One account for all CEB job vacancies</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Email alerts on shortlisting & interview schedules</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Secure storage for academic & professional credentials</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/60 mt-6 text-[11px] text-slate-400">
              Internal staff members (HR, Director Board, Admin) do not need to register. Please sign in directly with official credentials.
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applicant Sign Up</h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details to create an official candidate account.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (as per NIC)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Chamalka Ekanayke"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. chamalka@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
                  />
                </div>
              </div>

              {/* NIC & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIC Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      required
                      placeholder="199512345678"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="077 123 4567"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-600">
                    I declare that all information provided is accurate and agree to the CEB recruitment code of conduct.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Applicant Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-sky-600 hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
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
