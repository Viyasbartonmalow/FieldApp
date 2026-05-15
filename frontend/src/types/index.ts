// Auth Types
export type UserRole = 'admin' | 'foreman' | 'superintendent' | 'crew' | 'reviewer'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  company: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthCredentials {
  email: string
  password: string
}

// PTP Types
export interface PTPV2 {
  id: string
  projectId: string
  siteId: string
  crewId: string
  title: string
  description: string
  date: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  hazardsIdentified: Hazard[]
  controlMeasures: ControlMeasure[]
  ppeRequired: PPEItem[]
  participantCount: number
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Hazard {
  id: string
  description: string
  category: string
  severity: 'low' | 'medium' | 'high'
  controlMeasures: string[]
}

export interface ControlMeasure {
  id: string
  description: string
  type: 'engineering' | 'administrative' | 'ppe'
}

export interface PPEItem {
  id: string
  name: string
  quantity: number
  isRequired: boolean
}

// API Response Type
export interface ApiResponse<T> {
  success: boolean
  status: number
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
