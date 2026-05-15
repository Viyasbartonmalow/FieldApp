import { Router, Request, Response } from 'express'
import { z } from 'zod'
import authService from '@/services/auth.service'
import { asyncHandler, AppError } from '@/middleware/errorHandler'
import { authenticate } from '@/middleware/auth'
import logger from '@/utils/logger'

const router = Router()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password required'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  roleId: z.string().uuid('Valid role ID required'),
  companyId: z.string().uuid('Valid company ID required'),
})

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
})

/**
 * POST /api/v1/auth/login
 * Login user with email and password
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body)

    const { user, tokens } = await authService.login({
      email: body.email,
      password: body.password,
    })

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        user: userWithoutPassword,
        tokens,
      },
      message: 'Login successful',
    })
  })
)

/**
 * POST /api/v1/auth/register
 * Register new user
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body)

    const user = await authService.register({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      roleId: body.roleId,
      companyId: body.companyId,
    })

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      status: 201,
      data: { user: userWithoutPassword },
      message: 'Registration successful',
    })
  })
)

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const body = refreshTokenSchema.parse(req.body)

    const { accessToken, expiresIn } = await authService.refreshAccessToken(body.refreshToken)

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        accessToken,
        expiresIn,
      },
      message: 'Token refreshed successfully',
    })
  })
)

/**
 * POST /api/v1/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = changePasswordSchema.parse(req.body)
    const userId = (req as any).user.userId

    await authService.changePassword(userId, body.oldPassword, body.newPassword)

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Password changed successfully',
    })
  })
)

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('User logged out', { userId: (req as any).user.userId })

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Logout successful',
    })
  })
)

/**
 * GET /api/v1/auth/verify
 * Verify current token
 */
router.get(
  '/verify',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      message: 'Token is valid',
    })
  })
)

export default router
