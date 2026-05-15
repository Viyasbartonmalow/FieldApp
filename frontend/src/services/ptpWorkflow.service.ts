import { DataStore, Predicates } from 'aws-amplify/datastore'
import { PreTaskPlanControl, PreTaskPlanTaskDetail } from '@/models'

export type PtpWorkflowType = 'standard' | 'previous_day' | 'trade_specific' | 'prior_dates'
export type PtpWorkflowStepKey =
  | 'tasks'
  | 'activity-controls'
  | 'requirements'
  | 'emergency-contacts'
  | 'crew-signin'
  | 'ptp-review'
  | 'ptp-day-closure'

export interface PtpWorkflowRecord {
  ptp_id: string
  ptp_type: PtpWorkflowType
  title: string | null
  trade: string | null
  ptp_date: string | null
  source_ptp_id: string | null
  status: string
  tasks_json: any
  activity_controls_json: any
  requirements_json: any
  emergency_contacts_json: any
  crew_signin_json: any
  review_json: any
  day_closure_json: any
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

interface CreateWorkflowInput {
  ptpType: PtpWorkflowType
  title?: string
  trade?: string
  ptpDate?: string
  sourcePtpId?: string
  status?: string
  createdBy?: string
  initialData?: Record<string, unknown>
}

interface ListWorkflowParams {
  ptpType?: PtpWorkflowType
  trade?: string
  fromDate?: string
  toDate?: string
  status?: string
  limit?: number
}

const nowIso = () => new Date().toISOString()
const createUuid = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `ptp-${Date.now()}-${Math.random().toString(16).slice(2)}`

const TASK_ROW_TYPE = 'WORK_STEP'
const CREW_ROW_TYPE = 'CREW_SIGNIN'
const META_NOTE_PREFIX = 'PTP_META_JSON:'

const parseJsonField = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return value as T
}

const toIsoDate = (value: string | null | undefined): string | null => {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

const parseMetaNote = (value: string | null | undefined): Record<string, unknown> => {
  if (!value || !value.startsWith(META_NOTE_PREFIX)) return {}
  try {
    return JSON.parse(value.slice(META_NOTE_PREFIX.length)) as Record<string, unknown>
  } catch {
    return {}
  }
}

const buildMetaNote = (value: Record<string, unknown>): string => `${META_NOTE_PREFIX}${JSON.stringify(value)}`

const toStatus = (value: string | undefined): string => {
  if (!value) return 'in_progress'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'in progress') return 'in_progress'
  if (normalized === 'submitted for review') return 'submitted'
  if (normalized === 'submitted') return 'submitted'
  if (normalized === 'reviewed') return 'reviewed'
  if (normalized === 'flagged for changes') return 'changes_requested'
  if (normalized === 'closed') return 'closed'
  if (normalized === 'draft') return 'draft'
  if (normalized === 'in_progress' || normalized === 'changes_requested') return normalized
  return normalized || 'in_progress'
}

const mapTaskDetailToTask = (row: any) => {
  const raw = parseJsonField<any>(row.requirement_selected_value, null)
  if (raw && typeof raw === 'object') return raw

  const firstTask = row.task_information?.task_data?.[0]
  return {
    id: row.task_id,
    name: firstTask?.task ?? '',
    description: '',
    toolsEquipment: firstTask?.tool ?? [],
    onsiteEquipment: firstTask?.equipment ?? [],
    activityExposures: firstTask?.task_hazarad ?? '',
    controlMeasures: firstTask?.hazard_control ?? '',
    competentInitials: firstTask?.competent_person ?? '',
    expanded: false,
  }
}

const mapCrewRowToCrewMember = (row: any) => {
  const raw = parseJsonField<any>(row.requirement_selected_value, null)
  if (raw && typeof raw === 'object') return raw

  const crewInfo = row.crew_login_information?.crew_login_information
  return {
    id: row.task_id,
    name: crewInfo?.crew_name ?? 'Crew Member',
    username: '@crew',
    initials: (crewInfo?.crew_name ?? 'C').split(' ').map((p: string) => p[0] ?? '').join('').slice(0, 2).toUpperCase(),
    avatarColor: '#E5E7EB',
    signedIn: Boolean(crewInfo?.crew_signature),
    comment: crewInfo?.signin_comment ?? '',
    time: crewInfo?.signed_datetime ?? '',
    signatureData: crewInfo?.crew_signature ?? '',
  }
}

const mapControlToRecord = (control: any, details: any[]): PtpWorkflowRecord => {
  const meta = parseMetaNote(control.shift_start_signature?.note)
  const workStepsRows = details.filter((d) => d.task_type === TASK_ROW_TYPE)
  const crewRows = details.filter((d) => d.task_type === CREW_ROW_TYPE)

  const tasksJsonFromMeta = parseJsonField<any>(meta.tasks, null)
  const activityJsonFromMeta = parseJsonField<any>(meta['activity-controls'], null)
  const requirementsJsonFromMeta = parseJsonField<any>(meta.requirements, null)
  const emergencyJsonFromMeta = parseJsonField<any>(meta['emergency-contacts'], null)
  const crewJsonFromMeta = parseJsonField<any>(meta['crew-signin'], null)
  const reviewJsonFromMeta = parseJsonField<any>(meta['ptp-review'], null)
  const closureJsonFromMeta = parseJsonField<any>(meta['ptp-day-closure'], null)

  const tasksPayload = tasksJsonFromMeta ?? {
    project: control.project_number ?? '',
    ptpName: control.control_name ?? '',
    tasks: workStepsRows.map(mapTaskDetailToTask),
  }

  const requirementsPayload = requirementsJsonFromMeta ?? {
    permits: Object.fromEntries((control.control_option?.required_permit ?? []).map((item: string) => [item, true])),
    checklists: Object.fromEntries((control.control_option?.required_checklist ?? []).map((item: string) => [item, true])),
    ppeItems: {},
  }

  const emergencyPayload = emergencyJsonFromMeta ?? {
    emergencyPlanDiscussed: Boolean(control.emergency_information?.emergency_action_plan_discussion_indicator),
    safetyContact: control.emergency_information?.safety_professional_name ?? '',
    superintendentContact: control.emergency_information?.superintendent_name ?? '',
    otherContact: control.emergency_information?.note ?? '',
    musterArea: control.emergency_information?.muster_location ?? '',
  }

  const reviewPayload = reviewJsonFromMeta ?? {
    foremanComment: control.shift_start_review?.note ?? '',
    supervisorComment: '',
  }

  const dayClosurePayload = closureJsonFromMeta ?? {
    signOff: {},
    shift: {
      toolsCleaned: Boolean(control.shift_end_review?.tools_stored_property_indicator),
      permitsClosed: Boolean(control.shift_end_review?.permit_closed_indicator),
      anyIncidents: Boolean(control.shift_end_review?.incident_injury_indicator),
      incidentReported: Boolean(control.shift_end_review?.incident_reported_indicator),
      incidentDescription: control.shift_end_review?.incident_description ?? '',
    },
  }

  return {
    ptp_id: control.control_id,
    ptp_type: (control.control_template_id as PtpWorkflowType) || 'standard',
    title: control.control_name ?? null,
    trade: null,
    ptp_date: toIsoDate(control.copied_from_date) ?? toIsoDate(control.updatedAt) ?? toIsoDate(control.createdAt),
    source_ptp_id: null,
    status: toStatus(control.pretask_plan_status),
    tasks_json: tasksPayload,
    activity_controls_json: activityJsonFromMeta ?? {},
    requirements_json: requirementsPayload,
    emergency_contacts_json: emergencyPayload,
    crew_signin_json: crewJsonFromMeta ?? crewRows.map(mapCrewRowToCrewMember),
    review_json: reviewPayload,
    day_closure_json: dayClosurePayload,
    created_by: control.created_by_user_id ?? null,
    updated_by: control.modified_by_user_id ?? null,
    created_at: control.createdAt ?? nowIso(),
    updated_at: control.updatedAt ?? nowIso(),
  }
}

const createLocalRecord = (input: CreateWorkflowInput): PtpWorkflowRecord => ({
  ptp_id: createUuid(),
  ptp_type: input.ptpType,
  title: input.title ?? null,
  trade: input.trade ?? null,
  ptp_date: input.ptpDate ?? null,
  source_ptp_id: input.sourcePtpId ?? null,
  status: input.status ?? 'draft',
  tasks_json: input.initialData?.tasks ?? {},
  activity_controls_json: input.initialData?.activityControls ?? {},
  requirements_json: input.initialData?.requirements ?? {},
  emergency_contacts_json: input.initialData?.emergencyContacts ?? {},
  crew_signin_json: input.initialData?.crewSignin ?? [],
  review_json: input.initialData?.review ?? {},
  day_closure_json: input.initialData?.dayClosure ?? {},
  created_by: input.createdBy ?? 'local-user',
  updated_by: input.createdBy ?? 'local-user',
  created_at: nowIso(),
  updated_at: nowIso(),
})

const getControlById = async (controlId: string): Promise<any | null> => {
  const rows = (await DataStore.query(PreTaskPlanControl as any, (c: any) => c.control_id.eq(controlId)) as any[]) ?? []
  return rows[0] ?? null
}

const getTaskRowsByControl = async (controlId: string): Promise<any[]> => {
  return ((await DataStore.query(PreTaskPlanTaskDetail as any, (c: any) => c.control_id.eq(controlId)) as any[]) ?? [])
}

const upsertTaskRows = async (controlId: string, projectNumber: string, tasks: any[], userId?: string) => {
  const existingRows = await getTaskRowsByControl(controlId)
  const existingById = new Map<string, any>(
    existingRows
      .filter((row) => row.task_type === TASK_ROW_TYPE)
      .map((row) => [row.task_id, row])
  )

  const incomingIds = new Set<string>()

  for (const task of tasks) {
    const taskId = String(task.id ?? createUuid())
    incomingIds.add(taskId)

    const taskInformation = {
      task_type: 'work-step',
      task_data: [
        {
          task: task.name ?? '',
          tools_and_equipment: Array.isArray(task.toolsEquipment) ? task.toolsEquipment.join(', ') : '',
          other_tool: '',
          tool: Array.isArray(task.toolsEquipment) ? task.toolsEquipment : [],
          equipment: Array.isArray(task.onsiteEquipment) ? task.onsiteEquipment : [],
          task_hazarad: task.activityExposures ?? '',
          hazard_control: task.controlMeasures ?? '',
          competent_person: task.competentInitials ?? '',
        },
      ],
    }

    const existing = existingById.get(taskId)
    if (existing) {
      await DataStore.save(
        (PreTaskPlanTaskDetail as any).copyOf(existing, (draft: any) => {
          draft.project_number = projectNumber
          draft.task_type = TASK_ROW_TYPE
          draft.task_information = taskInformation
          draft.requirment_category = 'WORK_STEP'
          draft.requirement_selected_value = JSON.stringify(task)
          draft.modified_by_user_id = userId ?? null
        })
      )
    } else {
      await DataStore.save(
        new (PreTaskPlanTaskDetail as any)({
          control_id: controlId,
          task_id: taskId,
          task_type: TASK_ROW_TYPE,
          project_number: projectNumber,
          task_information: taskInformation,
          requirment_category: 'WORK_STEP',
          requirement_selected_value: JSON.stringify(task),
          created_by_user_id: userId ?? null,
          modified_by_user_id: userId ?? null,
        })
      )
    }
  }

  for (const [taskId, row] of existingById.entries()) {
    if (!incomingIds.has(taskId)) {
      await DataStore.delete(row)
    }
  }
}

const upsertCrewRows = async (controlId: string, projectNumber: string, crewMembers: any[], userId?: string) => {
  const existingRows = await getTaskRowsByControl(controlId)
  const existingById = new Map<string, any>(
    existingRows
      .filter((row) => row.task_type === CREW_ROW_TYPE)
      .map((row) => [row.task_id, row])
  )

  const incomingIds = new Set<string>()

  for (const member of crewMembers) {
    const taskId = String(member.id ?? createUuid())
    incomingIds.add(taskId)
    const memberSignedAt = typeof member.time === 'string' ? new Date(member.time) : null
    const signedDateTime = memberSignedAt && !Number.isNaN(memberSignedAt.getTime())
      ? memberSignedAt.toISOString()
      : nowIso()

    const crewInfo = {
      task_type: 'crew-signin',
      crew_login_information: {
        crew_name: member.name ?? '',
        crew_signature: member.signatureData ?? '',
        signed_datetime: signedDateTime,
        signin_comment: member.comment ?? '',
        acknowledged_by: '',
        acknowledged_datetime: null,
      },
    }

    const existing = existingById.get(taskId)
    if (existing) {
      await DataStore.save(
        (PreTaskPlanTaskDetail as any).copyOf(existing, (draft: any) => {
          draft.project_number = projectNumber
          draft.task_type = CREW_ROW_TYPE
          draft.crew_login_information = crewInfo
          draft.requirment_category = 'CREW_SIGNIN'
          draft.requirement_selected_value = JSON.stringify(member)
          draft.modified_by_user_id = userId ?? null
        })
      )
    } else {
      await DataStore.save(
        new (PreTaskPlanTaskDetail as any)({
          control_id: controlId,
          task_id: taskId,
          task_type: CREW_ROW_TYPE,
          project_number: projectNumber,
          crew_login_information: crewInfo,
          requirment_category: 'CREW_SIGNIN',
          requirement_selected_value: JSON.stringify(member),
          created_by_user_id: userId ?? null,
          modified_by_user_id: userId ?? null,
        })
      )
    }
  }

  for (const [taskId, row] of existingById.entries()) {
    if (!incomingIds.has(taskId)) {
      await DataStore.delete(row)
    }
  }
}

class PtpWorkflowService {
  async createWorkflow(input: CreateWorkflowInput): Promise<PtpWorkflowRecord> {
    const payload = createLocalRecord(input)
    const projectNumber = ((payload.tasks_json as any)?.project as string) || 'UNASSIGNED'
    const copiedFrom = payload.ptp_date ? `${payload.ptp_date}T00:00:00.000Z` : nowIso()

    await DataStore.save(
      new (PreTaskPlanControl as any)({
        control_id: payload.ptp_id,
        control_template_id: payload.ptp_type,
        control_name: payload.title || 'PTP Workflow',
        project_number: projectNumber,
        pretask_plan_status: toStatus(payload.status),
        copied_from_date: copiedFrom,
        created_by_user_id: payload.created_by,
        modified_by_user_id: payload.updated_by,
        shift_start_signature: {
          note: buildMetaNote({
            tasks: payload.tasks_json,
            'activity-controls': payload.activity_controls_json,
            requirements: payload.requirements_json,
            'emergency-contacts': payload.emergency_contacts_json,
            'ptp-review': payload.review_json,
            'ptp-day-closure': payload.day_closure_json,
          }),
        },
      })
    )

    if (Array.isArray((payload.tasks_json as any)?.tasks)) {
      await upsertTaskRows(payload.ptp_id, projectNumber, (payload.tasks_json as any).tasks, payload.updated_by ?? undefined)
    }
    if (Array.isArray(payload.crew_signin_json)) {
      await upsertCrewRows(payload.ptp_id, projectNumber, payload.crew_signin_json as any[], payload.updated_by ?? undefined)
    }

    return this.getWorkflow(payload.ptp_id)
  }

  async getWorkflow(ptpId: string): Promise<PtpWorkflowRecord> {
    const control = await getControlById(ptpId)
    if (!control) throw new Error('Workflow not found')
    const details = await getTaskRowsByControl(ptpId)
    return mapControlToRecord(control, details)
  }

  async listWorkflows(params: ListWorkflowParams = {}): Promise<PtpWorkflowRecord[]> {
    const controls = ((await DataStore.query(PreTaskPlanControl as any, Predicates.ALL) as any[]) ?? [])
    const details = ((await DataStore.query(PreTaskPlanTaskDetail as any, Predicates.ALL) as any[]) ?? [])
    const detailsByControlId = new Map<string, any[]>()

    for (const row of details as any[]) {
      if (!detailsByControlId.has(row.control_id)) detailsByControlId.set(row.control_id, [])
      detailsByControlId.get(row.control_id)!.push(row)
    }

    let normalized: PtpWorkflowRecord[] = (controls as any[]).map((control: any) =>
      mapControlToRecord(control, detailsByControlId.get(control.control_id) ?? [])
    )

    if (params.ptpType) normalized = normalized.filter((row: PtpWorkflowRecord) => row.ptp_type === params.ptpType)
    if (params.status) normalized = normalized.filter((row: PtpWorkflowRecord) => toStatus(row.status) === toStatus(params.status))

    normalized = normalized.filter((row: PtpWorkflowRecord) => {
      if (params.fromDate && row.ptp_date && row.ptp_date < params.fromDate) return false
      if (params.toDate && row.ptp_date && row.ptp_date > params.toDate) return false
      return true
    })

    normalized.sort((a: PtpWorkflowRecord, b: PtpWorkflowRecord) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
    return normalized.slice(0, params.limit ?? 200)
  }

  async isTitleDuplicate(title: string, currentPtpId?: string): Promise<boolean> {
    const normalizedTitle = title.trim().toLowerCase()
    if (!normalizedTitle) return false

    const controls = ((await DataStore.query(PreTaskPlanControl as any, Predicates.ALL) as any[]) ?? [])

    return controls.some((control: any) => {
      const controlId = String(control.control_id ?? '')
      if (currentPtpId && controlId === currentPtpId) return false

      const existingTitle = String(control.control_name ?? '').trim().toLowerCase()
      if (!existingTitle) return false

      return existingTitle === normalizedTitle
    })
  }

  async saveStep(
    ptpId: string,
    stepKey: PtpWorkflowStepKey,
    stepData: unknown,
    status?: string,
    updatedBy?: string
  ): Promise<PtpWorkflowRecord> {
    const requestedStatus = status ? toStatus(status) : undefined
    if (stepKey === 'ptp-review' && requestedStatus === 'reviewed') {
      const payload = (stepData ?? {}) as any
      const signature = typeof payload.supervisorSignature === 'string' ? payload.supervisorSignature.trim() : ''
      if (!signature) {
        throw new Error('Please provide your signature before proceeding.')
      }
    }

    let control = await getControlById(ptpId)
    if (!control) {
      control = await DataStore.save(
        new (PreTaskPlanControl as any)({
          control_id: ptpId,
          control_template_id: 'standard',
          control_name: 'PTP Workflow',
          project_number: 'UNASSIGNED',
          pretask_plan_status: toStatus(status),
          created_by_user_id: updatedBy ?? null,
          modified_by_user_id: updatedBy ?? null,
        })
      )
    }

    const meta = parseMetaNote(control.shift_start_signature?.note)
    meta[stepKey] = stepData ?? {}

    if (stepKey === 'tasks') {
      const payload = (stepData ?? {}) as any
      const nextProject = typeof payload.project === 'string' && payload.project.trim() ? payload.project.trim() : (control.project_number || 'UNASSIGNED')
      const nextTitle = typeof payload.ptpName === 'string' && payload.ptpName.trim() ? payload.ptpName.trim() : (control.control_name || 'PTP Workflow')

      control = await DataStore.save(
        (PreTaskPlanControl as any).copyOf(control, (draft: any) => {
          draft.project_number = nextProject
          draft.control_name = nextTitle
          draft.pretask_plan_status = toStatus(status ?? draft.pretask_plan_status)
          draft.modified_by_user_id = updatedBy ?? null
          draft.shift_start_signature = {
            ...(draft.shift_start_signature ?? {}),
            note: buildMetaNote(meta),
          }
        })
      )

      await upsertTaskRows(control.control_id, control.project_number || 'UNASSIGNED', Array.isArray(payload.tasks) ? payload.tasks : [], updatedBy)
    } else if (stepKey === 'crew-signin') {
      const members = Array.isArray(stepData) ? (stepData as any[]) : []
      control = await DataStore.save(
        (PreTaskPlanControl as any).copyOf(control, (draft: any) => {
          draft.pretask_plan_status = toStatus(status ?? draft.pretask_plan_status)
          draft.modified_by_user_id = updatedBy ?? null
          draft.shift_start_signature = {
            ...(draft.shift_start_signature ?? {}),
            note: buildMetaNote(meta),
          }
        })
      )

      await upsertCrewRows(control.control_id, control.project_number || 'UNASSIGNED', members, updatedBy)
    } else {
      control = await DataStore.save(
        (PreTaskPlanControl as any).copyOf(control, (draft: any) => {
          draft.pretask_plan_status = toStatus(status ?? draft.pretask_plan_status)
          draft.modified_by_user_id = updatedBy ?? null
          draft.shift_start_signature = {
            ...(draft.shift_start_signature ?? {}),
            note: buildMetaNote(meta),
          }

          if (stepKey === 'activity-controls') {
            const payload = (stepData ?? {}) as any
            draft.control_option = {
              ...(draft.control_option ?? {}),
              hazards_and_measure: [
                {
                  hazard_name: '__activity_payload__',
                  hazard_Measure: [JSON.stringify(payload)],
                  required_clearance_distance: null,
                },
              ],
            }
          }

          if (stepKey === 'requirements') {
            const payload = (stepData ?? {}) as any
            const selectedPermits = Object.entries(payload.permits ?? {}).filter(([, checked]) => Boolean(checked)).map(([name]) => name)
            const selectedChecklists = Object.entries(payload.checklists ?? {}).filter(([, checked]) => Boolean(checked)).map(([name]) => name)
            const selectedPpe = Object.entries(payload.ppeItems ?? {}).filter(([, checked]) => Boolean(checked)).map(([name]) => name)

            draft.control_option = {
              ...(draft.control_option ?? {}),
              required_permit: selectedPermits,
              required_checklist: selectedChecklists,
              required_ppe: selectedPpe.length ? [{ category: 'Selected PPE', required_PPE: selectedPpe }] : [],
            }
          }

          if (stepKey === 'emergency-contacts') {
            const payload = (stepData ?? {}) as any
            draft.emergency_information = {
              emergency_action_plan_discussion_indicator: Boolean(payload.emergencyPlanDiscussed),
              safety_professional_name: payload.safetyContact ?? '',
              superintendent_name: payload.superintendentContact ?? '',
              muster_location: payload.musterArea ?? '',
              note: payload.otherContact ?? '',
            }
          }

          if (stepKey === 'ptp-review') {
            const payload = (stepData ?? {}) as any
            draft.shift_start_review = {
              reviewer_name: payload.reviewerName ?? '',
              review_signature: payload.foremanSignature ?? '',
              signed_datetime: nowIso(),
              company_name: payload.reviewerCompany ?? '',
              note: payload.foremanComment ?? '',
            }
            draft.shift_start_signature = {
              ...(draft.shift_start_signature ?? {}),
              foreman_name: payload.supervisorName ?? '',
              foreman_signature: payload.supervisorSignature ?? '',
              signed_datetime: nowIso(),
              company_name: payload.supervisorCompany ?? '',
              note: buildMetaNote(meta),
            }
          }

          if (stepKey === 'ptp-day-closure') {
            const payload = (stepData ?? {}) as any
            const shift = payload.shift ?? {}
            draft.shift_end_review = {
              tools_stored_property_indicator: Boolean(shift.toolsCleaned),
              permit_closed_indicator: Boolean(shift.permitsClosed),
              incident_injury_indicator: Boolean(shift.anyIncidents),
              incident_reported_indicator: Boolean(shift.incidentReported),
              incident_description: shift.incidentDescription ?? '',
            }
            draft.shift_end_signature = {
              ...(draft.shift_end_signature ?? {}),
              foreman_name: payload.foremanName ?? '',
              foreman_signature: payload.foremanSignature ?? '',
              signed_datetime: nowIso(),
              company_name: payload.foremanCompany ?? '',
              note: JSON.stringify(payload.signOff ?? {}),
            }
          }
        })
      )
    }

    return this.getWorkflow(control.control_id)
  }

  async updateMeta(
    ptpId: string,
    input: { title?: string; trade?: string; ptpDate?: string; status?: string; updatedBy?: string }
  ): Promise<PtpWorkflowRecord> {
    const control = await getControlById(ptpId)
    if (!control) throw new Error('Workflow not found')

    await DataStore.save(
      (PreTaskPlanControl as any).copyOf(control, (draft: any) => {
        if (input.title !== undefined) draft.control_name = input.title || draft.control_name
        if (input.ptpDate !== undefined && input.ptpDate) draft.copied_from_date = `${input.ptpDate}T00:00:00.000Z`
        if (input.status !== undefined) draft.pretask_plan_status = toStatus(input.status)
        draft.modified_by_user_id = input.updatedBy ?? null
      })
    )

    return this.getWorkflow(ptpId)
  }

  async deleteWorkflow(ptpId: string): Promise<void> {
    const control = await getControlById(ptpId)
    if (!control) return

    const details = await getTaskRowsByControl(ptpId)
    for (const row of details) {
      await DataStore.delete(row)
    }

    await DataStore.delete(control)
  }
}

export default new PtpWorkflowService()
