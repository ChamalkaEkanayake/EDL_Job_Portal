import React, { useState, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderLock,
  ShieldCheck,
  Save,
  Plus,
  Pencil,
  Trash2,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Award,
  Eye,
  EyeOff,
  FileText,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  MOCK_CANDIDATE_PROFILE,
  type CandidateProfile,
  type EducationEntry,
  type WorkExperienceEntry,
} from '../../data/mockRecruitmentData';
import { getPortalSettings } from '../../utils/portalStorage';

type ProfileTab = 'PERSONAL' | 'EDUCATION' | 'EXPERIENCE' | 'DOCUMENTS';

const SRI_LANKA_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'North Central Province',
  'Uva Province',
  'Eastern Province',
  'Northern Province',
];

export const CandidateProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const storageKey = `ceb_candidate_profile_${currentUser?.email || 'default'}`;

  const [profile, setProfile] = useState<CandidateProfile>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as CandidateProfile;
    } catch {
      // ignore malformed localStorage
    }
    return {
      ...MOCK_CANDIDATE_PROFILE,
      fullName: currentUser?.name || MOCK_CANDIDATE_PROFILE.fullName,
      email: currentUser?.email || MOCK_CANDIDATE_PROFILE.email,
    };
  });

  const [activeTab, setActiveTab] = useState<ProfileTab>('PERSONAL');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Education modal state
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<EducationEntry | null>(null);
  const [eduForm, setEduForm] = useState<Omit<EducationEntry, 'id'>>({
    title: '',
    institution: '',
    fieldOfStudy: '',
    completionYear: '',
    gradeOrClass: '',
    professionalBody: '',
  });

  // Experience modal state
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<WorkExperienceEntry | null>(null);
  const [expForm, setExpForm] = useState<Omit<WorkExperienceEntry, 'id'>>({
    role: '',
    organization: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    responsibilities: '',
  });

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const persistProfile = (nextProfile: CandidateProfile, message?: string) => {
    setProfile(nextProfile);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextProfile));
    } catch {
      // ignore storage quota errors
    }
    if (message) showToast(message, 'success');
  };

  // Dynamic Profile Completeness calculation
  const completeness = useMemo(() => {
    let score = 0;
    const checks = [
      Boolean(profile.fullName.trim() && profile.nic.trim() && profile.dob.trim()),
      Boolean(profile.phone.trim() && profile.address.trim() && profile.district.trim()),
      Boolean(profile.bio.trim().length >= 20),
      profile.education.length > 0,
      profile.experience.length > 0,
      ...profile.documents.map((doc) => Boolean(doc.fileName)),
    ];
    const completed = checks.filter(Boolean).length;
    score = Math.round((completed / checks.length) * 100);
    return Math.min(100, score);
  }, [profile]);

  const totalExperienceYears = useMemo(() => {
    if (profile.experience.length === 0) return '0 yrs';
    let totalMonths = 0;
    const now = new Date('2026-11-25');
    profile.experience.forEach((exp) => {
      if (!exp.startDate) return;
      const [sy, sm] = exp.startDate.split('-').map(Number);
      const start = new Date(sy, (sm || 1) - 1, 1);
      let end = now;
      if (!exp.currentlyWorking && exp.endDate) {
        const [ey, em] = exp.endDate.split('-').map(Number);
        end = new Date(ey, (em || 1) - 1, 1);
      }
      const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (diff > 0) totalMonths += diff;
    });
    const years = (totalMonths / 12).toFixed(1);
    return `${years.endsWith('.0') ? years.slice(0, -2) : years}+ yrs`;
  }, [profile.experience]);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    persistProfile(profile, 'Personal and contact details saved successfully.');
  };

  // Education CRUD handlers
  const openAddEdu = () => {
    setEditingEdu(null);
    setEduForm({
      title: '',
      institution: '',
      fieldOfStudy: '',
      completionYear: '',
      gradeOrClass: '',
      professionalBody: '',
    });
    setEduModalOpen(true);
  };

  const openEditEdu = (entry: EducationEntry) => {
    setEditingEdu(entry);
    setEduForm({
      title: entry.title,
      institution: entry.institution,
      fieldOfStudy: entry.fieldOfStudy,
      completionYear: entry.completionYear,
      gradeOrClass: entry.gradeOrClass,
      professionalBody: entry.professionalBody || '',
    });
    setEduModalOpen(true);
  };

  const handleSaveEdu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.title.trim() || !eduForm.institution.trim()) return;

    const updatedList = editingEdu
      ? profile.education.map((item) =>
          item.id === editingEdu.id ? { ...eduForm, id: editingEdu.id } : item
        )
      : [{ ...eduForm, id: `edu-${Date.now()}` }, ...profile.education];

    persistProfile(
      { ...profile, education: updatedList },
      editingEdu ? 'Qualification updated.' : 'New qualification added to your profile.'
    );
    setEduModalOpen(false);
  };

  const handleDeleteEdu = (id: string) => {
    persistProfile(
      { ...profile, education: profile.education.filter((e) => e.id !== id) },
      'Qualification removed.'
    );
  };

  // Experience CRUD handlers
  const openAddExp = () => {
    setEditingExp(null);
    setExpForm({
      role: '',
      organization: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      responsibilities: '',
    });
    setExpModalOpen(true);
  };

  const openEditExp = (entry: WorkExperienceEntry) => {
    setEditingExp(entry);
    setExpForm({
      role: entry.role,
      organization: entry.organization,
      startDate: entry.startDate,
      endDate: entry.endDate,
      currentlyWorking: entry.currentlyWorking,
      responsibilities: entry.responsibilities,
    });
    setExpModalOpen(true);
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.role.trim() || !expForm.organization.trim()) return;

    const cleanedExp = {
      ...expForm,
      endDate: expForm.currentlyWorking ? '' : expForm.endDate,
    };

    const updatedList = editingExp
      ? profile.experience.map((item) =>
          item.id === editingExp.id ? { ...cleanedExp, id: editingExp.id } : item
        )
      : [{ ...cleanedExp, id: `exp-${Date.now()}` }, ...profile.experience];

    persistProfile(
      { ...profile, experience: updatedList },
      editingExp ? 'Work experience updated.' : 'Work experience added to your profile.'
    );
    setExpModalOpen(false);
  };

  const handleDeleteExp = (id: string) => {
    persistProfile(
      { ...profile, experience: profile.experience.filter((e) => e.id !== id) },
      'Work experience entry removed.'
    );
  };

  // Document Vault handlers
  const portalSettings = getPortalSettings();
  const handleDocumentUpload = (docId: string, file: File | undefined) => {
    if (!file) return;
    const maxBytes = portalSettings.maxUploadSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      showToast(`File size must be under ${portalSettings.maxUploadSizeMb}MB (Portal Policy).`, 'error');
      return;
    }

    const sizeFormatted =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const updatedDocs = profile.documents.map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            fileName: file.name,
            uploadedDate: '2026-11-25',
            fileSize: sizeFormatted,
          }
        : doc
    );

    persistProfile({ ...profile, documents: updatedDocs }, `"${file.name}" uploaded to Document Vault.`);
  };

  const handleRemoveDocument = (docId: string) => {
    const updatedDocs = profile.documents.map((doc) =>
      doc.id === docId
        ? { ...doc, fileName: undefined, uploadedDate: undefined, fileSize: undefined }
        : doc
    );
    persistProfile({ ...profile, documents: updatedDocs }, 'Document removed from vault.');
  };

  // Password Change handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPw.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPw !== confirmPw) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    showToast('Account password updated successfully.', 'success');
  };

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'PERSONAL', label: 'Personal Details', icon: <User className="w-4 h-4" /> },
    {
      id: 'EDUCATION',
      label: 'Education & Qualifications',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: profile.education.length,
    },
    {
      id: 'EXPERIENCE',
      label: 'Work Experience',
      icon: <Briefcase className="w-4 h-4" />,
      badge: profile.experience.length,
    },
    {
      id: 'DOCUMENTS',
      label: 'Document Vault & Security',
      icon: <FolderLock className="w-4 h-4" />,
      badge: `${profile.documents.filter((d) => d.fileName).length}/${profile.documents.length}`,
    },
  ];

  const uploadedDocsCount = profile.documents.filter((d) => d.fileName).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Candidate Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Maintain your personal details, qualifications, and verified documents for fast CEB applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => persistProfile(profile, 'All profile changes saved!')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Profile</span>
        </button>
      </div>

      {/* Inline Toast Feedback */}
      {toast && (
        <div
          className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold border shadow-2xs ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Profile Hero Card & Live Completeness Meter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Candidate Identity */}
          <div className="flex items-start sm:items-center gap-4">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={profile.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 font-bold text-xl flex items-center justify-center shrink-0">
                {profile.fullName.charAt(0) || 'C'}
              </div>
            )}

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {profile.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  {completeness >= 80 ? 'Profile Ready' : 'Needs Details'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  NIC: <strong className="text-slate-700">{profile.nic}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.district}, {profile.province}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Experience: <strong className="text-slate-700">{totalExperienceYears}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Profile Completeness Meter */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 lg:w-80 shrink-0">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700">Profile Completeness</span>
              <span
                className={`font-black ${
                  completeness === 100
                    ? 'text-emerald-600'
                    : completeness >= 75
                    ? 'text-sky-600'
                    : 'text-amber-600'
                }`}
              >
                {completeness}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  completeness === 100
                    ? 'bg-emerald-500'
                    : completeness >= 75
                    ? 'bg-sky-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {completeness === 100
                ? 'All profile sections & documents verified!'
                : `${uploadedDocsCount}/${profile.documents.length} vault documents uploaded`}
            </p>
          </div>
        </div>

        {/* 4-Tab Navigation */}
        <div className="flex flex-wrap gap-2 pt-5 mt-5 border-t border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Personal Details */}
      {activeTab === 'PERSONAL' && (
        <form
          onSubmit={handleSavePersonal}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900">Identity & Contact Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your full name and NIC match your official certified certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name (as per NIC) *
              </label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NIC Number *
              </label>
              <input
                type="text"
                required
                value={profile.nic}
                onChange={(e) => setProfile({ ...profile, nic: e.target.value })}
                placeholder="e.g. 199724501892 or 972451892V"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={profile.dob}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    gender: e.target.value as CandidateProfile['gender'],
                  })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Email (Registered)
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Permanent Residential Address *
              </label>
              <input
                type="text"
                required
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">District *</label>
              <input
                type="text"
                required
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Province *</label>
              <select
                value={profile.province}
                onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 cursor-pointer"
              >
                {SRI_LANKA_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Professional Summary / Bio
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Summarize your core qualifications, certifications, and engineering/professional focus..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Personal Details</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Education & Qualifications */}
      {activeTab === 'EDUCATION' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Academic & Professional Qualifications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add degrees, diplomas, A/L results, and professional body memberships (e.g., IESL, CA Sri Lanka).
              </p>
            </div>
            <button
              type="button"
              onClick={openAddEdu}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Qualification</span>
            </button>
          </div>

          {profile.education.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <GraduationCap className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No qualifications added yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Add your degrees or diplomas to verify eligibility for CEB vacancies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/70">
                        {edu.completionYear}
                      </span>
                      {edu.professionalBody && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Award className="w-3 h-3" />
                          {edu.professionalBody}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">{edu.title}</h4>
                    <p className="text-xs font-semibold text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-500">
                      {edu.fieldOfStudy}
                      {edu.gradeOrClass ? ` • ${edu.gradeOrClass}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditEdu(edu)}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-sky-700 hover:border-sky-200 transition cursor-pointer"
                      title="Edit qualification"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                      title="Remove qualification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Work Experience */}
      {activeTab === 'EXPERIENCE' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Work Experience</h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  {totalExperienceYears} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detail your relevant engineering, technical, or administrative work history.
              </p>
            </div>
            <button
              type="button"
              onClick={openAddExp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          {profile.experience.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Briefcase className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No work experience recorded</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Include full-time employment, industrial training, or contract engineering roles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {exp.startDate} — {exp.currentlyWorking ? 'Present' : exp.endDate || 'N/A'}
                      </span>
                      {exp.currentlyWorking && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Current Role
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">{exp.role}</h4>
                    <p className="text-xs font-semibold text-sky-700">{exp.organization}</p>
                    {exp.responsibilities && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditExp(exp)}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-sky-700 hover:border-sky-200 transition cursor-pointer"
                      title="Edit experience"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExp(exp.id)}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                      title="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Document Vault & Account Security */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          {/* Document Vault */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Saved Document Vault</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep certified copies ready here so they can be attached automatically when applying for CEB vacancies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.documents.map((doc) => {
                const isUploaded = Boolean(doc.fileName);
                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                      isUploaded
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-amber-50/40 border-amber-200 border-dashed'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                          {doc.label}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isUploaded
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.required
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isUploaded ? 'Uploaded' : doc.required ? 'Required' : 'Optional'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">{doc.description}</p>

                      {isUploaded && (
                        <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{doc.fileName}</p>
                            <p className="text-[10px] text-slate-400">
                              {doc.fileSize} • Uploaded {doc.uploadedDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => showToast(`Downloading "${doc.fileName}"...`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition cursor-pointer"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer transition">
                      <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                      <span>{isUploaded ? 'Replace Document' : 'Upload PDF / Scan'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          handleDocumentUpload(doc.id, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Security: Change Password */}
          <form
            onSubmit={handlePasswordChange}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600" />
                  <span>Account Security & Password</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your CEB Job Portal login password (minimum 8 characters).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPw ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add / Edit Qualification */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveEdu}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEdu ? 'Edit Qualification' : 'Add Qualification'}
              </h3>
              <button
                type="button"
                onClick={() => setEduModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Degree / Diploma / Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.title}
                  onChange={(e) => setEduForm({ ...eduForm, title: e.target.value })}
                  placeholder="e.g. B.Sc. Engineering (Hons)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / Institution *
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  placeholder="e.g. University of Peradeniya"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={eduForm.fieldOfStudy}
                  onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                  placeholder="e.g. Electrical & Electronic Engineering"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Completion Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.completionYear}
                    onChange={(e) => setEduForm({ ...eduForm, completionYear: e.target.value })}
                    placeholder="e.g. 2022"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={eduForm.gradeOrClass}
                    onChange={(e) => setEduForm({ ...eduForm, gradeOrClass: e.target.value })}
                    placeholder="e.g. First Class"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Professional Membership (Optional)
                </label>
                <input
                  type="text"
                  value={eduForm.professionalBody}
                  onChange={(e) => setEduForm({ ...eduForm, professionalBody: e.target.value })}
                  placeholder="e.g. IESL Associate Member / CIMA Passed Finalist"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEduModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                {editingEdu ? 'Update' : 'Add Qualification'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add / Edit Work Experience */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleSaveExp}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingExp ? 'Edit Work Experience' : 'Add Work Experience'}
              </h3>
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  placeholder="e.g. Electrical Engineer"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization / Company *
                </label>
                <input
                  type="text"
                  required
                  value={expForm.organization}
                  onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })}
                  placeholder="e.g. Lanka Grid Solutions (Pvt) Ltd"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Month
                  </label>
                  <input
                    type="month"
                    disabled={expForm.currentlyWorking}
                    value={expForm.currentlyWorking ? '' : expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expForm.currentlyWorking}
                  onChange={(e) =>
                    setExpForm({ ...expForm, currentlyWorking: e.target.checked })
                  }
                  className="rounded text-sky-600"
                />
                <span>I am currently working in this role</span>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={expForm.responsibilities}
                  onChange={(e) =>
                    setExpForm({ ...expForm, responsibilities: e.target.value })
                  }
                  placeholder="Describe your main engineering or operational responsibilities..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setExpModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                {editingExp ? 'Update' : 'Add Experience'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
