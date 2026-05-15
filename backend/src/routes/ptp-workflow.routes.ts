import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler, AppError } from '@/middleware/errorHandler'
import { query } from '@/database/index'

const router = Router()

let tableReady = false

const STEP_COLUMN_MAP: Record<string, string> = {
  tasks: 'tasks_json',
  'activity-controls': 'activity_controls_json',
  requirements: 'requirements_json',
  'emergency-contacts': 'emergency_contacts_json',
  'crew-signin': 'crew_signin_json',
  'ptp-review': 'review_json',
  'ptp-day-closure': 'day_closure_json',
}

export const ensurePtpWorkflowTable = async () => {
  if (tableReady) return

  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto')
  await query(`
    CREATE TABLE IF NOT EXISTS ptp_workflow (
      ptp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ptp_type VARCHAR(40) NOT NULL DEFAULT 'standard',
      title VARCHAR(255),
      trade VARCHAR(120),
      ptp_date DATE,
      source_ptp_id UUID,
      status VARCHAR(40) NOT NULL DEFAULT 'draft',
      tasks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      activity_controls_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      requirements_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      emergency_contacts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      crew_signin_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      review_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      day_closure_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by VARCHAR(120),
      updated_by VARCHAR(120),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await query('CREATE INDEX IF NOT EXISTS idx_ptp_workflow_type ON ptp_workflow(ptp_type)')
  await query('CREATE INDEX IF NOT EXISTS idx_ptp_workflow_date ON ptp_workflow(ptp_date)')
  await query('CREATE INDEX IF NOT EXISTS idx_ptp_workflow_status ON ptp_workflow(status)')

  tableReady = true
}

const createSchema = z.object({
  ptpType: z.enum(['standard', 'previous_day', 'trade_specific', 'prior_dates']).default('standard'),
  title: z.string().optional(),
  trade: z.string().optional(),
  ptpDate: z.string().optional(),
  sourcePtpId: z.string().uuid().optional(),
  status: z.string().optional(),
  createdBy: z.string().optional(),
  initialData: z.record(z.any()).optional(),
})

const updateMetaSchema = z.object({
  title: z.string().optional(),
  trade: z.string().optional(),
  ptpDate: z.string().optional(),
  status: z.string().optional(),
  updatedBy: z.string().optional(),
})

const saveStepSchema = z.object({
  stepKey: z.enum([
    'tasks',
    'activity-controls',
    'requirements',
    'emergency-contacts',
    'crew-signin',
    'ptp-review',
    'ptp-day-closure',
  ]),
  stepData: z.any(),
  status: z.string().optional(),
  updatedBy: z.string().optional(),
})

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    await ensurePtpWorkflowTable()
    const body = createSchema.parse(req.body)

    const result = await query(
      `
        INSERT INTO ptp_workflow (
          ptp_type, title, trade, ptp_date, source_ptp_id, status,
          tasks_json, activity_controls_json, requirements_json,
          emergency_contacts_json, crew_signin_json, review_json, day_closure_json,
          created_by, updated_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7::jsonb, $8::jsonb, $9::jsonb,
          $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb,
          $14, $14
        )
        RETURNING *
      `,
      [
        body.ptpType,
        body.title ?? null,
        body.trade ?? null,
        body.ptpDate ?? null,
        body.sourcePtpId ?? null,
        body.status ?? 'draft',
        JSON.stringify(body.initialData?.tasks ?? []),
        JSON.stringify(body.initialData?.activityControls ?? {}),
        JSON.stringify(body.initialData?.requirements ?? {}),
        JSON.stringify(body.initialData?.emergencyContacts ?? {}),
        JSON.stringify(body.initialData?.crewSignin ?? []),
        JSON.stringify(body.initialData?.review ?? {}),
        JSON.stringify(body.initialData?.dayClosure ?? {}),
        body.createdBy ?? 'system',
      ]
    )

    res.status(201).json({ success: true, status: 201, data: result.rows[0] })
  })
)

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    await ensurePtpWorkflowTable()
    const { ptpType, trade, fromDate, toDate, status, limit = '50' } = req.query

    const clauses: string[] = []
    const params: any[] = []

    if (ptpType) {
      params.push(ptpType)
      clauses.push(`ptp_type = $${params.length}`)
    }
    if (trade) {
      params.push(trade)
      clauses.push(`trade = $${params.length}`)
    }
    if (status) {
      params.push(status)
      clauses.push(`status = $${params.length}`)
    }
    if (fromDate) {
      params.push(fromDate)
      clauses.push(`ptp_date >= $${params.length}`)
    }
    if (toDate) {
      params.push(toDate)
      clauses.push(`ptp_date <= $${params.length}`)
    }

    params.push(Number(limit))

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const sql = `
      SELECT *
      FROM ptp_workflow
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length}
    `

    const result = await query(sql, params)
    res.json({ success: true, status: 200, data: result.rows })
  })
)

router.get(
  '/:ptpId',
  asyncHandler(async (req: Request, res: Response) => {
    await ensurePtpWorkflowTable()
    const result = await query('SELECT * FROM ptp_workflow WHERE ptp_id = $1', [req.params.ptpId])
    if (!result.rows[0]) {
      throw new AppError('PTP workflow not found', 404, 'PTP_WORKFLOW_NOT_FOUND')
    }

    res.json({ success: true, status: 200, data: result.rows[0] })
  })
)

router.put(
  '/:ptpId/meta',
  asyncHandler(async (req: Request, res: Response) => {
    await ensurePtpWorkflowTable()
    const body = updateMetaSchema.parse(req.body)

    const result = await query(
      `
        UPDATE ptp_workflow
        SET
          title = COALESCE($2, title),
          trade = COALESCE($3, trade),
          ptp_date = COALESCE($4, ptp_date),
          status = COALESCE($5, status),
          updated_by = COALESCE($6, updated_by),
          updated_at = CURRENT_TIMESTAMP
        WHERE ptp_id = $1
        RETURNING *
      `,
      [
        req.params.ptpId,
        body.title ?? null,
        body.trade ?? null,
        body.ptpDate ?? null,
        body.status ?? null,
        body.updatedBy ?? null,
      ]
    )

    if (!result.rows[0]) {
      throw new AppError('PTP workflow not found', 404, 'PTP_WORKFLOW_NOT_FOUND')
    }

    res.json({ success: true, status: 200, data: result.rows[0] })
  })
)

router.put(
  '/:ptpId/step',
  asyncHandler(async (req: Request, res: Response) => {
    await ensurePtpWorkflowTable()
    const body = saveStepSchema.parse(req.body)

    const targetColumn = STEP_COLUMN_MAP[body.stepKey]
    const result = await query(
      `
        UPDATE ptp_workflow
        SET
          ${targetColumn} = $2::jsonb,
          status = COALESCE($3, status),
          updated_by = COALESCE($4, updated_by),
          updated_at = CURRENT_TIMESTAMP
        WHERE ptp_id = $1
        RETURNING *
      `,
      [
        req.params.ptpId,
        JSON.stringify(body.stepData ?? {}),
        body.status ?? null,
        body.updatedBy ?? null,
      ]
    )

    if (!result.rows[0]) {
      throw new AppError('PTP workflow not found', 404, 'PTP_WORKFLOW_NOT_FOUND')
    }

    res.json({ success: true, status: 200, data: result.rows[0] })
  })
)

export default router