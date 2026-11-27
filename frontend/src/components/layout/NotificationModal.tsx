import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  X,
  Check,
  Trash2,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getNotificationsForUser,
  getNotificationPreferences,
  saveNotificationPreferences,
  markNotificationRead,
  removeNotificationById,
  markAllNotificationsReadForUser,
  clearNotificationsForUser,
  NOTIFICATIONS_UPDATED_EVENT,
  type PortalNotification,
  type NotificationPreferences,
} from '../../utils/portalStorage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'inbox' | 'tasks'>('inbox');
  const [showPrefs, setShowPrefs] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>(() =>
    getNotificationsForUser(currentUser?.role, currentUser?.email)
  );
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    getNotificationPreferences(currentUser?.email)
  );

  useEffect(() => {
    const sync = () => {
      setPrefs(getNotificationPreferences(currentUser?.email));
      setNotifications(getNotificationsForUser(currentUser?.role, currentUser?.email));
    };
    sync();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [currentUser?.role, currentUser?.email, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const unreadCount = useMemo(
    () => (prefs.enabled ? notifications.filter((n) => !n.isRead).length : 0),
    [notifications, prefs.enabled]
  );

  const actionTasksCount = useMemo(
    () => (prefs.enabled ? notifications.filter((n) => n.actionRequired).length : 0),
    [notifications, prefs.enabled]
  );

  const visibleNotifications = useMemo(() => {
    if (!prefs.enabled) return [];
    if (activeTab === 'tasks') {
      return notifications.filter((n) => n.actionRequired);
    }
    return notifications;
  }, [notifications, activeTab, prefs.enabled]);

  if (!isOpen) return null;

  const updatePrefs = (patch: Partial<NotificationPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveNotificationPreferences(next, currentUser?.email);
  };

  const handleOpenItem = (item: PortalNotification) => {
    if (!item.isRead) {
      markNotificationRead(item.id);
    }
    if (item.actionPath) {
      onClose();
      navigate(item.actionPath);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/30 backdrop-blur-xs overflow-hidden overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mt-12 sm:mt-14">
        {/* Header with Master ON/OFF Toggle */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition ${
                prefs.enabled
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              {prefs.enabled ? (
                <Bell className="w-4 h-4 text-amber-500 fill-amber-400/35" />
              ) : (
                <BellOff className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">
                Job Portal Notifications
              </h3>
              <p className="text-[10px] text-slate-400">
                {currentUser?.role || 'PORTAL'} Alert Center •{' '}
                <span className={prefs.enabled ? 'text-emerald-600 font-semibold' : 'text-slate-500 font-semibold'}>
                  {prefs.enabled ? 'Active' : 'Muted'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Master ON / OFF Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={prefs.enabled}
              onClick={() => updatePrefs({ enabled: !prefs.enabled })}
              className={`inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full border text-[10px] font-bold transition cursor-pointer ${
                prefs.enabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={prefs.enabled ? 'Turn notifications OFF' : 'Turn notifications ON'}
            >
              <span>{prefs.enabled ? 'ON' : 'OFF'}</span>
              <span
                className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${
                  prefs.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-2xs" />
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs: Inbox & Tasks */}
        <div className="flex px-4 pt-2 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab('inbox');
              setShowPrefs(false);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold relative transition cursor-pointer ${
              activeTab === 'inbox' && !showPrefs
                ? 'text-slate-900 border-b-2 border-sky-600 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Inbox
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-rose-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('tasks');
              setShowPrefs(false);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold relative transition cursor-pointer ${
              activeTab === 'tasks' && !showPrefs
                ? 'text-slate-900 border-b-2 border-sky-600 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tasks (Action Required)
            {actionTasksCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded-full font-bold">
                {actionTasksCount}
              </span>
            )}
          </button>
        </div>

        {/* Body: Preferences View OR Muted State OR Notifications List */}
        {showPrefs ? (
          <div className="p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                Notification Preferences
              </p>
              <button
                type="button"
                onClick={() => setShowPrefs(false)}
                className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
              >
                Back to Inbox
              </button>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs cursor-pointer">
              <div>
                <p className="font-bold text-slate-800">Enable All Portal Notifications</p>
                <p className="text-[10px] text-slate-400">
                  Master switch for live alerts & unread bell badge
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.enabled}
                onChange={() => updatePrefs({ enabled: !prefs.enabled })}
                className="rounded text-sky-600 w-4 h-4"
              />
            </label>

            <div className={`space-y-2 transition ${!prefs.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {(
                [
                  {
                    key: 'applicationUpdates',
                    label: 'Applications, Shortlisting & Board Decisions',
                  },
                  {
                    key: 'vacancyAlerts',
                    label: 'New Vacancy Publications & Closing Alerts',
                  },
                  {
                    key: 'systemNotices',
                    label: 'System Security & Governance Notices',
                  },
                ] as const
              ).map((pref) => (
                <label
                  key={pref.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 text-xs cursor-pointer"
                >
                  <span className="font-medium text-slate-700">{pref.label}</span>
                  <input
                    type="checkbox"
                    disabled={!prefs.enabled}
                    checked={prefs[pref.key]}
                    onChange={() => updatePrefs({ [pref.key]: !prefs[pref.key] })}
                    className="rounded text-sky-600"
                  />
                </label>
              ))}
            </div>
          </div>
        ) : !prefs.enabled ? (
          <div className="p-8 text-center space-y-3 bg-slate-50/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <BellOff className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Notifications Are Turned Off</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Alert popups, incoming notifications for your account, and the unread bell badge are muted.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updatePrefs({ enabled: true })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Turn Notifications ON</span>
            </button>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto overscroll-contain divide-y divide-slate-100">
            {visibleNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
                {activeTab === 'tasks'
                  ? 'No action-required tasks pending right now.'
                  : 'You are all caught up! No notifications.'}
              </div>
            ) : (
              visibleNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition group ${
                    item.actionPath ? 'cursor-pointer' : ''
                  } ${!item.isRead ? 'bg-amber-50/30' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      item.actionRequired
                        ? 'bg-amber-50 border-amber-200 text-amber-600'
                        : 'bg-sky-50 border-sky-100 text-sky-600'
                    }`}
                  >
                    {item.category === 'Application' ? (
                      <FileText className="w-4 h-4" />
                    ) : item.category === 'Vacancy' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : item.category === 'Approval' ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">{item.statusTag}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</p>
                  </div>

                  <div
                    className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(item.id)}
                        title="Mark as read"
                        className="p-1 rounded border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNotificationById(item.id)}
                      title="Remove"
                      className="p-1 rounded border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <span>{prefs.enabled ? `Unread: ${unreadCount}` : 'Muted'}</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowPrefs(!showPrefs)}
              className="text-slate-600 hover:text-slate-900 hover:underline font-medium cursor-pointer"
            >
              {showPrefs ? 'Inbox' : 'Preferences'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!prefs.enabled || unreadCount === 0}
              onClick={() =>
                markAllNotificationsReadForUser(currentUser?.role, currentUser?.email)
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-[11px] font-medium flex items-center gap-1 transition shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-3 h-3 text-slate-500" />
              Mark all as read
            </button>
            <button
              type="button"
              disabled={!prefs.enabled || notifications.length === 0}
              onClick={() =>
                clearNotificationsForUser(currentUser?.role, currentUser?.email)
              }
              className="px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-medium flex items-center gap-1 transition shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
              Remove all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
