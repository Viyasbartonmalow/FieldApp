import { Router, Request, Response } from 'express'
import { z } from 'zod'
import ptpService from '@/services/ptp.service'
import { asyncHandler } from '@/middleware/errorHandler'
import { authenticate } from '@/middleware/auth'
import logger from '@/utils/logger'

const router = Router()

// Validation schemas
const createPTPSchema = z.object({
  projectId: z.string().uuid('Valid project ID required'),
  foremanId: z.string().uuid('Valid foreman ID required'),
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
  ptpDate: z.string().datetime('Valid date required'),
  shiftStartTime: z.string().optional(),
  shiftEndTime: z.string().optional(),
  weatherConditions: z.string().optional(),
  siteConditions: z.string().optional(),
})

const updatePTPSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  weatherConditions: z.string().optional(),
  siteConditions: z.string().optional(),
  status: z.enum(['Draft', 'In Progress', 'Submitted', 'Approved', 'Rejected']).optional(),
})

const reviewSchema = z.object({
  comments: z.string().optional(),
})

const rejectSchema = z.object({
  reason: z.string().min(10, 'Rejection reason required'),
})

/**
 * POST /api/v1/ptps
 * Create new PTP
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = createPTPSchema.parse(req.body)
    const userId = (req as any).user.userId

    const ptp = await ptpService.createPTP(
      {
        projectId: body.projectId,
        foremanId: body.foremanId,
        title: body.title,
        description: body.description,
        ptpDate: new Date(body.ptpDate),
        shiftStartTime: body.shiftStartTime,
        shiftEndTime: body.shiftEndTime,
        weatherConditions: body.weatherConditions,
        siteConditions: body.siteConditions,
      },
      userId
    )

    res.status(201).json({
      success: true,
      status: 201,
      data: ptp,
      message: 'PTP created successfully',
    })
  })
)

/**
 * GET /api/v1/ptps
 * List PTPs with filtering
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId, status, startDate, endDate, foremanId } = req.query

    const filters: any = {}
    if (status) filters.status = status
    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)
    if (foremanId) filters.foremanId = foremanId as string

    const ptps = projectId
      ? await ptpService.getPTPsByProject(projectId as string, filters)
      : await ptpService.getAllPTPs(filters)

    res.status(200).json({
      success: true,
      status: 200,
      data: ptps,
      pagination: {
        total: ptps.length,
        limit: ptps.length,
        page: 1,
      },
      message: 'PTPs retrieved successfully',
    })
  })
)

/**
 * GET /api/v1/ptps/:ptpId
 * Get PTP details
 */
router.get(
  '/:ptpId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const ptp = await ptpService.getPTPDetail(req.params.ptpId)

    res.status(200).json({
      success: true,
      status: 200,
      data: ptp,
      message: 'PTP retrieved successfully',
    })
  })
)

/**
 * PUT /api/v1/ptps/:ptpId
 * Update PTP
 */
router.put(
  '/:ptpId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = updatePTPSchema.parse(req.body)
    const userId = (req as any).user.userId

    const ptp = await ptpService.updatePTP(
      req.params.ptpId,
      {
        title: body.title,
        description: body.description,
        weatherConditions: body.weatherConditions,
        siteConditions: body.siteConditions,
        status: body.status,
      },
      userId
    )

    res.status(200).json({
      success: true,
      status: 200,
      data: ptp,
      message: 'PTP updated successfully',
    })
  })
)

/**
 * POST /api/v1/ptps/:ptpId/submit
 * Submit PTP for review
 */
router.post(
  '/:ptpId/submit',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId

    const ptp = await ptpService.submitPTP(req.params.ptpId, userId)

    res.status(200).json({
      success: true,
      status: 200,
      data: ptp,
      message: 'PTP submitted for review',
    })
  })
)

/**
 * POST /api/v1/ptps/:ptpId/approve
 * Approve PTP
 */
router.post(
  '/:ptpId/approve',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = reviewSchema.parse(req.body)
    const userId = (req as any).user.userId

    const ptp = await ptpService.approvePTP(req.params.ptpId, userId, body.comments)

    res.status(200).json({
      success: true,
      status: 200,
      data: ptp,
      message: 'PTP approved successfully',
    })
  })
)

/**
 * POST /api/v1/ptps/:ptpId/reject
 * Reject PTP
 */
router.post(
  '/:ptpId/reject',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const body = rejectSchema.parse(req.body)
    const userId = (req as any).user.userId

    const ptp = await ptpService.rejectPTP(req.params.ptpId, userId, body.reason)

    res.status(200).json({
      success: true,
      status: 200,
      data: ptp,
      message: 'PTP rejected',
    })
  })
)

/**
 * DELETE /api/v1/ptps/:ptpId
 * Delete PTP
 */
router.delete(
  '/:ptpId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId

    await ptpService.deletePTP(req.params.ptpId, userId)

    res.status(200).json({
      success: true,
      status: 200,
      message: 'PTP deleted successfully',
    })
  })
)

/**
 * GET /api/v1/ptps/:projectId/stats
 * Get PTP statistics
 */
router.get(
  '/:projectId/stats',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await ptpService.getPTPStats(req.params.projectId)

    res.status(200).json({
      success: true,
      status: 200,
      data: stats,
      message: 'Stats retrieved successfully',
    })
  })
)

export default router
