-- PHASE 2: Database Schema - Initial Migration
-- PostgreSQL 13+
-- This migration creates all core tables for the Field App

-- =====================================================
-- 1. CORE TABLES: User Management
-- =====================================================

CREATE TABLE role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES role(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES role(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_role_name ON role(name);

-- Insert default roles
INSERT INTO role (name, description, permissions, is_system_role) VALUES
  ('Field Worker', 'Basic field operations access', '{"view_own_ptp": true, "sign_in": true}', true),
  ('Foreman', 'Create and manage PTPs', '{"create_ptp": true, "submit_ptp": true, "view_dashboard": true}', true),
  ('Safety Reviewer', 'Review and approve PTPs', '{"review_ptp": true, "approve_ptp": true, "view_all_ptp": true}', true),
  ('Project Manager', 'Project oversight', '{"view_dashboard": true, "view_all_ptp": true, "generate_reports": true}', true),
  ('Administrator', 'Full system access', '{"admin": true}', true);

CREATE TABLE company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(50) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  industry VARCHAR(100),
  subscription_tier VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES company(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES company(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_company_name ON company(name);

CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  language_preference VARCHAR(5) DEFAULT 'EN',
  role_id UUID NOT NULL REFERENCES role(id),
  company_id UUID NOT NULL REFERENCES company(id),
  is_locked BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  login_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_company_id ON "user"(company_id);
CREATE INDEX idx_user_role_id ON "user"(role_id);
CREATE INDEX idx_user_is_active ON "user"(is_active);

-- =====================================================
-- 2. PROJECT MANAGEMENT TABLES
-- =====================================================

CREATE TABLE project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_code VARCHAR(50) UNIQUE,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  project_manager_id UUID REFERENCES "user"(id),
  status VARCHAR(50) DEFAULT 'Active',
  region VARCHAR(100),
  business_unit VARCHAR(100),
  budget_amount DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_project_company_id ON project(company_id);
CREATE INDEX idx_project_code ON project(project_code);
CREATE INDEX idx_project_status ON project(status);

CREATE TABLE project_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project(id),
  user_id UUID NOT NULL REFERENCES "user"(id),
  role_on_project VARCHAR(50),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_team_project_id ON project_team(project_id);
CREATE INDEX idx_project_team_user_id ON project_team(user_id);

-- =====================================================
-- 3. PTP (PRE-TASK PLAN) CORE TABLES
-- =====================================================

CREATE TABLE ptp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project(id),
  foreman_id UUID NOT NULL REFERENCES "user"(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ptp_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  daily_copy_number INT DEFAULT 0,
  submitted_at TIMESTAMP,
  submitted_by UUID REFERENCES "user"(id),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES "user"(id),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES "user"(id),
  shift_start_time TIME,
  shift_end_time TIME,
  weather_conditions VARCHAR(255),
  site_conditions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_ptp_project_id ON ptp(project_id);
CREATE INDEX idx_ptp_foreman_id ON ptp(foreman_id);
CREATE INDEX idx_ptp_ptp_date ON ptp(ptp_date);
CREATE INDEX idx_ptp_status ON ptp(status);
CREATE INDEX idx_ptp_submitted_by ON ptp(submitted_by);
CREATE INDEX idx_ptp_reviewed_by ON ptp(reviewed_by);

-- =====================================================
-- 4. ACTIVITIES & CONTROL MEASURES TABLES
-- =====================================================

CREATE TABLE activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  risk_level VARCHAR(20),
  requires_supervision BOOLEAN,
  permits_required TEXT[],
  ppe_required TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

INSERT INTO activity (name, category, description, risk_level, requires_supervision) VALUES
  ('Overhead Utilities Work', 'Utilities', 'Work near overhead power lines and utilities', 'High', true),
  ('Crane Operation', 'Equipment', 'Operation and movement of crane/lifting equipment', 'High', true),
  ('Excavation', 'Earthwork', 'Digging and excavation work', 'High', true),
  ('Electrical Work', 'Electrical', 'Electrical installation and maintenance', 'High', true),
  ('Underground Utilities', 'Utilities', 'Work on underground utilities', 'High', true);

CREATE INDEX idx_activity_category ON activity(category);
CREATE INDEX idx_activity_name ON activity(name);

CREATE TABLE ptp_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activity(id),
  is_applicable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ptp_id, activity_id)
);

CREATE INDEX idx_ptp_activity_ptp_id ON ptp_activity(ptp_id);
CREATE INDEX idx_ptp_activity_activity_id ON ptp_activity(activity_id);

CREATE TABLE control_measure_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(100),
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

INSERT INTO control_measure_category (name, description, display_order) VALUES
  ('Overhead Utilities', 'Controls for overhead utility work', 1),
  ('Crane/Lifting Equipment', 'Controls for crane operations', 2),
  ('Excavations', 'Controls for excavation work', 3),
  ('Electrical', 'Controls for electrical work', 4),
  ('Underground Utilities', 'Controls for underground utility work', 5);

CREATE TABLE control_measure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES control_measure_category(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  requires_input BOOLEAN DEFAULT false,
  input_label VARCHAR(255),
  input_unit VARCHAR(50),
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE ptp_control_measure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES control_measure_category(id),
  is_applicable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ptp_id, category_id)
);

CREATE INDEX idx_ptp_control_ptp_id ON ptp_control_measure(ptp_id);
CREATE INDEX idx_ptp_control_category_id ON ptp_control_measure(category_id);

CREATE TABLE ptp_control_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_control_measure_id UUID NOT NULL REFERENCES ptp_control_measure(id) ON DELETE CASCADE,
  control_measure_id UUID NOT NULL REFERENCES control_measure(id),
  is_checked BOOLEAN DEFAULT false,
  input_value VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_ptp_control_item_control_id ON ptp_control_item(ptp_control_measure_id);

-- =====================================================
-- 5. PERMITS & REQUIREMENTS TABLES
-- =====================================================

CREATE TABLE permit_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  requires_documentation BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  approval_lead_time_days INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

INSERT INTO permit_type (name, description, requires_approval, approval_lead_time_days) VALUES
  ('Traffic Permit', 'Required for work affecting traffic', true, 5),
  ('Confined Space Permit', 'Required for confined space entry', true, 3),
  ('Hot Work Permit', 'Required for hot work operations', true, 1),
  ('Ground Disturbance Permit', 'Required for ground work over 12 inches', true, 5),
  ('Pressure Testing Permit', 'Required for pressure testing', true, 2),
  ('ICRA Permit', 'Environmental/ICRA assessment', true, 3),
  ('Guard Rail Removal Permit', 'Required for guard rail removal', true, 2),
  ('Excavation Permit', 'Required for excavation operations', true, 3),
  ('Energy Isolation/LOTO Permit', 'Lockout/Tagout procedures', true, 1);

CREATE INDEX idx_permit_type_name ON permit_type(name);

CREATE TABLE ptp_permit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  permit_type_id UUID NOT NULL REFERENCES permit_type(id),
  is_applicable BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT false,
  permit_number VARCHAR(100),
  issued_date DATE,
  expiry_date DATE,
  issued_by VARCHAR(255),
  document_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ptp_id, permit_type_id)
);

CREATE INDEX idx_ptp_permit_ptp_id ON ptp_permit(ptp_id);
CREATE INDEX idx_ptp_permit_type_id ON ptp_permit(permit_type_id);

CREATE TABLE checklist_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  is_system_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

INSERT INTO checklist_template (name, description, category, is_system_template) VALUES
  ('Backfill Checklist', 'Pre-backfill verification items', 'Excavation', true),
  ('Demo Checklist', 'Demolition safety verification', 'Demolition', true),
  ('Exploratory Zone Checklist', 'Exploratory zone safety items', 'Utility', true),
  ('Utility Installation Checklist', 'Installation verification items', 'Utility', true),
  ('Cranes Checklist', 'Crane operation verification', 'Equipment', true),
  ('Pressure Testing Checklist', 'Pressure test verification', 'Testing', true),
  ('Hydro Checklist', 'Hydro operations verification', 'Hydrology', true),
  ('Excavation Zone Checklist', 'Excavation safety items', 'Excavation', true);

CREATE TABLE checklist_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_template_id UUID NOT NULL REFERENCES checklist_template(id),
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_checklist_item_template_id ON checklist_item(checklist_template_id);

CREATE TABLE ptp_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  checklist_template_id UUID NOT NULL REFERENCES checklist_template(id),
  is_applicable BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT false,
  completion_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ptp_id, checklist_template_id)
);

CREATE INDEX idx_ptp_checklist_ptp_id ON ptp_checklist(ptp_id);
CREATE INDEX idx_ptp_checklist_template_id ON ptp_checklist(checklist_template_id);

CREATE TABLE ptp_checklist_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_checklist_id UUID NOT NULL REFERENCES ptp_checklist(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES checklist_item(id),
  is_checked BOOLEAN DEFAULT false,
  notes TEXT,
  checked_by UUID REFERENCES "user"(id),
  checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_ptp_checklist_item_checklist_id ON ptp_checklist_item(ptp_checklist_id);
CREATE INDEX idx_ptp_checklist_item_item_id ON ptp_checklist_item(checklist_item_id);

-- =====================================================
-- 6. PPE (PERSONAL PROTECTIVE EQUIPMENT) TABLES
-- =====================================================

CREATE TABLE ppe_category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(100),
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

INSERT INTO ppe_category (name, description, display_order) VALUES
  ('Head Protection', 'Hard hats, caps, visors', 1),
  ('Hand Protection', 'Gloves, arm protection', 2),
  ('Eye Protection', 'Safety glasses, goggles, face shields', 3),
  ('Respiratory Protection', 'Masks, respirators, SCBA', 4),
  ('Foot Protection', 'Safety boots, shoe covers', 5),
  ('Special Clothing', 'Coveralls, vests, suits', 6);

CREATE TABLE ppe_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES ppe_category(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(category_id, name)
);

CREATE TABLE ptp_ppe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  ppe_category_id UUID NOT NULL REFERENCES ppe_category(id),
  is_applicable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ptp_id, ppe_category_id)
);

CREATE INDEX idx_ptp_ppe_ptp_id ON ptp_ppe(ptp_id);
CREATE INDEX idx_ptp_ppe_category_id ON ptp_ppe(ppe_category_id);

CREATE TABLE ptp_ppe_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_ppe_id UUID NOT NULL REFERENCES ptp_ppe(id) ON DELETE CASCADE,
  ppe_item_id UUID NOT NULL REFERENCES ppe_item(id),
  is_selected BOOLEAN DEFAULT false,
  quantity INT DEFAULT 1,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_ptp_ppe_item_ptp_ppe_id ON ptp_ppe_item(ptp_ppe_id);
CREATE INDEX idx_ptp_ppe_item_ppe_item_id ON ptp_ppe_item(ppe_item_id);

-- =====================================================
-- 7. CREW MANAGEMENT TABLES
-- =====================================================

CREATE TABLE ptp_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id),
  role_on_site VARCHAR(100),
  assigned_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(ptp_id, user_id)
);

CREATE INDEX idx_ptp_crew_ptp_id ON ptp_crew(ptp_id);
CREATE INDEX idx_ptp_crew_user_id ON ptp_crew(user_id);

CREATE TABLE crew_sign_in (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id),
  user_id UUID NOT NULL REFERENCES "user"(id),
  sign_in_time TIMESTAMP NOT NULL,
  sign_out_time TIMESTAMP,
  duration_minutes INT,
  comments TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  signed_by_foreman BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_crew_sign_in_ptp_id ON crew_sign_in(ptp_id);
CREATE INDEX idx_crew_sign_in_user_id ON crew_sign_in(user_id);
CREATE INDEX idx_crew_sign_in_sign_in_time ON crew_sign_in(sign_in_time);

-- =====================================================
-- 8. SIGNATURES & APPROVALS
-- =====================================================

CREATE TABLE ptp_signature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL UNIQUE REFERENCES ptp(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES "user"(id),
  signature_data TEXT NOT NULL,
  signature_type VARCHAR(50) DEFAULT 'SVG',
  signed_at TIMESTAMP NOT NULL,
  ip_address INET,
  device_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_ptp_signature_ptp_id ON ptp_signature(ptp_id);
CREATE INDEX idx_ptp_signature_signer_id ON ptp_signature(signer_id);

CREATE TABLE ptp_review_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES "user"(id),
  comment_text TEXT NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'Feedback',
  severity VARCHAR(50),
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Open',
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES "user"(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_ptp_review_comment_ptp_id ON ptp_review_comment(ptp_id);
CREATE INDEX idx_ptp_review_comment_reviewer_id ON ptp_review_comment(reviewer_id);
CREATE INDEX idx_ptp_review_comment_status ON ptp_review_comment(status);

-- =====================================================
-- 9. INCIDENT & SAFETY TABLES
-- =====================================================

CREATE TABLE incident_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID REFERENCES ptp(id),
  project_id UUID NOT NULL REFERENCES project(id),
  incident_type VARCHAR(100),
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  incident_time TIME,
  severity VARCHAR(50),
  injured_person_id UUID REFERENCES "user"(id),
  injury_type VARCHAR(255),
  reported_by UUID NOT NULL REFERENCES "user"(id),
  reported_at TIMESTAMP NOT NULL,
  investigation_status VARCHAR(50) DEFAULT 'Open',
  investigation_notes TEXT,
  corrective_actions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_incident_report_project_id ON incident_report(project_id);
CREATE INDEX idx_incident_report_ptp_id ON incident_report(ptp_id);
CREATE INDEX idx_incident_report_reported_by ON incident_report(reported_by);
CREATE INDEX idx_incident_report_incident_date ON incident_report(incident_date);

CREATE TABLE end_of_day_closure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL UNIQUE REFERENCES ptp(id),
  foreman_id UUID NOT NULL REFERENCES "user"(id),
  closure_date DATE NOT NULL,
  tools_cleaned BOOLEAN,
  permits_closed BOOLEAN,
  permits_closed_by VARCHAR(255),
  incidents_reported BOOLEAN,
  incident_description TEXT,
  incident_reported BOOLEAN,
  incident_reported_to VARCHAR(255),
  incident_report_id UUID REFERENCES incident_report(id),
  crew_acknowledged_count INT,
  weather_conditions TEXT,
  site_conditions_end TEXT,
  notes TEXT,
  signed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES "user"(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES "user"(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_end_of_day_closure_ptp_id ON end_of_day_closure(ptp_id);
CREATE INDEX idx_end_of_day_closure_foreman_id ON end_of_day_closure(foreman_id);
CREATE INDEX idx_end_of_day_closure_closure_date ON end_of_day_closure(closure_date);

-- =====================================================
-- 10. AUDIT & LOGGING
-- =====================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "user"(id),
  entity_type VARCHAR(100),
  entity_id UUID,
  action VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

CREATE TABLE ptp_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptp_id UUID NOT NULL REFERENCES ptp(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  status_changed_by UUID REFERENCES "user"(id),
  status_changed_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ptp_status_history_ptp_id ON ptp_status_history(ptp_id);
CREATE INDEX idx_ptp_status_history_created_at ON ptp_status_history(created_at);
