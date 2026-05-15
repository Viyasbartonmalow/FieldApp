import { Router, Request, Response } from 'express'
import { z } from 'zod'
import userService from '@/services/user.service'
import { asyncHandler } from '@/middleware/errorHandler'
import { authenticate } from '@/middleware/auth'

const router = Router()

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  languagePreference: z.enum(['EN', 'ES']).optional(),
})

/**
 * GET /api/v1/users/me
 * Get current authenticated user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId
    const user = await userService.getUserProfile(userId)

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      status: 200,
      data: userWithoutPassword,
      message: 'Profile retrieved successfully',
    })
  })
)

/**
 * PUT /api/v1/users/me
 * Update current user profile
 */
router.put(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = updateProfileSchema.parse(req.body)
    const userId = (req as any).user.userId

    const user = await userService.updateProfile(userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatarUrl: body.avatarUrl,
      languagePreference: body.languagePreference,
    })

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      status: 200,
      data: userWithoutPassword,
      message: 'Profile updated successfully',
    })
  })
)

/**
 * GET /api/v1/users
 * List all users (admin only or by company)
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId, roleId, limit = '50', offset = '0' } = req.query

    if (!companyId) {
      res.status(400).json({
        success: false,
        status: 400,
        message: 'Company ID is required',
        errors: { companyId: ['Company ID is required'] },
      })
      return
    }

    const result = await userService.getUsersByCompany(
      companyId as string,
      parseInt(limit as string),
      parseInt(offset as string)
    )

    // Remove sensitive data from all users
    const users = result.data.map(({ password_hash, ...rest }) => rest)

    res.status(200).json({
      success: true,
      status: 200,
      data: users,
      pagination: {
        total: result.total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
      message: 'Users retrieved successfully',
    })
  })
)

/**
 * GET /api/v1/users/:userId
 * Get user by ID (admin only)
 */
router.get(
  '/:userId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserProfile(req.params.userId)

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      status: 200,
      data: userWithoutPassword,
      message: 'User retrieved successfully',
    })
  })
)

/**
 * GET /api/v1/users/:userId/projects
 * Get user's projects
 */
router.get(
  '/:userId/projects',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const projects = await userService.getUserProjects(req.params.userId)

    res.status(200).json({
      success: true,
      status: 200,
      data: projects,
      message: 'Projects retrieved successfully',
    })
  })
)

/**
 * GET /api/v1/users/:userId/ptps
 * Get user's recent PTPs
 */
router.get(
  '/:userId/ptps',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = '10' } = req.query
    const ptps = await userService.getUserRecentPTPs(req.params.userId, parseInt(limit as string))

    res.status(200).json({
      success: true,
      status: 200,
      data: ptps,
      message: 'PTPs retrieved successfully',
    })
  })
)

export default router
