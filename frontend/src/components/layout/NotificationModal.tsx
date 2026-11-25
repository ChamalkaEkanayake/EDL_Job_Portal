import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  Trash2,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  category: 'Application' | 'Vacancy' | 'System' | 'Deadline';
  statusTag: string;
  timestamp: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Application Ref #CEB-2026-EE04 received and under HR Review',
    category: 'Application',
    statusTag: 'Under Review',
    timestamp: '11/23/2026, 2:39:25 PM',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'New Vacancy Published: Electrical Engineer (Transmission Division)',
    category: 'Vacancy',
    statusTag: 'Open for Apply',
    timestamp: '11/23/2026, 11:28:31 AM',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Document Verification Reminder: Upload Certified Degree Certificate',
    category: 'Application',
    statusTag: 'Action Required',
    timestamp: '11/22/2026, 9:29:24 AM',
    isRead: false,
  },
  {
    id: 'notif-4',
    title: 'Application Deadline Approaching: Assistant Network Engineer closes in 3 days',
    category: 'Deadline',
    statusTag: 'Closing Soon',
    timestamp: '11/20/2026, 3:32:47 PM',
    isRead: true,
  },
  {
    id: 'notif-5',
    title: 'Recruitment Policy Update: 2026 Scheme of Recruitment in effect',
    category: 'System',
    statusTag: 'Official Notice',
    timestamp: '11/15/2026, 4:33:16 PM',
    isRead: true,
  },
];

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'tasks'>('inbox');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const removeAll = () => {
    setNotifications([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/30 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mt-12 sm:mt-14">
        {/* Header matching exact CEBAssist screenshot */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-800">Job Portal Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Inbox & Tasks matching screenshot */}
        <div className="flex px-4 pt-2 border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-2.5 px-3 text-xs font-semibold relative transition ${
              activeTab === 'inbox'
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
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 text-xs font-semibold relative transition ${
              activeTab === 'tasks'
                ? 'text-slate-900 border-b-2 border-sky-600 font-bold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tasks (Action Required)
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              You are all caught up! No notifications.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition group ${
                  !item.isRead ? 'bg-sky-50/30' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  {item.category === 'Application' ? (
                    <FileText className="w-4 h-4" />
                  ) : item.category === 'Vacancy' ? (
                    <Briefcase className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">{item.statusTag}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</p>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="Mark as read"
                      className="p-1 rounded border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-500 hover:text-emerald-600 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(item.id)}
                    title="Remove"
                    className="p-1 rounded border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer matching exact screenshot */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <span>Unread: {unreadCount}</span>
            <span>•</span>
            <button
              onClick={() => alert('Notification preferences opened')}
              className="text-slate-500 hover:text-slate-800 hover:underline"
            >
              Preferences
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-white text-slate-700 text-[11px] font-medium flex items-center gap-1 transition shadow-2xs"
            >
              <Check className="w-3 h-3 text-slate-500" />
              Mark all as read
            </button>
            <button
              onClick={removeAll}
              className="px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-medium flex items-center gap-1 transition shadow-2xs"
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
