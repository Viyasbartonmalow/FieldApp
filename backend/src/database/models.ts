/**
 * TypeScript Models - Database Entity Types
 * These interfaces correspond to database tables for type safety
 */

// =====================================================
// USER MANAGEMENT MODELS
// =====================================================

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Record<string, any>
  is_system_role: boolean
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface Company {
  id: string
  name: string
  registration_number?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  industry?: string
  subscription_tier: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  language_preference: string
  role_id: string
  company_id: string
  is_locked: boolean
  last_login?: Date
  login_attempts: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// PROJECT MANAGEMENT MODELS
// =====================================================

export interface Project {
  id: string
  company_id: string
  name: string
  description?: string
  project_code?: string
  location?: string
  start_date: Date
  end_date?: Date
  project_manager_id?: string
  status: string
  region?: string
  business_unit?: string
  budget_amount?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface ProjectTeam {
  id: string
  project_id: string
  user_id: string
  role_on_project?: string
  start_date: Date
  end_date?: Date
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// PTP MODELS
// =====================================================

export interface PTP {
  id: string
  project_id: string
  foreman_id: string
  title: string
  description?: string
  ptp_date: Date
  status: string
  daily_copy_number: number
  submitted_at?: Date
  submitted_by?: string
  reviewed_at?: Date
  reviewed_by?: string
  approved_at?: Date
  approved_by?: string
  shift_start_time?: string
  shift_end_time?: string
  weather_conditions?: string
  site_conditions?: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface Activity {
  id: string
  name: string
  category: string
  description?: string
  risk_level?: string
  requires_supervision: boolean
  permits_required?: string[]
  ppe_required?: string[]
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPActivity {
  id: string
  ptp_id: string
  activity_id: string
  is_applicable: boolean
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// CONTROL MEASURES MODELS
// =====================================================

export interface ControlMeasureCategory {
  id: string
  name: string
  description?: string
  icon_name?: string
  display_order?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface ControlMeasure {
  id: string
  category_id: string
  name: string
  description?: string
  requires_input: boolean
  input_label?: string
  input_unit?: string
  display_order?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPControlMeasure {
  id: string
  ptp_id: string
  category_id: string
  is_applicable: boolean
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPControlItem {
  id: string
  ptp_control_measure_id: string
  control_measure_id: string
  is_checked: boolean
  input_value?: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// PERMITS & REQUIREMENTS MODELS
// =====================================================

export interface PermitType {
  id: string
  name: string
  description?: string
  requires_documentation: boolean
  requires_approval: boolean
  approval_lead_time_days?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPPermit {
  id: string
  ptp_id: string
  permit_type_id: string
  is_applicable: boolean
  is_selected: boolean
  permit_number?: string
  issued_date?: Date
  expiry_date?: Date
  issued_by?: string
  document_url?: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface ChecklistTemplate {
  id: string
  name: string
  description?: string
  category?: string
  is_system_template: boolean
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface ChecklistItem {
  id: string
  checklist_template_id: string
  item_name: string
  description?: string
  is_required: boolean
  display_order?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPChecklist {
  id: string
  ptp_id: string
  checklist_template_id: string
  is_applicable: boolean
  is_selected: boolean
  completion_percentage: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPChecklistItem {
  id: string
  ptp_checklist_id: string
  checklist_item_id: string
  is_checked: boolean
  notes?: string
  checked_by?: string
  checked_at?: Date
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// PPE MODELS
// =====================================================

export interface PPECategory {
  id: string
  name: string
  description?: string
  icon_name?: string
  display_order?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PPEItem {
  id: string
  category_id: string
  name: string
  description?: string
  display_order?: number
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPPpe {
  id: string
  ptp_id: string
  ppe_category_id: string
  is_applicable: boolean
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPPpeItem {
  id: string
  ptp_ppe_id: string
  ppe_item_id: string
  is_selected: boolean
  quantity: number
  notes?: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// CREW MANAGEMENT MODELS
// =====================================================

export interface PTPCrew {
  id: string
  ptp_id: string
  user_id: string
  role_on_site?: string
  assigned_date: Date
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface CrewSignIn {
  id: string
  ptp_id: string
  user_id: string
  sign_in_time: Date
  sign_out_time?: Date
  duration_minutes?: number
  comments?: string
  acknowledged: boolean
  acknowledged_at?: Date
  signed_by_foreman: boolean
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// SIGNATURES & APPROVALS MODELS
// =====================================================

export interface PTPSignature {
  id: string
  ptp_id: string
  signer_id: string
  signature_data: string
  signature_type: string
  signed_at: Date
  ip_address?: string
  device_info?: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface PTPReviewComment {
  id: string
  ptp_id: string
  reviewer_id: string
  comment_text: string
  comment_type: string
  severity?: string
  category?: string
  status: string
  resolved_at?: Date
  resolved_by?: string
  created_at: Date
  updated_at: Date
  is_active: boolean
}

// =====================================================
// INCIDENT & SAFETY MODELS
// =====================================================

export interface IncidentReport {
  id: string
  ptp_id?: string
  project_id: string
  incident_type?: string
  description: string
  incident_date: Date
  incident_time?: string
  severity?: string
  injured_person_id?: string
  injury_type?: string
  reported_by: string
  reported_at: Date
  investigation_status: string
  investigation_notes?: string
  corrective_actions?: string
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

export interface EndOfDayClosure {
  id: string
  ptp_id: string
  foreman_id: string
  closure_date: Date
  tools_cleaned?: boolean
  permits_closed?: boolean
  permits_closed_by?: string
  incidents_reported?: boolean
  incident_description?: string
  incident_reported?: boolean
  incident_reported_to?: string
  incident_report_id?: string
  crew_acknowledged_count?: number
  weather_conditions?: string
  site_conditions_end?: string
  notes?: string
  signed_at: Date
  created_at: Date
  created_by?: string
  updated_at: Date
  updated_by?: string
  is_active: boolean
}

// =====================================================
// AUDIT & LOGGING MODELS
// =====================================================

export interface AuditLog {
  id: string
  user_id?: string
  entity_type: string
  entity_id?: string
  action: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: Date
}

export interface PTPStatusHistory {
  id: string
  ptp_id: string
  old_status?: string
  new_status: string
  status_changed_by?: string
  status_changed_reason?: string
  created_at: Date
}

// =====================================================
// COMPOSITE/AGGREGATE MODELS
// =====================================================

export interface PTPDetail extends PTP {
  project?: Project
  foreman?: User
  activities?: PTPActivity[]
  controlMeasures?: PTPControlMeasure[]
  permits?: PTPPermit[]
  checklists?: PTPChecklist[]
  ppe?: PTPPpe[]
  crew?: PTPCrew[]
  signature?: PTPSignature
  comments?: PTPReviewComment[]
  statusHistory?: PTPStatusHistory[]
}

export interface UserDetail extends User {
  role?: Role
  company?: Company
  projects?: ProjectTeam[]
}
