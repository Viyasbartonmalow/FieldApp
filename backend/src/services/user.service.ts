/**
 * User Service
 * Handles user-related business logic
 */

import { User } from '@/database/models'
import { repositories } from '@/database/repositories'
import { AppError } from '@/middleware/errorHandler'
import logger from '@/utils/logger'
import { query } from '@/database'

export class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<User> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    return user
  }

  /**
   * Get all users in company
   */
  async getUsersByCompany(companyId: string, limit: number = 50, offset: number = 0): Promise<{
    data: User[]
    total: number
  }> {
    const result = await repositories.user.findWithPagination(
      Math.ceil(offset / limit) + 1,
      limit,
      { company_id: companyId, is_active: true }
    )

    return {
      data: result.data,
      total: result.total,
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    return repositories.user.findByRole(roleId)
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string
      lastName?: string
      phone?: string
      avatarUrl?: string
      languagePreference?: string
    }
  ): Promise<User> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    const updateData: any = {}
    if (data.firstName) updateData.first_name = data.firstName
    if (data.lastName) updateData.last_name = data.lastName
    if (data.phone) updateData.phone = data.phone
    if (data.avatarUrl) updateData.avatar_url = data.avatarUrl
    if (data.languagePreference) updateData.language_preference = data.languagePreference

    const updated = await repositories.user.update(userId, updateData)

    logger.info(`User profile updated: ${userId}`)

    return updated
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string, requestingUserId: string): Promise<void> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Prevent self-deactivation
    if (userId === requestingUserId) {
      throw new AppError('Cannot deactivate your own account', 403, 'USER_CANNOT_DEACTIVATE_SELF')
    }

    await repositories.user.update(userId, { is_active: false } as any)

    logger.info(`User deactivated: ${userId}`, { requestingUserId })
  }

  /**
   * Reactivate user account
   */
  async reactivateUser(userId: string): Promise<User> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    const updated = await repositories.user.update(userId, { is_active: true } as any)

    logger.info(`User reactivated: ${userId}`)

    return updated
  }

  /**
   * Lock user account
   */
  async lockUser(userId: string): Promise<User> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    const updated = await repositories.user.update(userId, { is_locked: true } as any)

    logger.info(`User locked: ${userId}`)

    return updated
  }

  /**
   * Unlock user account
   */
  async unlockUser(userId: string): Promise<User> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    const updated = await repositories.user.update(
      userId,
      { is_locked: false, login_attempts: 0 } as any
    )

    logger.info(`User unlocked: ${userId}`)

    return updated
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string): Promise<any[]> {
    try {
      const sql = `
        SELECT p.* FROM project p
        JOIN project_team pt ON p.id = pt.project_id
        WHERE pt.user_id = $1 AND p.is_active = true
        ORDER BY p.created_at DESC
      `
      const result = await query(sql, [userId])
      return result.rows
    } catch (error) {
      logger.error('Error fetching user projects', error)
      return []
    }
  }

  /**
   * Get user's recent PTPs
   */
  async getUserRecentPTPs(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const sql = `
        SELECT p.* FROM ptp p
        WHERE p.foreman_id = $1 AND p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT $2
      `
      const result = await query(sql, [userId, limit])
      return result.rows
    } catch (error) {
      logger.error('Error fetching user PTPs', error)
      return []
    }
  }
}

export default new UserService()
