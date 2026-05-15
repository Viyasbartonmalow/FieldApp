/**
 * Repository Implementations
 * Specific repositories for database entities with custom queries
 */

import { BaseRepository, FindOptions, PaginationResult } from '@/database/repository.base'
import { User, PTP, Project, Activity, PermitType, ChecklistTemplate, PPECategory, Role } from '@/database/models'
import { query } from '@/database'

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user')
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.executeQuery<User>(
      `SELECT * FROM ${this.tableName} WHERE email = $1 AND is_active = true`,
      [email]
    )
    return result[0] || null
  }

  async findByEmailWithRole(email: string): Promise<(User & { role: any }) | null> {
    const result = await this.executeQuery<User & { role: any }>(
      `
      SELECT u.*, r.name as "role" 
      FROM ${this.tableName} u
      JOIN role r ON u.role_id = r.id
      WHERE u.email = $1 AND u.is_active = true
      `,
      [email]
    )
    return result[0] || null
  }

  async findByCompany(companyId: string, options?: FindOptions): Promise<User[]> {
    return this.findAll({
      ...options,
      where: { company_id: companyId, is_active: true },
    })
  }

  async findByRole(roleId: string): Promise<User[]> {
    return this.findAll({
      where: { role_id: roleId, is_active: true },
    })
  }

  async incrementLoginAttempts(userId: string): Promise<User> {
    const sql = `
      UPDATE ${this.tableName} 
      SET login_attempts = login_attempts + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `
    return this.executeQuery<User>(sql, [userId]).then(rows => rows[0])
  }

  async resetLoginAttempts(userId: string): Promise<User> {
    const sql = `
      UPDATE ${this.tableName} 
      SET login_attempts = 0, last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `
    return this.executeQuery<User>(sql, [userId]).then(rows => rows[0])
  }
}

/**
 * Project Repository
 */
export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super('project')
  }

  async findByCompany(companyId: string): Promise<Project[]> {
    return this.findAll({
      where: { company_id: companyId, is_active: true },
    })
  }

  async findByCode(projectCode: string): Promise<Project | null> {
    const result = await this.executeQuery<Project>(
      `SELECT * FROM ${this.tableName} WHERE project_code = $1 AND is_active = true`,
      [projectCode]
    )
    return result[0] || null
  }

  async findWithTeam(projectId: string): Promise<any> {
    const result = await this.executeQuery(
      `
      SELECT 
        p.*,
        json_agg(json_build_object(
          'id', pt.id,
          'user_id', pt.user_id,
          'role', pt.role_on_project
        )) as team
      FROM ${this.tableName} p
      LEFT JOIN project_team pt ON p.id = pt.project_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id
      `,
      [projectId]
    )
    return result[0] || null
  }
}

/**
 * PTP Repository
 */
export class PTPRepository extends BaseRepository<PTP> {
  constructor() {
    super('ptp')
  }

  async findByProject(projectId: string): Promise<PTP[]> {
    return this.findAll({
      where: { project_id: projectId },
      orderBy: [{ field: 'ptp_date', direction: 'DESC' }],
    })
  }

  async findByForeman(foremanId: string, options?: FindOptions): Promise<PTP[]> {
    return this.findAll({
      ...options,
      where: { foreman_id: foremanId },
    })
  }

  async findByDate(date: Date): Promise<PTP[]> {
    const dateStr = date.toISOString().split('T')[0]
    return this.findAll({
      where: { ptp_date: dateStr },
    })
  }

  async findByStatus(status: string, projectId?: string): Promise<PTP[]> {
    const where: any = { status }
    if (projectId) where.project_id = projectId
    return this.findAll({
      where,
      orderBy: [{ field: 'created_at', direction: 'DESC' }],
    })
  }

  async findByProjectDateRange(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PTP[]> {
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE project_id = $1 
        AND ptp_date >= $2::date 
        AND ptp_date <= $3::date
        AND is_active = true
      ORDER BY ptp_date DESC
    `
    return this.executeQuery<PTP>(sql, [projectId, startStr, endStr])
  }

  async findWithDetails(ptpId: string): Promise<any> {
    const sql = `
      SELECT 
        p.*,
        json_build_object(
          'activities', (
            SELECT json_agg(json_build_object('id', pa.id, 'activity_id', pa.activity_id))
            FROM ptp_activity pa WHERE pa.ptp_id = p.id
          ),
          'permits', (
            SELECT json_agg(json_build_object('id', pp.id, 'permit_type_id', pp.permit_type_id))
            FROM ptp_permit pp WHERE pp.ptp_id = p.id
          ),
          'crew', (
            SELECT json_agg(json_build_object('id', pc.id, 'user_id', pc.user_id))
            FROM ptp_crew pc WHERE pc.ptp_id = p.id
          )
        ) as details
      FROM ${this.tableName} p
      WHERE p.id = $1
    `
    const result = await this.executeQuery<any>(sql, [ptpId])
    return result[0] || null
  }

  async getPTPStats(projectId: string): Promise<any> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM ${this.tableName}
      WHERE project_id = $1 AND is_active = true
    `
    const result = await this.executeQuery<any>(sql, [projectId])
    return result[0] || null
  }
}

/**
 * Activity Repository
 */
export class ActivityRepository extends BaseRepository<Activity> {
  constructor() {
    super('activity')
  }

  async findByCategory(category: string): Promise<Activity[]> {
    return this.findAll({
      where: { category, is_active: true },
    })
  }

  async findByRiskLevel(riskLevel: string): Promise<Activity[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE risk_level = $1 AND is_active = true`
    return this.executeQuery<Activity>(sql, [riskLevel])
  }
}

/**
 * Permit Type Repository
 */
export class PermitTypeRepository extends BaseRepository<PermitType> {
  constructor() {
    super('permit_type')
  }

  async findRequiresApproval(): Promise<PermitType[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE requires_approval = true AND is_active = true`
    return this.executeQuery<PermitType>(sql)
  }
}

/**
 * Checklist Template Repository
 */
export class ChecklistTemplateRepository extends BaseRepository<ChecklistTemplate> {
  constructor() {
    super('checklist_template')
  }

  async findSystemTemplates(): Promise<ChecklistTemplate[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE is_system_template = true AND is_active = true`
    return this.executeQuery<ChecklistTemplate>(sql)
  }

  async findByCategory(category: string): Promise<ChecklistTemplate[]> {
    return this.findAll({
      where: { category, is_active: true },
    })
  }

  async findWithItems(templateId: string): Promise<any> {
    const sql = `
      SELECT 
        ct.*,
        json_agg(json_build_object(
          'id', ci.id,
          'item_name', ci.item_name,
          'is_required', ci.is_required
        )) as items
      FROM ${this.tableName} ct
      LEFT JOIN checklist_item ci ON ct.id = ci.checklist_template_id
      WHERE ct.id = $1
      GROUP BY ct.id
    `
    const result = await this.executeQuery<any>(sql, [templateId])
    return result[0] || null
  }
}

/**
 * PPE Category Repository
 */
export class PPECategoryRepository extends BaseRepository<PPECategory> {
  constructor() {
    super('ppe_category')
  }

  async findWithItems(categoryId: string): Promise<any> {
    const sql = `
      SELECT 
        pc.*,
        json_agg(json_build_object(
          'id', pi.id,
          'name', pi.name,
          'description', pi.description
        )) as items
      FROM ${this.tableName} pc
      LEFT JOIN ppe_item pi ON pc.id = pi.category_id
      WHERE pc.id = $1 AND pc.is_active = true
      GROUP BY pc.id
    `
    const result = await this.executeQuery<any>(sql, [categoryId])
    return result[0] || null
  }

  async findAllWithItems(): Promise<any[]> {
    const sql = `
      SELECT 
        pc.*,
        json_agg(json_build_object(
          'id', pi.id,
          'name', pi.name,
          'display_order', pi.display_order
        ) ORDER BY pi.display_order) as items
      FROM ${this.tableName} pc
      LEFT JOIN ppe_item pi ON pc.id = pi.category_id AND pi.is_active = true
      WHERE pc.is_active = true
      GROUP BY pc.id
      ORDER BY pc.display_order
    `
    return this.executeQuery<any>(sql)
  }
}

/**
 * Role Repository
 */
export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super('role')
  }

  async findByName(name: string): Promise<Role | null> {
    const result = await this.executeQuery<Role>(
      `SELECT * FROM ${this.tableName} WHERE name = $1 AND is_active = true`,
      [name]
    )
    return result[0] || null
  }

  async findSystemRoles(): Promise<Role[]> {
    const sql = `SELECT * FROM ${this.tableName} WHERE is_system_role = true AND is_active = true`
    return this.executeQuery<Role>(sql)
  }
}

// Export all repositories
export const repositories = {
  user: new UserRepository(),
  project: new ProjectRepository(),
  ptp: new PTPRepository(),
  activity: new ActivityRepository(),
  permitType: new PermitTypeRepository(),
  checklistTemplate: new ChecklistTemplateRepository(),
  ppeCategory: new PPECategoryRepository(),
  role: new RoleRepository(),
}
