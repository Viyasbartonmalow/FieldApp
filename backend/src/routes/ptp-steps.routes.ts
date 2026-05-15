/**
 * PTP Workflow Step Routes
 * Endpoints for saving individual PTP workflow steps:
 * - Activity Controls (control measures)
 * - Requirements (permits + checklists)
 * - PPE selections
 * - Emergency Contacts (stored in PTP metadata)
 * - Day Closure
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler, AppError } from '@/middleware/errorHandler'
import { authenticate } from '@/middleware/auth'
import { repositories } from '@/database/repositories'
import { query, transaction } from '@/database/index'

const router = Router()

// ──────────────────────────────────────────────────────────────
// ACTIVITY CONTROLS (control measures per category)
// PUT /api/v1/ptp-steps/:ptpId/activity-controls
// ──────────────────────────────────────────────────────────────
const activityControlsSchema = z.object({
  categories: z.array(z.object({
    categoryId: z.string().uuid(),
    applicable: z.boolean(),
    items: z.array(z.object({
      controlMeasureId: z.string().uuid(),
      checked: z.boolean(),
      inputValue: z.string().optional(),
    })).optional(),
  })),
})

router.put(
  '/:ptpId/activity-controls',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const userId = (req as any).user.userId
    const body = activityControlsSchema.parse(req.body)

    const ptp = await repositories.ptp.findById(ptpId)
    if (!ptp) throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')

    await transaction(async (client) => {
      for (const cat of body.categories) {
        // Upsert the control measure category record
        await client.query(`
          INSERT INTO ptp_control_measure (ptp_id, category_id, is_applicable, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $4)
          ON CONFLICT (ptp_id, category_id) DO UPDATE
            SET is_applicable = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP
        `, [ptpId, cat.categoryId, cat.applicable, userId])

        // Get the ptp_control_measure id
        const pcmRes = await client.query(
          'SELECT id FROM ptp_control_measure WHERE ptp_id = $1 AND category_id = $2',
          [ptpId, cat.categoryId]
        )
        const pcmId = pcmRes.rows[0]?.id
        if (!pcmId || !cat.items) continue

        for (const item of cat.items) {
          // Delete existing then insert to avoid UNIQUE constraint issues
          await client.query(
            'DELETE FROM ptp_control_item WHERE ptp_control_measure_id = $1 AND control_measure_id = $2',
            [pcmId, item.controlMeasureId]
          )
          await client.query(`
            INSERT INTO ptp_control_item (ptp_control_measure_id, control_measure_id, is_checked, input_value, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $5)
          `, [pcmId, item.controlMeasureId, item.checked, item.inputValue ?? null, userId])
        }
      }
    })

    res.json({ success: true, status: 200, message: 'Activity controls saved' })
  })
)

// GET current activity controls for a PTP
router.get(
  '/:ptpId/activity-controls',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const sql = `
      SELECT
        cmc.id as category_id, cmc.name as category_name,
        pcm.is_applicable,
        json_agg(
          json_build_object(
            'control_measure_id', pci.control_measure_id,
            'is_checked', pci.is_checked,
            'input_value', pci.input_value,
            'label', cm.name
          )
        ) FILTER (WHERE pci.id IS NOT NULL) as items
      FROM control_measure_category cmc
      LEFT JOIN ptp_control_measure pcm ON pcm.category_id = cmc.id AND pcm.ptp_id = $1
      LEFT JOIN ptp_control_item pci ON pci.ptp_control_measure_id = pcm.id
      LEFT JOIN control_measure cm ON cm.id = pci.control_measure_id
      WHERE cmc.is_active = true
      GROUP BY cmc.id, cmc.name, cmc.display_order, pcm.is_applicable
      ORDER BY cmc.display_order
    `
    const result = await query(sql, [ptpId])
    res.json({ success: true, status: 200, data: result.rows })
  })
)

// ──────────────────────────────────────────────────────────────
// REQUIREMENTS (permits + checklists)
// PUT /api/v1/ptp-steps/:ptpId/requirements
// ──────────────────────────────────────────────────────────────
const requirementsSchema = z.object({
  permits: z.array(z.object({
    permitTypeId: z.string().uuid(),
    applicable: z.boolean(),
    selected: z.boolean().optional(),
    permitNumber: z.string().optional(),
  })).optional(),
  checklists: z.array(z.object({
    checklistTemplateId: z.string().uuid(),
    applicable: z.boolean(),
    selected: z.boolean().optional(),
  })).optional(),
})

router.put(
  '/:ptpId/requirements',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const userId = (req as any).user.userId
    const body = requirementsSchema.parse(req.body)

    const ptp = await repositories.ptp.findById(ptpId)
    if (!ptp) throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')

    await transaction(async (client) => {
      for (const permit of body.permits ?? []) {
        await client.query(`
          INSERT INTO ptp_permit (ptp_id, permit_type_id, is_applicable, is_selected, permit_number, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $5, $6, $6)
          ON CONFLICT (ptp_id, permit_type_id) DO UPDATE
            SET is_applicable = $3, is_selected = $4, permit_number = $5,
                updated_by = $6, updated_at = CURRENT_TIMESTAMP
        `, [ptpId, permit.permitTypeId, permit.applicable, permit.selected ?? false,
            permit.permitNumber ?? null, userId])
      }
      for (const checklist of body.checklists ?? []) {
        await client.query(`
          INSERT INTO ptp_checklist (ptp_id, checklist_template_id, is_applicable, is_selected, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $5, $5)
          ON CONFLICT (ptp_id, checklist_template_id) DO UPDATE
            SET is_applicable = $3, is_selected = $4,
                updated_by = $5, updated_at = CURRENT_TIMESTAMP
        `, [ptpId, checklist.checklistTemplateId, checklist.applicable,
            checklist.selected ?? false, userId])
      }
    })

    res.json({ success: true, status: 200, message: 'Requirements saved' })
  })
)

// GET requirements for a PTP
router.get(
  '/:ptpId/requirements',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const permitsRes = await query(`
      SELECT pt.id as permit_type_id, pt.name, pp.is_applicable, pp.is_selected, pp.permit_number
      FROM permit_type pt
      LEFT JOIN ptp_permit pp ON pp.permit_type_id = pt.id AND pp.ptp_id = $1
      WHERE pt.is_active = true ORDER BY pt.name
    `, [ptpId])
    const checklistsRes = await query(`
      SELECT ct.id as checklist_template_id, ct.name, ct.category,
             pc.is_applicable, pc.is_selected
      FROM checklist_template ct
      LEFT JOIN ptp_checklist pc ON pc.checklist_template_id = ct.id AND pc.ptp_id = $1
      WHERE ct.is_active = true ORDER BY ct.name
    `, [ptpId])
    res.json({
      success: true, status: 200,
      data: { permits: permitsRes.rows, checklists: checklistsRes.rows }
    })
  })
)

// ──────────────────────────────────────────────────────────────
// PPE SELECTIONS
// PUT /api/v1/ptp-steps/:ptpId/ppe
// ──────────────────────────────────────────────────────────────
const ppeSchema = z.object({
  categories: z.array(z.object({
    ppeCategoryId: z.string().uuid(),
    applicable: z.boolean(),
    items: z.array(z.object({
      ppeItemId: z.string().uuid(),
      selected: z.boolean(),
      quantity: z.number().int().optional(),
    })).optional(),
  })),
})

router.put(
  '/:ptpId/ppe',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const userId = (req as any).user.userId
    const body = ppeSchema.parse(req.body)

    const ptp = await repositories.ptp.findById(ptpId)
    if (!ptp) throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')

    await transaction(async (client) => {
      for (const cat of body.categories) {
        await client.query(`
          INSERT INTO ptp_ppe (ptp_id, ppe_category_id, is_applicable, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $4)
          ON CONFLICT (ptp_id, ppe_category_id) DO UPDATE
            SET is_applicable = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP
        `, [ptpId, cat.ppeCategoryId, cat.applicable, userId])

        if (!cat.items?.length) continue
        const ppeRes = await client.query(
          'SELECT id FROM ptp_ppe WHERE ptp_id = $1 AND ppe_category_id = $2',
          [ptpId, cat.ppeCategoryId]
        )
        const ppeId = ppeRes.rows[0]?.id
        if (!ppeId) continue

        for (const item of cat.items) {
          await client.query(
            'DELETE FROM ptp_ppe_item WHERE ptp_ppe_id = $1 AND ppe_item_id = $2',
            [ppeId, item.ppeItemId]
          )
          await client.query(`
            INSERT INTO ptp_ppe_item (ptp_ppe_id, ppe_item_id, is_selected, quantity, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $5)
          `, [ppeId, item.ppeItemId, item.selected, item.quantity ?? 1, userId])
        }
      }
    })

    res.json({ success: true, status: 200, message: 'PPE selections saved' })
  })
)

// GET PPE for a PTP
router.get(
  '/:ptpId/ppe',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const sql = `
      SELECT
        pc.id as ppe_category_id, pc.name as category_name, pc.display_order,
        pp.is_applicable,
        json_agg(
          json_build_object(
            'ppe_item_id', ppi.ppe_item_id,
            'item_name', pi.name,
            'is_selected', ppi.is_selected,
            'quantity', ppi.quantity
          )
        ) FILTER (WHERE ppi.id IS NOT NULL) as items
      FROM ppe_category pc
      LEFT JOIN ptp_ppe pp ON pp.ppe_category_id = pc.id AND pp.ptp_id = $1
      LEFT JOIN ptp_ppe_item ppi ON ppi.ptp_ppe_id = pp.id
      LEFT JOIN ppe_item pi ON pi.id = ppi.ppe_item_id
      WHERE pc.is_active = true
      GROUP BY pc.id, pc.name, pc.display_order, pp.is_applicable
      ORDER BY pc.display_order
    `
    const result = await query(sql, [ptpId])
    res.json({ success: true, status: 200, data: result.rows })
  })
)

// ──────────────────────────────────────────────────────────────
// EMERGENCY CONTACTS (stored in PTP metadata as JSON update)
// PUT /api/v1/ptp-steps/:ptpId/contacts
// ──────────────────────────────────────────────────────────────
const contactsSchema = z.object({
  eapDiscussed: z.boolean(),
  superintendent: z.string().optional(),
  safety: z.string().optional(),
  other: z.string().optional(),
  musterArea: z.string().optional(),
})

router.put(
  '/:ptpId/contacts',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const userId = (req as any).user.userId
    const body = contactsSchema.parse(req.body)

    const ptp = await repositories.ptp.findById(ptpId)
    if (!ptp) throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')

    // Store emergency contacts in ptp.site_conditions as JSON (since no dedicated table)
    await repositories.ptp.update(ptpId, {
      site_conditions: JSON.stringify({
        emergency_contacts: body,
        original: (ptp as any).site_conditions,
      }),
      updated_by: userId,
    } as any)

    res.json({ success: true, status: 200, message: 'Emergency contacts saved' })
  })
)

router.get(
  '/:ptpId/contacts',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const ptp = await repositories.ptp.findById(ptpId)
    if (!ptp) throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')

    let contacts = null
    try {
      const parsed = JSON.parse((ptp as any).site_conditions ?? '{}')
      contacts = parsed.emergency_contacts ?? null
    } catch { /* not JSON - use null */ }

    res.json({ success: true, status: 200, data: contacts })
  })
)

// ──────────────────────────────────────────────────────────────
// DAY CLOSURE
// PUT /api/v1/ptp-steps/:ptpId/closure
// ──────────────────────────────────────────────────────────────
const closureSchema = z.object({
  closureDate: z.string(),
  toolsCleanedUp: z.boolean(),
  permitsClosedOut: z.boolean(),
  anyIncidents: z.boolean(),
  incidentReported: z.boolean().optional(),
  incidentDescription: z.string().optional(),
  crewAcknowledgedCount: z.number().int().optional(),
  foremanSignature: z.string().optional(),
  notes: z.string().optional(),
})

router.put(
  '/:ptpId/closure',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const userId = (req as any).user.userId
    const body = closureSchema.parse(req.body)

    const ptp = await repositories.ptp.findById(ptpId)
    if (!ptp) throw new AppError('PTP not found', 404, 'PTP_NOT_FOUND')

    await query(`
      INSERT INTO end_of_day_closure (
        ptp_id, foreman_id, closure_date,
        tools_cleaned, permits_closed,
        incidents_reported, incident_reported, incident_description,
        crew_acknowledged_count, notes, signed_at,
        created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11, $11)
      ON CONFLICT (ptp_id) DO UPDATE SET
        tools_cleaned = $4, permits_closed = $5,
        incidents_reported = $6, incident_reported = $7, incident_description = $8,
        crew_acknowledged_count = $9, notes = $10,
        signed_at = CURRENT_TIMESTAMP, updated_by = $11, updated_at = CURRENT_TIMESTAMP
    `, [
      ptpId, userId, body.closureDate,
      body.toolsCleanedUp, body.permitsClosedOut,
      body.anyIncidents, body.incidentReported ?? false, body.incidentDescription ?? null,
      body.crewAcknowledgedCount ?? 0, body.notes ?? null, userId,
    ])

    // Update PTP status to closed
    await repositories.ptp.update(ptpId, { status: 'Approved', updated_by: userId } as any)

    res.json({ success: true, status: 200, message: 'Day closure saved' })
  })
)

router.get(
  '/:ptpId/closure',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { ptpId } = req.params
    const result = await query(
      'SELECT * FROM end_of_day_closure WHERE ptp_id = $1',
      [ptpId]
    )
    res.json({
      success: true, status: 200,
      data: result.rows[0] ?? null,
    })
  })
)

export default router
