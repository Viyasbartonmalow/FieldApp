// Core type definitions - matching documentation exactly

export type UUID = string & { readonly __brand: 'UUID' };
export type DateTime = string & { readonly __brand: 'DateTime' };
export type Date = string; // YYYY-MM-DD

// User types
export type UserRole = 'Field Worker' | 'Foreman' | 'Safety Reviewer' | 'Project Manager' | 'Administrator';

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  company: Company;
  languagePreference: 'EN' | 'ES';
  createdAt: DateTime;
  updatedAt: DateTime;
  lastLogin?: DateTime;
  isActive: boolean;
}

export interface Company {
  id: UUID;
  name: string;
  registrationNumber?: string;
  industry?: string;
  subscriptionTier: string;
}

// PTP types
export type PTPStatus = 'In Progress' | 'Submitted' | 'Reviewed' | 'Flagged' | 'Closed';

export interface PTP {
  id: UUID;
  projectId: UUID;
  foremanId: UUID;
  title: string;
  description?: string;
  ptpDate: Date;
  status: PTPStatus;
  shiftStartTime?: string;
  shiftEndTime?: string;
  weatherConditions?: string;
  siteConditions?: string;
  submittedAt?: DateTime;
  submittedBy?: UUID;
  reviewedAt?: DateTime;
  reviewedBy?: UUID;
  approvedAt?: DateTime;
  approvedBy?: UUID;
  createdAt: DateTime;
  updatedAt: DateTime;
  isActive: boolean;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: DateTime;
}

// Auth types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends AuthToken {
  user: User;
}

// Database audit fields
export interface AuditFields {
  created_at: DateTime;
  created_by?: UUID;
  updated_at: DateTime;
  updated_by?: UUID;
  is_active: boolean;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
