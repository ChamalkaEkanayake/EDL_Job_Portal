import {
  MOCK_SYSTEM_USERS,
  MOCK_DEPARTMENTS,
  MOCK_AUDIT_LOGS,
  DEFAULT_PORTAL_SETTINGS,
  DEFAULT_NOTIFICATION_TEMPLATES,
  type SystemUser,
  type DepartmentItem,
  type AuditLogEntry,
  type PortalSettings,
  type NotificationTemplate,
} from '../data/mockRecruitmentData';

export const STORAGE_KEYS = {
  SYSTEM_USERS: 'ceb_admin_system_users',
  DEPARTMENTS: 'ceb_admin_departments',
  PORTAL_SETTINGS: 'ceb_admin_portal_settings',
  AUDIT_LOGS: 'ceb_admin_audit_logs',
  NOTIFICATION_TEMPLATES: 'ceb_admin_notification_templates',
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export function getSystemUsers(): SystemUser[] {
  return readJson<SystemUser[]>(STORAGE_KEYS.SYSTEM_USERS, MOCK_SYSTEM_USERS);
}

export function saveSystemUsers(users: SystemUser[]): void {
  writeJson(STORAGE_KEYS.SYSTEM_USERS, users);
}

export function getDepartments(): DepartmentItem[] {
  return readJson<DepartmentItem[]>(STORAGE_KEYS.DEPARTMENTS, MOCK_DEPARTMENTS);
}

export function saveDepartments(departments: DepartmentItem[]): void {
  writeJson(STORAGE_KEYS.DEPARTMENTS, departments);
}

export function getPortalSettings(): PortalSettings {
  return {
    ...DEFAULT_PORTAL_SETTINGS,
    ...readJson<Partial<PortalSettings>>(STORAGE_KEYS.PORTAL_SETTINGS, DEFAULT_PORTAL_SETTINGS),
  };
}

export function savePortalSettings(settings: PortalSettings): void {
  writeJson(STORAGE_KEYS.PORTAL_SETTINGS, settings);
}

export function getNotificationTemplates(): NotificationTemplate[] {
  return readJson<NotificationTemplate[]>(
    STORAGE_KEYS.NOTIFICATION_TEMPLATES,
    DEFAULT_NOTIFICATION_TEMPLATES
  );
}

export function saveNotificationTemplates(templates: NotificationTemplate[]): void {
  writeJson(STORAGE_KEYS.NOTIFICATION_TEMPLATES, templates);
}

export function getAuditLogs(): AuditLogEntry[] {
  return readJson<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);
}

function formatNowTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function appendAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }
): AuditLogEntry[] {
  const current = getAuditLogs();
  const nextEntry: AuditLogEntry = {
    id: `aud-${Date.now().toString().slice(-5)}`,
    timestamp: formatNowTimestamp(),
    ipAddress: entry.ipAddress || '10.24.18.42',
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    target: entry.target,
    category: entry.category,
    severity: entry.severity,
    details: entry.details,
  };
  const next = [nextEntry, ...current];
  writeJson(STORAGE_KEYS.AUDIT_LOGS, next);
  return next;
}
