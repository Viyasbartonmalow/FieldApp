import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

// NOTE: Backend is now pass-through only
// Frontend uses DataStore directly for all PtpWorkflow operations (DynamoDB)
// These endpoints exist for backward compatibility but return minimal data

export const ensurePtpWorkflowTable = async () => {
  // DynamoDB is managed by AWS Amplify, no setup needed
}

const createSchema = z.object({
  ptpType: z.enum(['standard', 'previous_day', 'trade_specific', 'prior_dates']).default('standard'),
  title: z.string().optional(),
  trade: z.string().optional(),
  ptpDate: z.string().optional(),
  sourcePtpId: z.string().optional(),
  status: z.string().optional(),
  createdBy: z.string().optional(),
  initialData: z.record(z.any()).optional(),
  updatedBy: z.string().optional(),
})

// GET list of PtpWorkflows - Frontend fetches directly from DataStore/DynamoDB
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, status: 200, data: [], message: 'Use DataStore on frontend for actual data' })
  })
)

// GET single PtpWorkflow by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    res.json({ success: true, status: 200, data: { ptp_id: id }, message: 'Use DataStore on frontend for actual data' })
  })
)

// POST create PtpWorkflow - Frontend creates directly via DataStore.save()
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    createSchema.parse(req.body)
    res.status(201).json({ 
      success: true, 
      status: 201, 
      data: { ptp_id: `ptp-${Date.now()}` },
      message: 'Use DataStore on frontend for actual creation' 
    })
  })
)

// GET PtpWorkflow metadata
router.get(
  '/:id/meta',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    res.json({ 
      success: true, 
      status: 200, 
      data: { ptp_id: id, meta: {} },
      message: 'Use DataStore on frontend for actual data' 
    })
  })
)

// PUT update PtpWorkflow step - Frontend updates directly via DataStore.save()
router.put(
  '/:id/step',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    res.json({ 
      success: true, 
      status: 200, 
      data: { ptp_id: id },
      message: 'Use DataStore on frontend for actual updates' 
    })
  })
)

// DELETE PtpWorkflow - Frontend deletes directly via DataStore.delete()
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    res.json({ 
      success: true, 
      status: 200, 
      data: { ptp_id: id },
      message: 'Use DataStore on frontend for actual deletion' 
    })
  })
)

export default router