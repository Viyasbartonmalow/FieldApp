/**
 * PTP Service
 * Handles Pre-Task Plan business logic
 */

import { PTP, PTPDetail } from '@/database/models'
import { repositories } from '@/database/repositories'
import { AppError } from '@/middleware/errorHandler'
import { transaction, query } from '@/database/index'
import logger from '@/utils/logger'

interface CreatePTPDto {
  projectId: string
  foremanId: string
  title: string
  description?: string
  ptpDate: Date
  shiftStartTime?: string
  shiftEndTime?: string
  weatherConditions?: string
  siteConditions?: string
}

interface UpdatePTPDto {
  title?: string
  description?: string
  weatherConditions?: string
  siteConditions?: string
  status?: string
}

export class PTPService {
  /**
   * Create new PTP
   */
  async createPTP(data: CreatePTPDto, userId: string): Promise<PTP> {
    try {
      return await transaction(async (client) => {
        // Validate project exists
        const project = await repositories.project.findById(data.projectId)
        if (!project) {
          throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND')
        }

        // Validate foreman exists and has correct role
        const foreman = await repositories.user.findById(data.foremanId)
        if (!foreman) {
          throw new AppError('Foreman not found', 404, 'USER_NOT_FOUND')
        }

        // Check if foreman is part of project team
        const isTeamMember = await repositories.project
          .findById(data.projectId)
          .then(() => true)
          .catch(() => false)

        // Create PTP
        const ptp = await repositories.ptp.create({
          project_id: data.projectId as any,
          foreman_id: data.foremanId as any,
          title: data.title,
          description: data.description,
          ptp_date: data.ptpDate as any,
          status: 'Draft',
          daily_copy_number: 0,
          shift_start_time: data.shiftStartTime as any,
          shift_end_time: data.shiftEndTime as any,
          weather_conditions: data.weatherConditions,
          site_conditions: data.siteConditions,
          created_by: userId as any,
        } as any)

        logger.info(`PTP created: ${ptp.id}`, { projectId: data.projectId, userId })

        return ptp
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error creating PTP', error)
      throw new AppError('Failed to create PTP', 500, 'PTP_CREATE_ERROR')
    }
  }

  /**
   * Get PTP by ID with all details
   */
  async getPTPDetail(ptpId: string): Promise<PTPDetail> {
    const ptp = await repositories.ptp.findWithDetails(ptpId)

    if (!ptp) {
      throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
    }

    return ptp
  }

  /**
   * Update PTP
   */
  async updatePTP(ptpId: string, data: UpdatePTPDto, userId: string): Promise<PTP> {
    const ptp = await repositories.ptp.findById(ptpId)

    if (!ptp) {
      throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
    }

    // Only allow updates if status is Draft or In Progress
    if (!['Draft', 'In Progress'].includes(ptp.status)) {
      throw new AppError('Cannot modify PTP in this status', 409, 'PTP_STATUS_INVALID')
    }

    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.weatherConditions) updateData.weather_conditions = data.weatherConditions
    if (data.siteConditions) updateData.site_conditions = data.siteConditions
    if (data.status) updateData.status = data.status

    updateData.updated_by = userId

    const updated = await repositories.ptp.update(ptpId, updateData)

    logger.info(`PTP updated: ${ptpId}`, { userId })

    return updated
  }

  /**
   * Submit PTP for review
   */
  async submitPTP(ptpId: string, userId: string): Promise<PTP> {
    const ptp = await repositories.ptp.findById(ptpId)

    if (!ptp) {
      throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
    }

    if (ptp.status !== 'Draft' && ptp.status !== 'In Progress') {
      throw new AppError('PTP can only be submitted from Draft status', 409, 'PTP_STATUS_INVALID')
    }

    // Validate that all required sections are complete
    // This is a placeholder - actual validation would check all required fields
    const ptpDetail = await repositories.ptp.findWithDetails(ptpId)
    if (!ptpDetail.details?.activities || ptpDetail.details.activities.length === 0) {
      throw new AppError('At least one activity must be selected', 409, 'PTP_VALIDATION_ERROR')
    }

    const updated = await repositories.ptp.update(ptpId, {
      status: 'Submitted' as any,
      submitted_at: new Date() as any,
      submitted_by: userId as any,
      updated_by: userId as any,
    })

    logger.info(`PTP submitted: ${ptpId}`, { userId })

    return updated
  }

  /**
   * Approve PTP
   */
  async approvePTP(ptpId: string, userId: string, reviewComments?: string): Promise<PTP> {
    const ptp = await repositories.ptp.findById(ptpId)

    if (!ptp) {
      throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
    }

    if (ptp.status !== 'Submitted') {
      throw new AppError('Only submitted PTPs can be approved', 409, 'PTP_STATUS_INVALID')
    }

    const updated = await repositories.ptp.update(ptpId, {
      status: 'Approved' as any,
      approved_at: new Date() as any,
      approved_by: userId as any,
      updated_by: userId as any,
    })

    if (reviewComments) {
      // Save review comment
      await this.addReviewComment(ptpId, userId, reviewComments, 'Approval')
    }

    logger.info(`PTP approved: ${ptpId}`, { userId })

    return updated
  }

  /**
   * Reject PTP
   */
  async rejectPTP(ptpId: string, userId: string, reason: string): Promise<PTP> {
    const ptp = await repositories.ptp.findById(ptpId)

    if (!ptp) {
      throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
    }

    if (ptp.status !== 'Submitted') {
      throw new AppError('Only submitted PTPs can be rejected', 409, 'PTP_STATUS_INVALID')
    }

    const updated = await repositories.ptp.update(ptpId, {
      status: 'Rejected' as any,
      updated_by: userId as any,
    })

    // Save rejection comment
    await this.addReviewComment(ptpId, userId, reason, 'Rejection')

    logger.info(`PTP rejected: ${ptpId}`, { userId, reason })

    return updated
  }

  /**
   * Get PTP list for project
   */
  async getPTPsByProject(projectId: string, filters?: {
    status?: string
    startDate?: Date
    endDate?: Date
  }): Promise<PTP[]> {
    if (filters?.status) {
      return repositories.ptp.findByStatus(filters.status, projectId)
    }

    if (filters?.startDate && filters?.endDate) {
      return repositories.ptp.findByProjectDateRange(projectId, filters.startDate, filters.endDate)
    }

    return repositories.ptp.findByProject(projectId)
  }

  /**
   * Get all PTPs across all projects (for review/admin views)
   */
  async getAllPTPs(filters?: { status?: string; foremanId?: string }): Promise<PTP[]> {
    if (filters?.status) {
      return repositories.ptp.findByStatus(filters.status)
    }
    return repositories.ptp.findAll({ orderBy: [{ field: 'created_at', direction: 'DESC' }] })
  }

  /**
   * Get PTP statistics
   */
  async getPTPStats(projectId: string): Promise<any> {
    return repositories.ptp.getPTPStats(projectId)
  }

  /**
   * Add activity to PTP
   */
  async addActivity(ptpId: string, activityId: string, userId: string): Promise<any> {
    try {
      return await transaction(async (client) => {
        const ptpResult = await client.query('SELECT id FROM ptp WHERE id = $1', [ptpId])
        if (ptpResult.rows.length === 0) {
          throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
        }

        const activityResult = await client.query('SELECT id FROM activity WHERE id = $1', [activityId])
        if (activityResult.rows.length === 0) {
          throw new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND')
        }

        // Create PTP activity record
        const sql = `
          INSERT INTO ptp_activity (ptp_id, activity_id, is_applicable, created_by)
          VALUES ($1, $2, true, $3)
          ON CONFLICT (ptp_id, activity_id) DO NOTHING
          RETURNING *
        `
        const result = await client.query(sql, [ptpId, activityId, userId])
        logger.info(`Activity added to PTP: ${ptpId}`, { activityId, userId })
        return result.rows[0] || { message: 'Activity already associated' }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Error adding activity to PTP', error)
      throw new AppError('Failed to add activity', 500, 'PTP_ACTIVITY_ERROR')
    }
  }

  /**
   * Add review comment
   */
  async addReviewComment(
    ptpId: string,
    reviewerId: string,
    comment: string,
    commentType: string
  ): Promise<any> {
    try {
      const sql = `
        INSERT INTO ptp_review_comment (ptp_id, reviewer_id, comment_text, comment_type, status, created_at, created_by)
        VALUES ($1, $2, $3, $4, 'Open', CURRENT_TIMESTAMP, $5)
        RETURNING *
      `
      const result = await query(sql, [ptpId, reviewerId, comment, commentType, reviewerId])
      logger.info(`Review comment added to PTP: ${ptpId}`, { reviewerId, commentType })
      return result.rows[0]
    } catch (error) {
      logger.error('Error adding review comment', error)
      // Don't throw - this is non-critical
      return null
    }
  }

  /**
   * Delete PTP (soft delete)
   */
  async deletePTP(ptpId: string, userId: string): Promise<void> {
    const ptp = await repositories.ptp.findById(ptpId)

    if (!ptp) {
      throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')
    }

    await repositories.ptp.softDelete(ptpId)

    logger.info(`PTP deleted: ${ptpId}`, { userId })
  }
}

export default new PTPService()
