/**
 * Reference Data Routes
 * Lookup endpoints for activities, control measures, permit types,
 * checklist templates, and PPE categories/items.
 */

import { Router, Request, Response } from 'express'
import { asyncHandler } from '@/middleware/errorHandler'
import { authenticate } from '@/middleware/auth'
import { repositories } from '@/database/repositories'
import { query } from '@/database/index'

const router = Router()

/**
 * GET /api/v1/reference/activities
 * List all activities with risk info
 */
router.get(
  '/activities',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const activities = await repositories.activity.findAll({ where: { is_active: true } })
    res.json({ success: true, status: 200, data: activities })
  })
)

/**
 * GET /api/v1/reference/control-categories
 * List control measure categories with their control items
 */
router.get(
  '/control-categories',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const sql = `
      SELECT
        cmc.id,
        cmc.name,
        cmc.description,
        cmc.display_order,
        json_agg(
          json_build_object(
            'id', cm.id,
            'name', cm.name,
            'description', cm.description,
            'requires_input', cm.requires_input,
            'input_label', cm.input_label,
            'input_unit', cm.input_unit,
            'display_order', cm.display_order
          ) ORDER BY cm.display_order
        ) FILTER (WHERE cm.id IS NOT NULL) as controls
      FROM control_measure_category cmc
      LEFT JOIN control_measure cm ON cm.category_id = cmc.id AND cm.is_active = true
      WHERE cmc.is_active = true
      GROUP BY cmc.id
      ORDER BY cmc.display_order
    `
    const result = await query(sql)
    res.json({ success: true, status: 200, data: result.rows })
  })
)

/**
 * GET /api/v1/reference/permit-types
 * List all permit types
 */
router.get(
  '/permit-types',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const permitTypes = await repositories.permitType.findAll({ where: { is_active: true } })
    res.json({ success: true, status: 200, data: permitTypes })
  })
)

/**
 * GET /api/v1/reference/checklist-templates
 * List all checklist templates with their items
 */
router.get(
  '/checklist-templates',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const sql = `
      SELECT
        ct.id, ct.name, ct.description, ct.category,
        json_agg(
          json_build_object(
            'id', ci.id,
            'item_name', ci.item_name,
            'is_required', ci.is_required,
            'display_order', ci.display_order
          ) ORDER BY ci.display_order
        ) FILTER (WHERE ci.id IS NOT NULL) as items
      FROM checklist_template ct
      LEFT JOIN checklist_item ci ON ci.checklist_template_id = ct.id AND ci.is_active = true
      WHERE ct.is_active = true
      GROUP BY ct.id
      ORDER BY ct.name
    `
    const result = await query(sql)
    res.json({ success: true, status: 200, data: result.rows })
  })
)

/**
 * GET /api/v1/reference/ppe-categories
 * List PPE categories with their items
 */
router.get(
  '/ppe-categories',
  authenticate,
  asyncHandler(async (_req: Request, res: Response) => {
    const sql = `
      SELECT
        pc.id, pc.name, pc.description, pc.icon_name, pc.display_order,
        json_agg(
          json_build_object(
            'id', pi.id,
            'name', pi.name,
            'description', pi.description,
            'display_order', pi.display_order
          ) ORDER BY pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM ppe_category pc
      LEFT JOIN ppe_item pi ON pi.category_id = pc.id AND pi.is_active = true
      WHERE pc.is_active = true
      GROUP BY pc.id
      ORDER BY pc.display_order
    `
    const result = await query(sql)
    res.json({ success: true, status: 200, data: result.rows })
  })
)

export default router

