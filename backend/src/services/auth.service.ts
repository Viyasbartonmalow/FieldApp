/**
 * Authentication Service
 * Handles user authentication, token generation, and authorization
 */

import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { User } from '@/database/models'
import { repositories } from '@/database/repositories'
import { AppError } from '@/middleware/errorHandler'
import logger from '@/utils/logger'

interface LoginCredentials {
  email: string
  password: string
}

interface TokenPayload {
  userId: string
  email: string
  role: string
  companyId: string
}

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{
    user: User
    tokens: { accessToken: string; refreshToken: string; expiresIn: number }
  }> {
    const { email, password } = credentials

    // Find user by email
    const user = await repositories.user.findByEmail(email)

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`)
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS')
    }

    // Check if user is locked
    if (user.is_locked) {
      logger.warn(`Login attempt on locked account: ${email}`)
      throw new AppError('Account is locked', 403, 'AUTH_ACCOUNT_LOCKED')
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash)

    if (!isPasswordValid) {
      // Increment login attempts
      await repositories.user.incrementLoginAttempts(user.id)
      logger.warn(`Failed login attempt for user: ${email}`)
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS')
    }

    // Reset login attempts on successful login
    await repositories.user.resetLoginAttempts(user.id)

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: '', // Will be fetched from role relationship if needed
      companyId: user.company_id,
    })

    logger.info(`User logged in: ${email}`)

    return {
      user,
      tokens,
    }
  }

  /**
   * Register new user
   */
  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    roleId: string
    companyId: string
  }): Promise<User> {
    const { email, password, firstName, lastName, roleId, companyId } = userData

    // Check if user exists
    const existingUser = await repositories.user.findByEmail(email)
    if (existingUser) {
      throw new AppError('Email already registered', 409, 'AUTH_EMAIL_EXISTS')
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const passwordHash = await bcryptjs.hash(password, salt)

    // Create user
    const newUser = await repositories.user.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role_id: roleId as any,
      company_id: companyId as any,
    } as any)

    logger.info(`New user registered: ${email}`)

    return newUser
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string; expiresIn: number } {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    const expiresIn = parseInt(process.env.JWT_EXPIRE_IN || '3600')

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn,
      algorithm: 'HS256',
    })

    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRE_IN || '7200000'),
      algorithm: 'HS256',
    })

    return {
      accessToken,
      refreshToken,
      expiresIn,
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const decoded = jwt.verify(token, jwtSecret) as TokenPayload
      return decoded
    } catch (error) {
      throw new AppError('Invalid or expired token', 401, 'AUTH_INVALID_TOKEN')
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as TokenPayload

      const newTokens = this.generateTokens(decoded)

      return {
        accessToken: newTokens.accessToken,
        expiresIn: newTokens.expiresIn,
      }
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401, 'AUTH_INVALID_REFRESH_TOKEN')
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await repositories.user.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password_hash)

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401, 'AUTH_INVALID_PASSWORD')
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10)
    const newPasswordHash = await bcryptjs.hash(newPassword, salt)

    // Update password
    await repositories.user.update(userId, {
      password_hash: newPasswordHash,
    } as any)

    logger.info(`Password changed for user: ${user.email}`)
  }

  /**
   * Validate user permissions
   */
  hasPermission(permissions: Record<string, any>, requiredPermission: string): boolean {
    return permissions[requiredPermission] === true
  }
}

export default new AuthService()
