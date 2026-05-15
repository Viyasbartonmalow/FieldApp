import { Router, Request, Response, NextFunction } from 'express'
import logger from '@/utils/logger'

const router = Router()

// In-memory storage for dev/demo (replace with DB in production)
const dailyReportsStore = new Map<string, any>()

// Create daily report (no auth required for demo)
router.post('/daily-reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId, userId, reportDate, employeeName, trade, taskDetails, hoursWorked, status, remarks } = req.body

    if (!reportId || !userId || !reportDate) {
      return res.status(400).json({
        error: 'Missing required fields: reportId, userId, reportDate',
      })
    }

    const report = {
      reportId,
      userId,
      reportDate,
      employeeName,
      trade,
      taskDetails,
      hoursWorked,
      status,
      remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dailyReportsStore.set(reportId, report)
    logger.info(`Created daily report: ${reportId}`)

    res.status(201).json(report)
  } catch (error) {
    next(error)
  }
})

// Update daily report (no auth required for demo)
router.put('/daily-reports/:reportId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params
    const { userId, reportDate, employeeName, trade, taskDetails, hoursWorked, status, remarks } = req.body

    const existing = dailyReportsStore.get(reportId)
    if (!existing) {
      return res.status(404).json({ error: 'Daily report not found' })
    }

    const updated = {
      ...existing,
      userId,
      reportDate,
      employeeName,
      trade,
      taskDetails,
      hoursWorked,
      status,
      remarks,
      updatedAt: new Date().toISOString(),
    }

    dailyReportsStore.set(reportId, updated)
    logger.info(`Updated daily report: ${reportId}`)

    res.json(updated)
  } catch (error) {
    next(error)
  }
})

// Get daily report (no auth required for demo)
router.get('/daily-reports/:reportId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params
    const report = dailyReportsStore.get(reportId)

    if (!report) {
      return res.status(404).json({ error: 'Daily report not found' })
    }

    res.json(report)
  } catch (error) {
    next(error)
  }
})

// List daily reports by user (no auth required for demo)
router.get('/daily-reports', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'userId query param is required' })
    }

    const reports = Array.from(dailyReportsStore.values()).filter((r) => r.userId === userId)

    res.json({
      items: reports,
      nextToken: null,
    })
  } catch (error) {
    next(error)
  }
})

// Delete daily report (no auth required for demo)
router.delete('/daily-reports/:reportId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params
    const report = dailyReportsStore.get(reportId)

    if (!report) {
      return res.status(404).json({ error: 'Daily report not found' })
    }

    dailyReportsStore.delete(reportId)
    logger.info(`Deleted daily report: ${reportId}`)

    res.json(report)
  } catch (error) {
    next(error)
  }
})

export default router
