import { DataStore } from 'aws-amplify/datastore'
import { getUrl, remove, uploadData } from 'aws-amplify/storage'
import {
  DailyReport,
  Subcontractor,
  ReportTask,
  ReportIncident,
  ReportEquipment,
  ReportSchedule,
  ReportDelivery,
  ReportObservation,
} from '@/models'
import amplifyconfig from '@/amplifyconfiguration.json'

const createUuid = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`

const APPSYNC_ENDPOINT = (amplifyconfig as { aws_appsync_graphqlEndpoint?: string }).aws_appsync_graphqlEndpoint
const APPSYNC_API_KEY = (amplifyconfig as { aws_appsync_apiKey?: string }).aws_appsync_apiKey
const OBSERVATION_ATTACHMENT_PREFIX = 'daily-report-observations'

const CREATE_REPORT_TASK = `
  mutation CreateReportTask($input: CreateReportTaskInput!) {
    createReportTask(input: $input) { id }
  }
`
const UPDATE_REPORT_TASK = `
  mutation UpdateReportTask($input: UpdateReportTaskInput!) {
    updateReportTask(input: $input) { id }
  }
`
const CREATE_REPORT_INCIDENT = `
  mutation CreateReportIncident($input: CreateReportIncidentInput!) {
    createReportIncident(input: $input) { id }
  }
`
const UPDATE_REPORT_INCIDENT = `
  mutation UpdateReportIncident($input: UpdateReportIncidentInput!) {
    updateReportIncident(input: $input) { id }
  }
`
const CREATE_REPORT_EQUIPMENT = `
  mutation CreateReportEquipment($input: CreateReportEquipmentInput!) {
    createReportEquipment(input: $input) { id }
  }
`
const UPDATE_REPORT_EQUIPMENT = `
  mutation UpdateReportEquipment($input: UpdateReportEquipmentInput!) {
    updateReportEquipment(input: $input) { id }
  }
`
const CREATE_REPORT_SCHEDULE = `
  mutation CreateReportSchedule($input: CreateReportScheduleInput!) {
    createReportSchedule(input: $input) { id }
  }
`
const UPDATE_REPORT_SCHEDULE = `
  mutation UpdateReportSchedule($input: UpdateReportScheduleInput!) {
    updateReportSchedule(input: $input) { id }
  }
`
const CREATE_REPORT_DELIVERY = `
  mutation CreateReportDelivery($input: CreateReportDeliveryInput!) {
    createReportDelivery(input: $input) { id }
  }
`
const UPDATE_REPORT_DELIVERY = `
  mutation UpdateReportDelivery($input: UpdateReportDeliveryInput!) {
    updateReportDelivery(input: $input) { id }
  }
`
const CREATE_REPORT_OBSERVATION = `
  mutation CreateReportObservation($input: CreateReportObservationInput!) {
    createReportObservation(input: $input) { id }
  }
`
const UPDATE_REPORT_OBSERVATION = `
  mutation UpdateReportObservation($input: UpdateReportObservationInput!) {
    updateReportObservation(input: $input) { id }
  }
`

async function appSyncRequest(query: string, variables: Record<string, unknown>): Promise<void> {
  if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
    throw new Error('Missing AppSync endpoint or API key in amplifyconfiguration.json')
  }

  const response = await fetch(APPSYNC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`AppSync request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string }>
  }
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((err) => err.message).filter(Boolean).join(', '))
  }
}

async function appSyncUpsert(createMutation: string, updateMutation: string, input: Record<string, unknown>) {
  try {
    await appSyncRequest(createMutation, { input })
  } catch {
    await appSyncRequest(updateMutation, { input })
  }
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const buildObservationAttachmentPath = (reportId: string, observationId: string, fileName: string) => {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${OBSERVATION_ATTACHMENT_PREFIX}/${reportId}/${observationId}/${Date.now()}-${safeName}`
}

// ── Subcontractor ──────────────────────────────────────────────────────────────
export const subcontractorStore = {
  async create(input: {
    id?: string
    reportId: string
    company: string
    projectName?: string
    workers: number
  }): Promise<Subcontractor> {
    return DataStore.save(
      new Subcontractor({
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        company: input.company,
        projectName: input.projectName,
        workers: input.workers,
      })
    )
  },
  async update(
    id: string,
    changes: { company?: string; projectName?: string; workers?: number }
  ): Promise<Subcontractor> {
    const original = await DataStore.query(Subcontractor, id)
    if (!original) throw new Error(`Subcontractor ${id} not found`)
    return DataStore.save(
      Subcontractor.copyOf(original, (u) => {
        if (changes.company !== undefined) u.company = changes.company
        if (changes.projectName !== undefined) u.projectName = changes.projectName
        if (changes.workers !== undefined) u.workers = changes.workers
      })
    )
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(Subcontractor, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<Subcontractor[]> {
    return DataStore.query(Subcontractor, (s) => s.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(Subcontractor, (s) => s.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
}

// ── ReportTask ─────────────────────────────────────────────────────────────────
export const reportTaskStore = {
  async create(input: {
    id?: string
    reportId: string
    company?: string
    workersOnSite?: number
    task?: string
    status?: string
    comments?: string
  }): Promise<ReportTask> {
    const modelInput = {
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        company: input.company,
        workersOnSite: input.workersOnSite,
        task: input.task,
        status: input.status ?? 'Not Started',
        comments: input.comments,
      }

    await appSyncUpsert(CREATE_REPORT_TASK, UPDATE_REPORT_TASK, modelInput)

    try {
      return await DataStore.save(new ReportTask(modelInput))
    } catch {
      return new ReportTask(modelInput)
    }
  },
  async update(
    id: string,
    changes: {
      company?: string
      workersOnSite?: number
      task?: string
      status?: string
      comments?: string
    }
  ): Promise<ReportTask> {
    const original = await DataStore.query(ReportTask, id)
    if (!original) throw new Error(`ReportTask ${id} not found`)
    const updated = await DataStore.save(
      ReportTask.copyOf(original, (u) => {
        if (changes.company !== undefined) u.company = changes.company
        if (changes.workersOnSite !== undefined) u.workersOnSite = changes.workersOnSite
        if (changes.task !== undefined) u.task = changes.task
        if (changes.status !== undefined) u.status = changes.status
        if (changes.comments !== undefined) u.comments = changes.comments
      })
    )
    await appSyncRequest(UPDATE_REPORT_TASK, {
      input: {
        id,
        ...changes,
      },
    })
    return updated
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(ReportTask, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<ReportTask[]> {
    return DataStore.query(ReportTask, (t) => t.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(ReportTask, (t) => t.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
}

// ── ReportIncident ─────────────────────────────────────────────────────────────
export const reportIncidentStore = {
  async create(input: {
    id?: string
    reportId: string
    level?: string
    title?: string
    time?: string
    details?: string
  }): Promise<ReportIncident> {
    const modelInput = {
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        level: input.level ?? 'Low',
        title: input.title,
        time: input.time,
        details: input.details,
      }

    await appSyncUpsert(CREATE_REPORT_INCIDENT, UPDATE_REPORT_INCIDENT, modelInput)

    try {
      return await DataStore.save(new ReportIncident(modelInput))
    } catch {
      return new ReportIncident(modelInput)
    }
  },
  async update(
    id: string,
    changes: { level?: string; title?: string; time?: string; details?: string }
  ): Promise<ReportIncident> {
    const original = await DataStore.query(ReportIncident, id)
    if (!original) throw new Error(`ReportIncident ${id} not found`)
    const updated = await DataStore.save(
      ReportIncident.copyOf(original, (u) => {
        if (changes.level !== undefined) u.level = changes.level
        if (changes.title !== undefined) u.title = changes.title
        if (changes.time !== undefined) u.time = changes.time
        if (changes.details !== undefined) u.details = changes.details
      })
    )
    await appSyncRequest(UPDATE_REPORT_INCIDENT, {
      input: {
        id,
        ...changes,
      },
    })
    return updated
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(ReportIncident, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<ReportIncident[]> {
    return DataStore.query(ReportIncident, (i) => i.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(ReportIncident, (i) => i.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
}

// ── ReportEquipment ────────────────────────────────────────────────────────────
export const reportEquipmentStore = {
  async create(input: {
    id?: string
    reportId: string
    name: string
  }): Promise<ReportEquipment> {
    const modelInput = {
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        name: input.name,
      }

    await appSyncUpsert(CREATE_REPORT_EQUIPMENT, UPDATE_REPORT_EQUIPMENT, modelInput)

    try {
      return await DataStore.save(new ReportEquipment(modelInput))
    } catch {
      return new ReportEquipment(modelInput)
    }
  },
  async update(id: string, changes: { name?: string }): Promise<ReportEquipment> {
    const original = await DataStore.query(ReportEquipment, id)
    if (!original) throw new Error(`ReportEquipment ${id} not found`)
    const updated = await DataStore.save(
      ReportEquipment.copyOf(original, (u) => {
        if (changes.name !== undefined) u.name = changes.name
      })
    )
    await appSyncRequest(UPDATE_REPORT_EQUIPMENT, {
      input: {
        id,
        ...changes,
      },
    })
    return updated
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(ReportEquipment, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<ReportEquipment[]> {
    return DataStore.query(ReportEquipment, (e) => e.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(ReportEquipment, (e) => e.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
}

// ── ReportSchedule ─────────────────────────────────────────────────────────────
export const reportScheduleStore = {
  async create(input: {
    id?: string
    reportId: string
    level?: string
    impact?: string
    description?: string
    impactDays?: string
  }): Promise<ReportSchedule> {
    const modelInput = {
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        level: input.level ?? 'Medium',
        impact: input.impact,
        description: input.description,
        impactDays: input.impactDays,
      }

    await appSyncUpsert(CREATE_REPORT_SCHEDULE, UPDATE_REPORT_SCHEDULE, modelInput)

    try {
      return await DataStore.save(new ReportSchedule(modelInput))
    } catch {
      return new ReportSchedule(modelInput)
    }
  },
  async update(
    id: string,
    changes: { level?: string; impact?: string; description?: string; impactDays?: string }
  ): Promise<ReportSchedule> {
    const original = await DataStore.query(ReportSchedule, id)
    if (!original) throw new Error(`ReportSchedule ${id} not found`)
    const updated = await DataStore.save(
      ReportSchedule.copyOf(original, (u) => {
        if (changes.level !== undefined) u.level = changes.level
        if (changes.impact !== undefined) u.impact = changes.impact
        if (changes.description !== undefined) u.description = changes.description
        if (changes.impactDays !== undefined) u.impactDays = changes.impactDays
      })
    )
    await appSyncRequest(UPDATE_REPORT_SCHEDULE, {
      input: {
        id,
        ...changes,
      },
    })
    return updated
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(ReportSchedule, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<ReportSchedule[]> {
    return DataStore.query(ReportSchedule, (s) => s.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(ReportSchedule, (s) => s.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
}

// ── ReportDelivery ─────────────────────────────────────────────────────────────
export const reportDeliveryStore = {
  async create(input: {
    id?: string
    reportId: string
    supplier?: string
    material?: string
    time?: string
    received?: boolean
  }): Promise<ReportDelivery> {
    const modelInput = {
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        supplier: input.supplier,
        material: input.material,
        time: input.time,
        received: input.received ?? false,
      }

    await appSyncUpsert(CREATE_REPORT_DELIVERY, UPDATE_REPORT_DELIVERY, modelInput)

    try {
      return await DataStore.save(new ReportDelivery(modelInput))
    } catch {
      return new ReportDelivery(modelInput)
    }
  },
  async update(
    id: string,
    changes: { supplier?: string; material?: string; time?: string; received?: boolean }
  ): Promise<ReportDelivery> {
    const original = await DataStore.query(ReportDelivery, id)
    if (!original) throw new Error(`ReportDelivery ${id} not found`)
    const updated = await DataStore.save(
      ReportDelivery.copyOf(original, (u) => {
        if (changes.supplier !== undefined) u.supplier = changes.supplier
        if (changes.material !== undefined) u.material = changes.material
        if (changes.time !== undefined) u.time = changes.time
        if (changes.received !== undefined) u.received = changes.received
      })
    )
    await appSyncRequest(UPDATE_REPORT_DELIVERY, {
      input: {
        id,
        ...changes,
      },
    })
    return updated
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(ReportDelivery, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<ReportDelivery[]> {
    return DataStore.query(ReportDelivery, (d) => d.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(ReportDelivery, (d) => d.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
}

// ── ReportObservation ──────────────────────────────────────────────────────────
export const reportObservationStore = {
  async create(input: {
    id?: string
    reportId: string
    category?: string
    author?: string
    details?: string
    attachmentKeys?: string[]
  }): Promise<ReportObservation> {
    const modelInput = {
        id: input.id ?? createUuid(),
        reportId: input.reportId,
        category: input.category ?? 'Safety',
        author: input.author,
        details: input.details,
        attachmentKeys: input.attachmentKeys,
      }

    await appSyncUpsert(CREATE_REPORT_OBSERVATION, UPDATE_REPORT_OBSERVATION, modelInput)

    try {
      return await DataStore.save(new ReportObservation(modelInput))
    } catch {
      return new ReportObservation(modelInput)
    }
  },
  async update(
    id: string,
    changes: { category?: string; author?: string; details?: string; attachmentKeys?: string[] }
  ): Promise<ReportObservation> {
    const original = await DataStore.query(ReportObservation, id)
    if (!original) throw new Error(`ReportObservation ${id} not found`)
    const updated = await DataStore.save(
      ReportObservation.copyOf(original, (u) => {
        if (changes.category !== undefined) u.category = changes.category
        if (changes.author !== undefined) u.author = changes.author
        if (changes.details !== undefined) u.details = changes.details
        if (changes.attachmentKeys !== undefined) u.attachmentKeys = changes.attachmentKeys
      })
    )
    await appSyncRequest(UPDATE_REPORT_OBSERVATION, {
      input: {
        id,
        ...changes,
      },
    })
    return updated
  },
  async delete(id: string): Promise<void> {
    const item = await DataStore.query(ReportObservation, id)
    if (item) await DataStore.delete(item)
  },
  async listByReportId(reportId: string): Promise<ReportObservation[]> {
    return DataStore.query(ReportObservation, (o) => o.reportId.eq(reportId))
  },
  async deleteAllByReportId(reportId: string): Promise<void> {
    const items = await DataStore.query(ReportObservation, (o) => o.reportId.eq(reportId))
    await Promise.all(items.map((item) => DataStore.delete(item)))
  },
  async uploadAttachment(reportId: string, observationId: string, file: File): Promise<string> {
    const path = buildObservationAttachmentPath(reportId, observationId, file.name)
    try {
      await uploadData({ path, data: file, options: { contentType: file.type || 'application/octet-stream' } }).result
      return path
    } catch {
      // Fallback keeps behavior functional if Storage is not configured yet.
      return fileToDataUrl(file)
    }
  },
  async resolveAttachmentUrl(key: string): Promise<string> {
    if (key.startsWith('data:')) return key
    try {
      const result = await getUrl({ path: key })
      return result.url.toString()
    } catch {
      return ''
    }
  },
  async removeAttachment(key: string): Promise<void> {
    if (key.startsWith('data:')) return
    try {
      await remove({ path: key })
    } catch {
      // Ignore removal failures so record deletion is not blocked.
    }
  },
}

// ── DailyReport ────────────────────────────────────────────────────────────────
export type DailyReportStoreInput = {
  reportId: string
  userId: string
  reportDate: string
  employeeName?: string
  trade?: string
  taskDetails?: string
  hoursWorked?: number
  status?: string
  remarks?: string
}

export const dailyReportStore = {
  async get(reportId: string): Promise<DailyReport | undefined> {
    const results = await DataStore.query(DailyReport, (dr) => dr.reportId.eq(reportId))
    return results[0]
  },
  async create(input: DailyReportStoreInput): Promise<DailyReport> {
    return DataStore.save(new DailyReport(input))
  },
  async upsert(input: DailyReportStoreInput): Promise<DailyReport> {
    const existing = await DataStore.query(DailyReport, (dr) => dr.reportId.eq(input.reportId))
    if (existing.length > 0) {
      return DataStore.save(
        DailyReport.copyOf(existing[0], (u) => {
          if (input.employeeName !== undefined) u.employeeName = input.employeeName
          if (input.trade !== undefined) u.trade = input.trade
          if (input.taskDetails !== undefined) u.taskDetails = input.taskDetails
          if (input.hoursWorked !== undefined) u.hoursWorked = input.hoursWorked
          if (input.status !== undefined) u.status = input.status
          if (input.remarks !== undefined) u.remarks = input.remarks
        })
      )
    }
    return DataStore.save(new DailyReport(input))
  },
  async listByUserId(userId: string): Promise<DailyReport[]> {
    return DataStore.query(DailyReport, (dr) => dr.userId.eq(userId))
  },
  async listAll(): Promise<DailyReport[]> {
    return DataStore.query(DailyReport)
  },
  async deleteByReportId(reportId: string): Promise<void> {
    const existing = await DataStore.query(DailyReport, (dr) => dr.reportId.eq(reportId))
    await Promise.all(existing.map((item) => DataStore.delete(item)))
  },
}
