import { Timestamp } from "firebase/firestore";

export type AuditLogTimestamp = Timestamp | Date | string | number | { seconds: number; nanoseconds?: number; _seconds?: number; _nanoseconds?: number } | null | undefined;

export interface AuditLog {
  id?: string;
  type?: string;
  action?: string;
  adminId?: string;
  adminEmail?: string;
  targetId?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown> | string | null;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: AuditLogTimestamp;
  createdAt?: AuditLogTimestamp;
}
