import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  DailyReportTab,
  DeliveryItem,
  EquipmentItem,
  IncidentItem,
  ObservationItem,
  ScheduleItem,
  SubcontractorItem,
  TaskItem,
} from '@/features/dailyReports/types'
import { RootState } from '@/store'
import Modal from '@/components/common/Modal'
import DeleteConfirmModal from '@/features/dailyReports/components/DeleteConfirmModal'
import { SummaryCardData } from '@/features/dailyReports/components/SummaryCards'
import {
  subcontractorStore,
  reportTaskStore,
  reportIncidentStore,
  reportEquipmentStore,
  reportScheduleStore,
  reportDeliveryStore,
  reportObservationStore,
  dailyReportStore,
  DailyReportStoreInput,
} from '@/services/datastore'
import styles from './DailyReports.module.css'

type AddModalDraft =
  | { kind: 'subcontractor'; company: string; projectName: string; workers: number }
  | { kind: 'task'; company: string; workersOnSite: number; task: string; status: string; comments: string }
  | { kind: 'incident'; level: string; title: string; time: string; details: string }
  | { kind: 'equipment'; name: string }
  | { kind: 'schedule'; level: string; description: string; impactDays: string }
  | { kind: 'delivery'; supplier: string; material: string; time: string; received: boolean }
  | { kind: 'observation'; category: string; author: string; details: string }
  | null

type EditModalDraft =
  | { kind: 'subcontractor'; id: string; company: string; projectName: string; workers: number }
  | { kind: 'task'; id: string; company: string; workersOnSite: number; task: string; status: string; comments: string }
  | { kind: 'incident'; id: string; level: string; title: string; time: string; details: string }
  | { kind: 'equipment'; id: string; name: string }
  | { kind: 'schedule'; id: string; level: string; description: string; impactDays: string }
  | { kind: 'delivery'; id: string; supplier: string; material: string; time: string; received: boolean }
  | { kind: 'observation'; id: string; category: string; author: string; details: string }
  | null

interface DailyReportWorkspaceProps {
  /** undefined = brand-new report (create mode); string = load existing (edit mode) */
  reportId: string | undefined
  activeTab: DailyReportTab
  onGeneratePreview?: (reportId: string) => void
  onBackFromPreview?: () => void
  onFinalizeReport?: () => void
  onMetadataChange?: (metadata: { projectSite: string; createdDate: string }) => void
  onSummaryChange?: (cards: SummaryCardData[]) => void
  onPrev?: () => void
  onRegisterSaveHandler?: (handler: (() => Promise<void>) | null) => void
  onFooterStateChange?: (state: { isEditing: boolean; isLoading: boolean; canSubmit: boolean }) => void
}

type ItemKind =
  | 'subcontractor'
  | 'task'
  | 'incident'
  | 'equipment'
  | 'schedule'
  | 'delivery'
  | 'observation'

const getTodayDate = () => new Date().toISOString().split('T')[0]

const getCurrentTimeLabel = () => {
  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`
}

const createUuid = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const DailyReportWorkspace: React.FC<DailyReportWorkspaceProps> = ({
  reportId,
  activeTab,
  onGeneratePreview,
  onBackFromPreview,
  onFinalizeReport,
  onMetadataChange,
  onSummaryChange,
  onPrev,
  onRegisterSaveHandler,
  onFooterStateChange,
}) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const defaultUserId = user?.id ?? 'demo-001'
  const isEditMode = Boolean(reportId)

  // ─── Section state ─────────────────────────────────────────────────────────
  const [subcontractors, setSubcontractors] = useState<SubcontractorItem[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [incidents, setIncidents] = useState<IncidentItem[]>([])
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([])
  const [observations, setObservations] = useState<ObservationItem[]>([])

  // ─── Header / report meta ──────────────────────────────────────────────────
  const [currentReportId, setCurrentReportId] = useState<string | undefined>(reportId)
  const [reportDate, setReportDate] = useState(getTodayDate())
  const [employeeName, setEmployeeName] = useState(
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  )
  const [trade, setTrade] = useState('')
  const [hoursWorked, setHoursWorked] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState('Not Started')
  const [remarks, setRemarks] = useState('')

  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [itemDeleteState, setItemDeleteState] = useState<{
    open: boolean
    kind: ItemKind
    itemId: string
    message: string
  }>({ open: false, kind: 'task', itemId: '', message: '' })
  const [addDraft, setAddDraft] = useState<AddModalDraft>(null)
  const [editDraft, setEditDraft] = useState<EditModalDraft>(null)
  const [observationFiles, setObservationFiles] = useState<File[]>([])
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  const observationPreviews = useMemo(() => {
    return observationFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))
  }, [observationFiles])

  useEffect(() => {
    return () => {
      observationPreviews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [observationPreviews])

  const workersTotal = useMemo(
    () => subcontractors.reduce((sum, s) => sum + s.workers, 0),
    [subcontractors]
  )

  const persistAllSections = useCallback(async (resolvedReportId: string) => {
    await Promise.all([
      ...subcontractors.map(async (item) => {
        try {
          await subcontractorStore.update(item.id, {
            company: item.company,
            projectName: item.projectName,
            workers: item.workers,
          })
        } catch {
          await subcontractorStore.create({
            id: item.id,
            reportId: resolvedReportId,
            company: item.company,
            projectName: item.projectName,
            workers: item.workers,
          })
        }
      }),
      ...tasks.map(async (item) => {
        try {
          await reportTaskStore.update(item.id, {
            company: item.company,
            workersOnSite: item.workersOnSite,
            task: item.task,
            status: item.status,
            comments: item.comments,
          })
        } catch {
          await reportTaskStore.create({
            id: item.id,
            reportId: resolvedReportId,
            company: item.company,
            workersOnSite: item.workersOnSite,
            task: item.task,
            status: item.status,
            comments: item.comments,
          })
        }
      }),
      ...incidents.map(async (item) => {
        try {
          await reportIncidentStore.update(item.id, {
            level: item.level,
            title: item.title,
            time: item.time,
            details: item.details,
          })
        } catch {
          await reportIncidentStore.create({
            id: item.id,
            reportId: resolvedReportId,
            level: item.level,
            title: item.title,
            time: item.time,
            details: item.details,
          })
        }
      }),
      ...equipment.map(async (item) => {
        try {
          await reportEquipmentStore.update(item.id, { name: item.name })
        } catch {
          await reportEquipmentStore.create({
            id: item.id,
            reportId: resolvedReportId,
            name: item.name,
          })
        }
      }),
      ...schedule.map(async (item) => {
        try {
          await reportScheduleStore.update(item.id, {
            level: item.level,
            impact: item.impact,
            description: item.description,
            impactDays: item.impactDays,
          })
        } catch {
          await reportScheduleStore.create({
            id: item.id,
            reportId: resolvedReportId,
            level: item.level,
            impact: item.impact,
            description: item.description,
            impactDays: item.impactDays,
          })
        }
      }),
      ...deliveries.map(async (item) => {
        try {
          await reportDeliveryStore.update(item.id, {
            supplier: item.supplier,
            material: item.material,
            time: item.time,
            received: item.received,
          })
        } catch {
          await reportDeliveryStore.create({
            id: item.id,
            reportId: resolvedReportId,
            supplier: item.supplier,
            material: item.material,
            time: item.time,
            received: item.received,
          })
        }
      }),
      ...observations.map(async (item) => {
        try {
          await reportObservationStore.update(item.id, {
            category: item.category,
            author: item.author,
            details: item.details,
            attachmentKeys: item.attachmentKeys ?? [],
          })
        } catch {
          await reportObservationStore.create({
            id: item.id,
            reportId: resolvedReportId,
            category: item.category,
            author: item.author,
            details: item.details,
            attachmentKeys: item.attachmentKeys ?? [],
          })
        }
      }),
    ])
  }, [deliveries, equipment, incidents, observations, schedule, subcontractors, tasks])

  // ─── On mount: load existing report data when in edit mode ─────────────────
  useEffect(() => {
    if (!isEditMode || !reportId) return

    const load = async () => {
      setLoading(true)
      try {
        const [report, subs, taskRows, incidentRows, eqRows, schedRows, delRows, obsRows] =
          await Promise.all([
            dailyReportStore.get(reportId),
            subcontractorStore.listByReportId(reportId),
            reportTaskStore.listByReportId(reportId),
            reportIncidentStore.listByReportId(reportId),
            reportEquipmentStore.listByReportId(reportId),
            reportScheduleStore.listByReportId(reportId),
            reportDeliveryStore.listByReportId(reportId),
            reportObservationStore.listByReportId(reportId),
          ])

        if (report) {
          setCurrentReportId(report.reportId)
          setReportDate(report.reportDate)
          setEmployeeName(report.employeeName ?? '')
          setTrade(report.trade ?? '')
          setHoursWorked(report.hoursWorked ?? undefined)
          setStatus(report.status ?? 'Not Started')
          setRemarks(report.remarks ?? '')
        }

        setSubcontractors(
          subs.map((s) => ({
            id: s.id,
            company: s.company,
            projectName: s.projectName ?? undefined,
            workers: s.workers,
          }))
        )
        setTasks(
          taskRows.map((t) => ({
            id: t.id,
            company: t.company ?? '',
            workersOnSite: t.workersOnSite ?? 0,
            task: t.task ?? '',
            status: (t.status as TaskItem['status']) ?? 'Not Started',
            comments: t.comments ?? '',
          }))
        )
        setIncidents(
          incidentRows.map((i) => ({
            id: i.id,
            level: (i.level as IncidentItem['level']) ?? 'Low',
            title: i.title ?? '',
            time: i.time ?? '',
            details: i.details ?? '',
          }))
        )
        setEquipment(eqRows.map((e) => ({ id: e.id, name: e.name })))
        setSchedule(
          schedRows.map((s) => ({
            id: s.id,
            level: (s.level as ScheduleItem['level']) ?? 'Medium',
            impact: s.impact ?? '',
            description: s.description ?? '',
            impactDays: s.impactDays ?? '',
          }))
        )
        setDeliveries(
          delRows.map((d) => ({
            id: d.id,
            supplier: d.supplier ?? '',
            material: d.material ?? '',
            time: d.time ?? '',
            received: d.received ?? false,
          }))
        )
        const mappedObservations = await Promise.all(
          obsRows.map(async (o) => {
            const attachmentKeys = (o.attachmentKeys ?? []).filter(
              (key): key is string => Boolean(key && key.length > 0)
            )
            const resolvedAttachments = (
              await Promise.all(
                attachmentKeys.map((key) => reportObservationStore.resolveAttachmentUrl(key))
              )
            ).filter(Boolean)

            return {
              id: o.id,
              category: o.category ?? 'Safety',
              author: o.author ?? '',
              details: o.details ?? '',
              attachmentKeys,
              attachments: resolvedAttachments,
            }
          })
        )
        setObservations(mappedObservations)
      } catch (err) {
        console.error('Failed to load report data:', err)
      } finally {
        setLoading(false)
      }
    }

    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId])

  // Notify parent of state changes
  useEffect(() => {
    onFooterStateChange?.({ isEditing: Boolean(currentReportId), isLoading: loading || isSaving, canSubmit: true })
  }, [currentReportId, isSaving, loading, onFooterStateChange])

  // Notify parent of metadata changes
  useEffect(() => {
    if (trade) {
      const formattedDate = reportDate ? new Date(reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
      onMetadataChange?.({ projectSite: trade, createdDate: formattedDate })
    }
  }, [trade, reportDate, onMetadataChange])

  // ─── Ensure a DailyReport header record exists (lazy-create on first save) ──
  const ensureReportHeader = useCallback(async (): Promise<string> => {
    if (currentReportId) return currentReportId
    const newId = createUuid()
    const payload: DailyReportStoreInput = {
      reportId: newId,
      userId: defaultUserId,
      reportDate,
      employeeName,
      trade,
      hoursWorked,
      status,
      remarks,
    }
    await dailyReportStore.create(payload)
    setCurrentReportId(newId)
    return newId
  }, [currentReportId, defaultUserId, reportDate, employeeName, trade, hoursWorked, status, remarks])

  // ─── Save report header metadata ──────────────────────────────────────────
  const saveReportHeader = useCallback(async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const id = await ensureReportHeader()
      const payload: DailyReportStoreInput = {
        reportId: id,
        userId: defaultUserId,
        reportDate,
        employeeName,
        trade,
        hoursWorked,
        status,
        remarks,
      }
      await persistAllSections(id)
      await dailyReportStore.upsert(payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      return id
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save report')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [ensureReportHeader, defaultUserId, reportDate, employeeName, trade, hoursWorked, status, remarks, persistAllSections])

  useEffect(() => {
    if (!onRegisterSaveHandler) return
    onRegisterSaveHandler(async () => {
      await saveReportHeader()
    })
    return () => onRegisterSaveHandler(null)
  }, [onRegisterSaveHandler, saveReportHeader])

  // ─── Delete helpers ────────────────────────────────────────────────────────
  const openDeleteModal = (kind: ItemKind, itemId: string, message: string) => {
    setItemDeleteState({ open: true, kind, itemId, message })
  }

  const confirmDelete = async () => {
    const { kind, itemId } = itemDeleteState
    if (kind === 'subcontractor') {
      await subcontractorStore.delete(itemId)
      setSubcontractors((p) => p.filter((x) => x.id !== itemId))
    } else if (kind === 'task') {
      await reportTaskStore.delete(itemId)
      setTasks((p) => p.filter((x) => x.id !== itemId))
    } else if (kind === 'incident') {
      await reportIncidentStore.delete(itemId)
      setIncidents((p) => p.filter((x) => x.id !== itemId))
    } else if (kind === 'equipment') {
      await reportEquipmentStore.delete(itemId)
      setEquipment((p) => p.filter((x) => x.id !== itemId))
    } else if (kind === 'schedule') {
      await reportScheduleStore.delete(itemId)
      setSchedule((p) => p.filter((x) => x.id !== itemId))
    } else if (kind === 'delivery') {
      await reportDeliveryStore.delete(itemId)
      setDeliveries((p) => p.filter((x) => x.id !== itemId))
    } else if (kind === 'observation') {
      const existing = observations.find((x) => x.id === itemId)
      if (existing?.attachmentKeys?.length) {
        await Promise.all(existing.attachmentKeys.map((key) => reportObservationStore.removeAttachment(key)))
      }
      await reportObservationStore.delete(itemId)
      setObservations((p) => p.filter((x) => x.id !== itemId))
    }
    setItemDeleteState((prev) => ({ ...prev, open: false }))
  }

  // ─── Add via modal ─────────────────────────────────────────────────────────
  const openAddModal = (kind: Exclude<AddModalDraft, null>['kind'], defaults?: Partial<Exclude<AddModalDraft, null>>) => {
    setObservationFiles([])
    if (kind === 'subcontractor') setAddDraft({ kind, company: '', projectName: '', workers: 0 })
    else if (kind === 'task') setAddDraft({ kind, company: (defaults as {company?:string})?.company ?? '', workersOnSite: 0, task: '', status: 'Not Started', comments: '' })
    else if (kind === 'incident') setAddDraft({ kind, level: 'Low', title: '', time: getCurrentTimeLabel(), details: '' })
    else if (kind === 'equipment') setAddDraft({ kind, name: '' })
    else if (kind === 'schedule') setAddDraft({ kind, level: 'Medium', description: '', impactDays: '' })
    else if (kind === 'delivery') setAddDraft({ kind, supplier: '', material: '', time: '', received: false })
    else if (kind === 'observation') setAddDraft({ kind, category: 'Received', author: '', details: '' })
  }

  const closeAddModal = () => {
    setAddDraft(null)
    setObservationFiles([])
  }

  const appendObservationFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setObservationFiles((prev) => [...prev, ...Array.from(files)].slice(0, 6))
  }

  const openEditModal = (
    item:
      | ({ kind: 'subcontractor' } & SubcontractorItem)
      | ({ kind: 'task' } & TaskItem)
      | ({ kind: 'incident' } & IncidentItem)
      | ({ kind: 'equipment' } & EquipmentItem)
      | ({ kind: 'schedule' } & ScheduleItem)
      | ({ kind: 'delivery' } & DeliveryItem)
      | ({ kind: 'observation' } & ObservationItem)
  ) => {
    if (item.kind === 'subcontractor') {
      setEditDraft({ kind: 'subcontractor', id: item.id, company: item.company, projectName: item.projectName ?? '', workers: item.workers })
    } else if (item.kind === 'task') {
      setEditDraft({ kind: 'task', id: item.id, company: item.company, workersOnSite: item.workersOnSite, task: item.task, status: item.status, comments: item.comments })
    } else if (item.kind === 'incident') {
      setEditDraft({ kind: 'incident', id: item.id, level: item.level, title: item.title, time: item.time, details: item.details })
    } else if (item.kind === 'equipment') {
      setEditDraft({ kind: 'equipment', id: item.id, name: item.name })
    } else if (item.kind === 'schedule') {
      setEditDraft({ kind: 'schedule', id: item.id, level: item.level, description: item.description || item.impact, impactDays: item.impactDays })
    } else if (item.kind === 'delivery') {
      setEditDraft({ kind: 'delivery', id: item.id, supplier: item.supplier, material: item.material, time: item.time, received: item.received })
    } else if (item.kind === 'observation') {
      setEditDraft({ kind: 'observation', id: item.id, category: item.category, author: item.author, details: item.details })
    }
  }

  const saveFromModal = async () => {
    if (!addDraft) return
    const rId = await ensureReportHeader()
    if (addDraft.kind === 'subcontractor') {
      const created = await subcontractorStore.create({ reportId: rId, company: addDraft.company, projectName: addDraft.projectName, workers: addDraft.workers })
      setSubcontractors((prev) => [...prev, { id: created.id, company: addDraft.company, projectName: addDraft.projectName, workers: addDraft.workers }])
    } else if (addDraft.kind === 'task') {
      const created = await reportTaskStore.create({ reportId: rId, company: addDraft.company, workersOnSite: addDraft.workersOnSite, task: addDraft.task, status: addDraft.status, comments: addDraft.comments })
      setTasks((prev) => [...prev, { id: created.id, company: addDraft.company, workersOnSite: addDraft.workersOnSite, task: addDraft.task, status: addDraft.status as TaskItem['status'], comments: addDraft.comments }])
    } else if (addDraft.kind === 'incident') {
      const created = await reportIncidentStore.create({ reportId: rId, level: addDraft.level, title: addDraft.title, time: addDraft.time, details: addDraft.details })
      setIncidents((prev) => [{ id: created.id, level: addDraft.level as IncidentItem['level'], title: addDraft.title, time: addDraft.time, details: addDraft.details }, ...prev])
    } else if (addDraft.kind === 'equipment') {
      const created = await reportEquipmentStore.create({ reportId: rId, name: addDraft.name })
      setEquipment((prev) => [...prev, { id: created.id, name: addDraft.name }])
    } else if (addDraft.kind === 'schedule') {
      const created = await reportScheduleStore.create({ reportId: rId, level: addDraft.level, impact: addDraft.description, description: addDraft.description, impactDays: addDraft.impactDays })
      setSchedule((prev) => [...prev, { id: created.id, level: addDraft.level as ScheduleItem['level'], impact: addDraft.description, description: addDraft.description, impactDays: addDraft.impactDays }])
    } else if (addDraft.kind === 'delivery') {
      const created = await reportDeliveryStore.create({ reportId: rId, supplier: addDraft.supplier, material: addDraft.material, time: addDraft.time, received: addDraft.received })
      setDeliveries((prev) => [...prev, { id: created.id, supplier: addDraft.supplier, material: addDraft.material, time: addDraft.time, received: addDraft.received }])
    } else if (addDraft.kind === 'observation') {
      const observationId = createUuid()
      const attachmentKeys = await Promise.all(
        observationFiles.map((file) => reportObservationStore.uploadAttachment(rId, observationId, file))
      )
      const attachments = (
        await Promise.all(
          attachmentKeys.map((key) => reportObservationStore.resolveAttachmentUrl(key))
        )
      ).filter(Boolean)
      await reportObservationStore.create({
        id: observationId,
        reportId: rId,
        category: addDraft.category,
        author: addDraft.author,
        details: addDraft.details,
        attachmentKeys,
      })
      setObservations((prev) => [
        ...prev,
        {
          id: observationId,
          category: addDraft.category,
          author: addDraft.author,
          details: addDraft.details,
          attachmentKeys,
          attachments,
        },
      ])
    }
    closeAddModal()
  }

  const renderAddModal = () => {
    if (!addDraft) return null
    const titleMap: Record<string, string> = {
      subcontractor: 'Add Subcontractor',
      task: 'Add Task',
      incident: 'Add Incident',
      equipment: 'Add Equipment',
      schedule: 'Add Schedule Impact',
      delivery: 'Add Delivery',
      observation: 'Add Observation',
    }
    return (
      <Modal
        isOpen
        title={titleMap[addDraft.kind] ?? 'Add Item'}
        onClose={closeAddModal}
        onSubmit={() => void saveFromModal()}
        submitText="Save"
        showCancel={false}
        width="sm"
      >
        <div className={styles.addModalForm}>
          {addDraft.kind === 'subcontractor' && (
            <>
              <label className={styles.addModalField}>
                <span>Company</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.company}
                  onChange={(e) => setAddDraft({ ...addDraft, company: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Project Name</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.projectName}
                  onChange={(e) => setAddDraft({ ...addDraft, projectName: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Workers</span>
                <input className={styles.input} type="number" placeholder="Enter Input" value={addDraft.workers || ''}
                  onChange={(e) => setAddDraft({ ...addDraft, workers: Number(e.target.value) || 0 })} />
              </label>
            </>
          )}
          {addDraft.kind === 'task' && (
            <>
              <label className={styles.addModalField}>
                <span>Company</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.company}
                  onChange={(e) => setAddDraft({ ...addDraft, company: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Workers On Site</span>
                <input className={styles.input} type="number" placeholder="Enter Input" value={addDraft.workersOnSite || ''}
                  onChange={(e) => setAddDraft({ ...addDraft, workersOnSite: Number(e.target.value) || 0 })} />
              </label>
              <label className={styles.addModalField}>
                <span>Task</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.task}
                  onChange={(e) => setAddDraft({ ...addDraft, task: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Status</span>
                <select className={styles.select} value={addDraft.status}
                  onChange={(e) => setAddDraft({ ...addDraft, status: e.target.value })}>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </label>
              <label className={styles.addModalField}>
                <span>Comments</span>
                <textarea className={styles.textarea} placeholder="Enter Input" value={addDraft.comments}
                  onChange={(e) => setAddDraft({ ...addDraft, comments: e.target.value })} />
              </label>
            </>
          )}
          {addDraft.kind === 'incident' && (
            <>
              <label className={styles.addModalField}>
                <span>Level</span>
                <select className={styles.select} value={addDraft.level}
                  onChange={(e) => setAddDraft({ ...addDraft, level: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <label className={styles.addModalField}>
                <span>Title</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.title}
                  onChange={(e) => setAddDraft({ ...addDraft, title: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Time</span>
                <input className={styles.input} placeholder="HH:MM AM/PM" value={addDraft.time} readOnly />
              </label>
              <label className={styles.addModalField}>
                <span>Details</span>
                <textarea className={styles.textarea} placeholder="Enter Input" value={addDraft.details}
                  onChange={(e) => setAddDraft({ ...addDraft, details: e.target.value })} />
              </label>
            </>
          )}
          {addDraft.kind === 'equipment' && (
            <label className={styles.addModalField}>
              <span>Equipment Name</span>
              <input className={styles.input} placeholder="Enter Input" value={addDraft.name}
                onChange={(e) => setAddDraft({ ...addDraft, name: e.target.value })} />
            </label>
          )}
          {addDraft.kind === 'schedule' && (
            <>
              <label className={styles.addModalField}>
                <span>Level</span>
                <select className={styles.select} value={addDraft.level}
                  onChange={(e) => setAddDraft({ ...addDraft, level: e.target.value })}>
                  <option>Medium</option>
                  <option>Positive</option>
                </select>
              </label>
              <label className={styles.addModalField}>
                <span>Description</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.description}
                  onChange={(e) => setAddDraft({ ...addDraft, description: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Impact Days</span>
                <input className={styles.input} placeholder="e.g. +0.5" value={addDraft.impactDays}
                  onChange={(e) => setAddDraft({ ...addDraft, impactDays: e.target.value })} />
              </label>
            </>
          )}
          {addDraft.kind === 'delivery' && (
            <>
              <label className={styles.addModalField}>
                <span>Supplier</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.supplier}
                  onChange={(e) => setAddDraft({ ...addDraft, supplier: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Material</span>
                <input className={styles.input} placeholder="Enter Input" value={addDraft.material}
                  onChange={(e) => setAddDraft({ ...addDraft, material: e.target.value })} />
              </label>
              <label className={styles.addModalField}>
                <span>Time</span>
                <input className={styles.input} placeholder="HH:MM AM/PM" value={addDraft.time}
                  onChange={(e) => setAddDraft({ ...addDraft, time: e.target.value })} />
              </label>
            </>
          )}
          {addDraft.kind === 'observation' && (
            <div className={styles.observationAddWrap}>
              <label className={styles.addModalField}>
                <span>Received</span>
                <textarea
                  className={`${styles.textarea} ${styles.observationAddTextarea}`}
                  placeholder="Enter your comments here."
                  maxLength={1000}
                  value={addDraft.details}
                  onChange={(e) => setAddDraft({ ...addDraft, details: e.target.value })}
                />
                <div className={styles.observationAddCounter}>{addDraft.details.length}/1000</div>
              </label>

              <div className={styles.addModalField}>
                <span>Received</span>
                <div className={styles.observationUploadRow}>
                  {observationPreviews.map((file) => (
                    <div key={file.name + file.url} className={styles.observationPreviewTile}>
                      <img src={file.url} alt={file.name} />
                    </div>
                  ))}

                  <button
                    type="button"
                    className={styles.observationUploadBtn}
                    title="Upload image"
                    aria-label="Upload image"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zm1.5-.5a.5.5 0 0 0-.5.5v6.6l2.1-2.1a1 1 0 0 1 1.4 0l1.3 1.3 2.3-2.3a1 1 0 0 1 1.4 0L13 8.5v-5a.5.5 0 0 0-.5-.5h-9zm9.5 10v-3.1l-2.3-2.3-2.3 2.3-1.3-1.3-3.1 3.1v.3c0 .3.2.5.5.5h9a.5.5 0 0 0 .5-.5z" />
                      <circle cx="11" cy="5" r="1" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className={`${styles.observationUploadBtn} ${styles.observationUploadBtnCamera}`}
                    title="Take photo"
                    aria-label="Take photo"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M4 5a2 2 0 0 1 2-2h.9l.5-.8A1 1 0 0 1 8.2 2h1.6a1 1 0 0 1 .8.4l.5.8H12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm4 2.2A2.8 2.8 0 1 0 8 12.8 2.8 2.8 0 0 0 8 7.2z" />
                    </svg>
                  </button>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.observationFileInput}
                  onChange={(e) => appendObservationFiles(e.target.files)}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className={styles.observationFileInput}
                  onChange={(e) => appendObservationFiles(e.target.files)}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    )
  }

  const saveEditFromModal = async () => {
    if (!editDraft) return

    if (editDraft.kind === 'subcontractor') {
      await subcontractorStore.update(editDraft.id, { company: editDraft.company, projectName: editDraft.projectName, workers: editDraft.workers })
      setSubcontractors((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, company: editDraft.company, projectName: editDraft.projectName, workers: editDraft.workers } : x)))
    } else if (editDraft.kind === 'task') {
      await reportTaskStore.update(editDraft.id, { company: editDraft.company, workersOnSite: editDraft.workersOnSite, task: editDraft.task, status: editDraft.status, comments: editDraft.comments })
      setTasks((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, company: editDraft.company, workersOnSite: editDraft.workersOnSite, task: editDraft.task, status: editDraft.status as TaskItem['status'], comments: editDraft.comments } : x)))
    } else if (editDraft.kind === 'incident') {
      await reportIncidentStore.update(editDraft.id, { level: editDraft.level, title: editDraft.title, time: editDraft.time, details: editDraft.details })
      setIncidents((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, level: editDraft.level as IncidentItem['level'], title: editDraft.title, time: editDraft.time, details: editDraft.details } : x)))
    } else if (editDraft.kind === 'equipment') {
      await reportEquipmentStore.update(editDraft.id, { name: editDraft.name })
      setEquipment((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, name: editDraft.name } : x)))
    } else if (editDraft.kind === 'schedule') {
      await reportScheduleStore.update(editDraft.id, { level: editDraft.level, description: editDraft.description, impact: editDraft.description, impactDays: editDraft.impactDays })
      setSchedule((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, level: editDraft.level as ScheduleItem['level'], description: editDraft.description, impact: editDraft.description, impactDays: editDraft.impactDays } : x)))
    } else if (editDraft.kind === 'delivery') {
      await reportDeliveryStore.update(editDraft.id, { supplier: editDraft.supplier, material: editDraft.material, time: editDraft.time, received: editDraft.received })
      setDeliveries((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, supplier: editDraft.supplier, material: editDraft.material, time: editDraft.time, received: editDraft.received } : x)))
    } else if (editDraft.kind === 'observation') {
      const existingObservation = observations.find((x) => x.id === editDraft.id)
      await reportObservationStore.update(editDraft.id, {
        category: editDraft.category,
        author: editDraft.author,
        details: editDraft.details,
        attachmentKeys: existingObservation?.attachmentKeys ?? [],
      })
      setObservations((prev) => prev.map((x) => (x.id === editDraft.id ? { ...x, category: editDraft.category, author: editDraft.author, details: editDraft.details } : x)))
    }

    setEditDraft(null)
  }

  const renderEditModal = () => {
    if (!editDraft) return null
    const titleMap: Record<string, string> = {
      subcontractor: 'Edit Subcontractor',
      task: 'Edit Task',
      incident: 'Edit Incident',
      equipment: 'Edit Equipment',
      schedule: 'Edit Schedule Impact',
      delivery: 'Edit Delivery',
      observation: 'Edit Observation',
    }

    return (
      <Modal
        isOpen
        title={titleMap[editDraft.kind] ?? 'Edit Item'}
        onClose={() => setEditDraft(null)}
        onSubmit={() => void saveEditFromModal()}
        submitText="Save"
        showCancel={false}
        width="sm"
      >
        <div className={styles.addModalForm}>
          {editDraft.kind === 'subcontractor' && (
            <>
              <label className={styles.addModalField}><span>Company</span><input className={styles.input} value={editDraft.company} onChange={(e) => setEditDraft({ ...editDraft, company: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Project Name</span><input className={styles.input} value={editDraft.projectName} onChange={(e) => setEditDraft({ ...editDraft, projectName: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Workers</span><input className={styles.input} type="number" value={editDraft.workers || ''} onChange={(e) => setEditDraft({ ...editDraft, workers: Number(e.target.value) || 0 })} /></label>
            </>
          )}
          {editDraft.kind === 'task' && (
            <>
              <label className={styles.addModalField}><span>Company</span><input className={styles.input} value={editDraft.company} onChange={(e) => setEditDraft({ ...editDraft, company: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Workers On Site</span><input className={styles.input} type="number" value={editDraft.workersOnSite || ''} onChange={(e) => setEditDraft({ ...editDraft, workersOnSite: Number(e.target.value) || 0 })} /></label>
              <label className={styles.addModalField}><span>Task</span><input className={styles.input} value={editDraft.task} onChange={(e) => setEditDraft({ ...editDraft, task: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Status</span><select className={styles.select} value={editDraft.status} onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}><option>Not Started</option><option>In Progress</option><option>Completed</option></select></label>
              <label className={styles.addModalField}><span>Comments</span><textarea className={styles.textarea} value={editDraft.comments} onChange={(e) => setEditDraft({ ...editDraft, comments: e.target.value })} /></label>
            </>
          )}
          {editDraft.kind === 'incident' && (
            <>
              <label className={styles.addModalField}><span>Level</span><select className={styles.select} value={editDraft.level} onChange={(e) => setEditDraft({ ...editDraft, level: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
              <label className={styles.addModalField}><span>Title</span><input className={styles.input} value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Time</span><input className={styles.input} value={editDraft.time} readOnly /></label>
              <label className={styles.addModalField}><span>Details</span><textarea className={styles.textarea} value={editDraft.details} onChange={(e) => setEditDraft({ ...editDraft, details: e.target.value })} /></label>
            </>
          )}
          {editDraft.kind === 'equipment' && (
            <label className={styles.addModalField}><span>Equipment Name</span><input className={styles.input} value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} /></label>
          )}
          {editDraft.kind === 'schedule' && (
            <>
              <label className={styles.addModalField}><span>Level</span><select className={styles.select} value={editDraft.level} onChange={(e) => setEditDraft({ ...editDraft, level: e.target.value })}><option>Medium</option><option>Positive</option></select></label>
              <label className={styles.addModalField}><span>Description</span><input className={styles.input} value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Impact Days</span><input className={styles.input} value={editDraft.impactDays} onChange={(e) => setEditDraft({ ...editDraft, impactDays: e.target.value })} /></label>
            </>
          )}
          {editDraft.kind === 'delivery' && (
            <>
              <label className={styles.addModalField}><span>Supplier</span><input className={styles.input} value={editDraft.supplier} onChange={(e) => setEditDraft({ ...editDraft, supplier: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Material</span><input className={styles.input} value={editDraft.material} onChange={(e) => setEditDraft({ ...editDraft, material: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Time</span><input className={styles.input} value={editDraft.time} onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Received</span><select className={styles.select} value={editDraft.received ? 'Yes' : 'No'} onChange={(e) => setEditDraft({ ...editDraft, received: e.target.value === 'Yes' })}><option value="No">No</option><option value="Yes">Yes</option></select></label>
            </>
          )}
          {editDraft.kind === 'observation' && (
            <>
              <label className={styles.addModalField}><span>Category</span><select className={styles.select} value={editDraft.category} onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}><option value="Safety">Safety</option><option value="Quality">Quality</option></select></label>
              <label className={styles.addModalField}><span>Author</span><input className={styles.input} value={editDraft.author} onChange={(e) => setEditDraft({ ...editDraft, author: e.target.value })} /></label>
              <label className={styles.addModalField}><span>Details</span><textarea className={styles.textarea} value={editDraft.details} onChange={(e) => setEditDraft({ ...editDraft, details: e.target.value })} /></label>
            </>
          )}
        </div>
      </Modal>
    )
  }

  const summaryCards: SummaryCardData[] = [
    { label: 'TOTAL WORKERS', value: workersTotal, icon: '👥' },
    { label: 'TOTAL HOURS', value: hoursWorked || 0, icon: '⏱️', unit: 'hrs' },
    { label: 'WEATHER', value: 54, icon: '☁️', unit: '°F' },
    { label: 'INCIDENTS', value: incidents.length, icon: '⚠️' },
  ]

  useEffect(() => {
    onSummaryChange?.(summaryCards)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workersTotal, hoursWorked, incidents.length])

  const handleGenerateReportPreview = async () => {
    const resolvedReportId = await saveReportHeader()
    onGeneratePreview?.(resolvedReportId)
  }

  const handleFinalizeReport = async () => {
    setStatus('Finalized')
    await saveReportHeader()
    onFinalizeReport?.()
  }

  const PreviewSection = ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => {
    return (
      <div className={styles.previewSection}>
        <div className={styles.previewSectionHeader}>
          <span className={styles.previewSectionTitle}>{title}</span>
        </div>
        <div className={styles.previewSectionContent}>{children}</div>
      </div>
    )
  }

  const renderReportPreview = () => (
    <div className={styles.previewReportArea}>
      <div className={styles.previewHeaderRow}>
        <h2 className={styles.previewPageTitle}>Preview Report</h2>
        <button
          type="button"
          className={styles.previewCloseBtn}
          aria-label="Close preview"
          onClick={onBackFromPreview}
        >
          ×
        </button>
      </div>

      <div className={styles.previewReportCard}>
        <PreviewSection title="Subcontractors">
          <div className={styles.previewItemList}>
            {subcontractors.map((s) => (
              <div key={s.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Company</div>
                <div className={styles.previewItemValue}>{s.company}</div>
                <div className={styles.previewItemLabel}>Project</div>
                <div className={styles.previewItemValue}>{s.projectName || '—'}</div>
                <div className={styles.previewItemLabel}>Workers</div>
                <div className={styles.previewItemValue}>{s.workers}</div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection title="Task">
          <div className={styles.previewItemList}>
            {tasks.map((t) => (
              <div key={t.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Company</div>
                <div className={styles.previewItemValue}>{t.company}</div>
                <div className={styles.previewItemLabel}>Task</div>
                <div className={styles.previewItemValue}>{t.task || '—'}</div>
                <div className={styles.previewItemLabel}>Status</div>
                <div className={styles.previewItemValue}>{t.status}</div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection title="Incidents">
          <div className={styles.previewItemList}>
            {incidents.map((i) => (
              <div key={i.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Title</div>
                <div className={styles.previewItemValue}>{i.title}</div>
                <div className={styles.previewItemLabel}>Level</div>
                <div className={styles.previewItemValue}>{i.level}</div>
                <div className={styles.previewItemLabel}>Time</div>
                <div className={styles.previewItemValue}>{i.time || '—'}</div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection title="Equipment">
          <div className={styles.previewItemList}>
            {equipment.map((e) => (
              <div key={e.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Equipment</div>
                <div className={styles.previewItemValue}>{e.name}</div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection title="Schedule">
          <div className={styles.previewItemList}>
            {schedule.map((s) => (
              <div key={s.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Impact</div>
                <div className={styles.previewItemValue}>{s.description || s.impact}</div>
                <div className={styles.previewItemLabel}>Level</div>
                <div className={styles.previewItemValue}>{s.level}</div>
                <div className={styles.previewItemLabel}>Days</div>
                <div className={styles.previewItemValue}>{s.impactDays || '—'}</div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection title="Delivers">
          <div className={styles.previewItemList}>
            {deliveries.map((d) => (
              <div key={d.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Supplier</div>
                <div className={styles.previewItemValue}>{d.supplier}</div>
                <div className={styles.previewItemLabel}>Material</div>
                <div className={styles.previewItemValue}>{d.material}</div>
                <div className={styles.previewItemLabel}>Received</div>
                <div className={styles.previewItemValue}>{d.received ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection title="Observations">
          <div className={styles.previewItemList}>
            {observations.map((o) => (
              <div key={o.id} className={styles.previewItem}>
                <div className={styles.previewItemLabel}>Author</div>
                <div className={styles.previewItemValue}>{o.author}</div>
                <div className={styles.previewItemLabel}>Category</div>
                <div className={styles.previewItemValue}>{o.category}</div>
                <div className={styles.previewItemLabel}>Notes</div>
                <div className={styles.previewItemValue}>{o.details || '—'}</div>
                <div className={styles.previewItemLabel}>Attachments</div>
                <div className={styles.previewItemValue}>
                  {o.attachments && o.attachments.length > 0 ? (
                    <div className={styles.previewObservationImages}>
                      {o.attachments.map((img, idx) => (
                        <img key={`${o.id}-preview-attachment-${idx}`} src={img} alt={`Observation attachment ${idx + 1}`} className={styles.previewObservationImage} />
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            ))}
          </div>
        </PreviewSection>
      </div>

      <div className={styles.previewFooter}>
        <button
          type="button"
          className={styles.btnPreview}
          onClick={onBackFromPreview}
        >
          ← Prev
        </button>
        <button
          type="button"
          className={styles.btnFinalizeReport}
          onClick={() => void handleFinalizeReport()}
          disabled={isSaving}
        >
          {isSaving ? 'Finalizing...' : isEditMode ? 'Update Report +' : 'Finalize Report +'}
        </button>
      </div>

      {saveSuccess && (
        <p style={{ marginTop: 16, color: '#1f9a58', fontWeight: 600 }}>Report saved successfully!</p>
      )}
      {saveError && <p style={{ marginTop: 16, color: '#cf3d09', fontWeight: 600 }}>{saveError}</p>}
    </div>
  )

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#5a7c93' }}>
        Loading report data...
      </div>
    )
  }

  if (activeTab === 'preview') {
    return renderReportPreview()
  }

  // ─── Subcontractors tab ────────────────────────────────────────────────────
  if (activeTab === 'subcontractors') {
    return (
      <>
        <div className={styles.subcontractorHeader}>
          <h2 className={styles.sectionTitle}>Subcontractors</h2>
          <button
            type="button"
            className={styles.btnAddSubcontractor}
            onClick={() => openAddModal('subcontractor')}
          >
            + Add subcontractor
          </button>
        </div>
        <div className={styles.card}>
          <div className={styles.subcontractorGridHeader}>
            <div>Company</div>
            <div>Project Name</div>
            <div>Workers</div>
          </div>
          {subcontractors.map((item) => (
            <div key={item.id} className={styles.subcontractorRow}>
              <input
                id={`subcontractor-company-${item.id}`}
                className={`${styles.input} ${styles.subcontractorInput}`}
                value={item.company}
                readOnly
                onChange={(e) =>
                  setSubcontractors((p) =>
                    p.map((r) => (r.id === item.id ? { ...r, company: e.target.value } : r))
                  )
                }
                onBlur={async () => {
                  try {
                    await subcontractorStore.update(item.id, {
                      company: item.company,
                      projectName: item.projectName,
                      workers: item.workers,
                    })
                  } catch (err) {
                    console.error(err)
                  }
                }}
              />
              <input
                className={`${styles.input} ${styles.subcontractorInput}`}
                value={item.projectName || ''}
                placeholder="Project Name"
                readOnly
                onChange={(e) =>
                  setSubcontractors((p) =>
                    p.map((r) => (r.id === item.id ? { ...r, projectName: e.target.value } : r))
                  )
                }
                onBlur={async () => {
                  try {
                    await subcontractorStore.update(item.id, {
                      company: item.company,
                      projectName: item.projectName,
                      workers: item.workers,
                    })
                  } catch (err) {
                    console.error(err)
                  }
                }}
              />
              <div className={styles.subcontractorWorkersCell}>
                <input
                  className={`${styles.input} ${styles.subcontractorInput}`}
                  type="text"
                  value={String(item.workers)}
                  readOnly
                  onChange={() => undefined}
                />
                <div className={styles.subcontractorRowActions}>
                  <button
                    type="button"
                    className={styles.subcontractorIconBtn}
                    title="Edit"
                    aria-label="Edit subcontractor"
                    onClick={() => openEditModal({ kind: 'subcontractor', ...item })}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                      <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.subcontractorIconBtn} ${styles.subcontractorIconBtnDelete}`}
                    onClick={() => openDeleteModal('subcontractor', item.id, `Delete subcontractor "${item.company}"?`)}
                    title="Delete"
                    aria-label="Delete subcontractor"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <hr className={styles.subcontractorDivider} />
          <div className={styles.subcontractorTotalRow}>
            <span>Subcontractors</span>
            <span>{workersTotal}</span>
          </div>
        </div>
        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'subcontractor'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  // ─── Tasks tab ─────────────────────────────────────────────────────────────
  if (activeTab === 'tasks') {
    // Group tasks by subcontractor company; orphan tasks (company not in subs) go at end
    const knownCompanies = new Set(subcontractors.map((s) => s.company))
    const orphanTasks = tasks.filter((t) => !knownCompanies.has(t.company))

    const taskGroups = [
      ...subcontractors.map((sub) => ({
        key: sub.id,
        company: sub.company,
        workers: sub.workers,
        groupTasks: tasks.filter((t) => t.company === sub.company),
      })),
      ...(orphanTasks.length > 0
        ? [{ key: '__orphan__', company: 'Other', workers: 0, groupTasks: orphanTasks }]
        : []),
    ]

    return (
      <>
        {subcontractors.length === 0 && (
          <p className={styles.noDataText}>No subcontractors added yet. Add subcontractors first to assign tasks.</p>
        )}
        {taskGroups.map((group) => (
          <div key={group.key} className={styles.taskGroup}>
            {/* Company header */}
            <div className={styles.taskGroupHeader}>
              <div className={styles.taskGroupTitle}>
                <span className={styles.taskGroupCompany}>{group.company}</span>
                {group.workers > 0 && (
                  <span className={styles.taskGroupWorkers}>{group.workers} Workers On Site</span>
                )}
              </div>
              <button
                type="button"
                className={styles.btnAddTask}
                onClick={() => openAddModal('task', { company: group.company })}
              >
                + Add Task
              </button>
            </div>

            {/* Task cards */}
            <div className={styles.taskGroupBody}>
              {group.groupTasks.map((task, idx) => {
                const statusClass =
                  task.status === 'In Progress'
                    ? styles.taskStatusInProgress
                    : task.status === 'Completed'
                      ? styles.taskStatusCompleted
                      : styles.taskStatusNotStarted

                return (
                  <div key={task.id} className={styles.taskCard}>
                    <div className={styles.taskCardHeader}>
                      <div className={styles.taskCardMeta}>
                        <span className={styles.taskLabel}>Task {idx + 1}</span>
                        <span className={`${styles.taskStatusBadge} ${statusClass}`}>
                          {task.status.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.taskCardActions}>
                        <button
                          type="button"
                          className={styles.taskIconBtn}
                          title="Edit"
                          aria-label="Edit task"
                          onClick={() => openEditModal({ kind: 'task', ...task })}
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                            <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={`${styles.taskIconBtn} ${styles.taskIconBtnDelete}`}
                          title="Delete"
                          aria-label="Delete task"
                          onClick={() =>
                            openDeleteModal('task', task.id, `Delete Task ${idx + 1} for "${task.company}"?`)
                          }
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Task description */}
                    <textarea
                      id={`task-text-${task.id}`}
                      className={styles.taskText}
                      value={task.task}
                      placeholder="Enter task description..."
                      rows={2}
                      readOnly
                      onChange={(e) =>
                        setTasks((p) =>
                          p.map((r) => (r.id === task.id ? { ...r, task: e.target.value } : r))
                        )
                      }
                      onBlur={async () => {
                        try { await reportTaskStore.update(task.id, { task: task.task }) }
                        catch (err) { console.error(err) }
                      }}
                    />

                    {/* Superintendent comments */}
                    <div className={styles.taskCommentsBlock}>
                      <p className={styles.taskCommentsLabel}>Superintendent Comments</p>
                      <textarea
                        className={styles.taskText}
                        value={task.comments}
                        placeholder="Add comments..."
                        rows={2}
                        readOnly
                        onChange={(e) =>
                          setTasks((p) =>
                            p.map((r) => (r.id === task.id ? { ...r, comments: e.target.value } : r))
                          )
                        }
                        onBlur={async () => {
                          try { await reportTaskStore.update(task.id, { comments: task.comments }) }
                          catch (err) { console.error(err) }
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'task'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  // ─── Incidents tab ─────────────────────────────────────────────────────────
  if (activeTab === 'incidents') {
    return (
      <>
        <div className={styles.incidentsPanel}>
          <div className={styles.incidentsHeader}>
            <div />
            <button type="button" className={styles.btnLogIncident} onClick={() => openAddModal('incident')}>
              + Add Log incident
            </button>
          </div>

          {incidents.length === 0 && (
            <p className={styles.noDataText}>No incidents logged.</p>
          )}

          {incidents.map((incident, index) => {
            const levelClass =
              incident.level === 'High'
                ? styles.incidentLevelHigh
                : incident.level === 'Medium'
                  ? styles.incidentLevelMedium
                  : styles.incidentLevelLow

            return (
              <div key={incident.id} className={`${styles.incidentCardCompact} ${levelClass}`}>
                <div className={styles.incidentCardCompactTop}>
                  <div className={styles.incidentHeadline}>
                    <span className={styles.incidentTitleCompact}>
                      {incident.title || `Incident ${incidents.length - index}`}
                    </span>
                    <select
                      className={`${styles.incidentLevelSelect} ${levelClass}`}
                      value={incident.level}
                      aria-label="Incident criticality"
                      disabled
                      onChange={async (e) => {
                        const v = e.target.value as IncidentItem['level']
                        setIncidents((p) => p.map((r) => (r.id === incident.id ? { ...r, level: v } : r)))
                        try { await reportIncidentStore.update(incident.id, { level: v }) }
                        catch (err) { console.error(err) }
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <span className={styles.incidentTime}>- {incident.time || getCurrentTimeLabel()}</span>
                  </div>

                  <div className={styles.incidentActionsCompact}>
                    <button
                      type="button"
                      className={styles.taskIconBtn}
                      title="Edit"
                      aria-label="Edit incident"
                      onClick={() => openEditModal({ kind: 'incident', ...incident })}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                        <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`${styles.taskIconBtn} ${styles.taskIconBtnDelete}`}
                      title="Delete"
                      aria-label="Delete incident"
                      onClick={() =>
                        openDeleteModal('incident', incident.id, `Delete incident "${incident.title}"?`)
                      }
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.incidentEditGrid}>
                  <input
                    className={styles.input}
                    value={incident.title}
                    placeholder="Title"
                    readOnly
                    onChange={(e) =>
                      setIncidents((p) =>
                        p.map((r) => (r.id === incident.id ? { ...r, title: e.target.value } : r))
                      )
                    }
                  />
                  <textarea
                    className={styles.textarea}
                    value={incident.details}
                    placeholder="Comments"
                    rows={2}
                    readOnly
                    onChange={(e) =>
                      setIncidents((p) =>
                        p.map((r) => (r.id === incident.id ? { ...r, details: e.target.value } : r))
                      )
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>

        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'incident'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  // ─── Equipment tab ─────────────────────────────────────────────────────────
  if (activeTab === 'equipment') {
    return (
      <>
        <div className={styles.equipmentPanel}>
          <div className={styles.equipmentHeader}>
            <h2 className={styles.sectionTitle}>Equipment On Site</h2>
            <button
              type="button"
              className={styles.btnAddEquipment}
              onClick={() => openAddModal('equipment')}
            >
              + Add Equipment
            </button>
          </div>

          <div className={styles.equipmentListCard}>
            {equipment.length === 0 && (
              <p className={styles.noDataText}>No equipment added.</p>
            )}
            {equipment.map((item) => (
              <div key={item.id} className={styles.equipmentRow}>
                <input
                  id={`equipment-name-${item.id}`}
                  className={`${styles.input} ${styles.equipmentInput}`}
                  value={item.name}
                  placeholder="Equipment name"
                  readOnly
                  onChange={(e) =>
                    setEquipment((p) =>
                      p.map((r) => (r.id === item.id ? { ...r, name: e.target.value } : r))
                    )
                  }
                  onBlur={async () => {
                    try {
                      await reportEquipmentStore.update(item.id, { name: item.name })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />

                <div className={styles.equipmentRowActions}>
                  <button
                    type="button"
                    className={styles.equipmentIconBtn}
                    title="Edit"
                    aria-label="Edit equipment"
                    onClick={() => openEditModal({ kind: 'equipment', ...item })}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                      <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.equipmentIconBtn} ${styles.equipmentIconBtnDelete}`}
                    title="Delete"
                    aria-label="Delete equipment"
                    onClick={() => openDeleteModal('equipment', item.id, `Delete "${item.name}"?`)}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'equipment'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  // ─── Schedule tab ──────────────────────────────────────────────────────────
  if (activeTab === 'schedule') {
    return (
      <>
        <div className={styles.schedulePanel}>
          <div className={styles.scheduleHeader}>
            <div />
            <button
              type="button"
              className={styles.btnAddSchedule}
              onClick={() => openAddModal('schedule')}
            >
              + Add Schedule Impact
            </button>
          </div>

          <div className={styles.scheduleListCard}>
            {schedule.length === 0 && (
              <p className={styles.noDataText}>No schedule impacts added.</p>
            )}
            {schedule.map((item) => (
              <div key={item.id} className={styles.scheduleRow}>
                <input
                  id={`schedule-desc-${item.id}`}
                  className={`${styles.input} ${styles.scheduleInput}`}
                  value={item.description || item.impact}
                  placeholder="Schedule impact description"
                  readOnly
                  onChange={(e) =>
                    setSchedule((p) =>
                      p.map((r) =>
                        r.id === item.id
                          ? { ...r, description: e.target.value, impact: e.target.value }
                          : r
                      )
                    )
                  }
                  onBlur={async () => {
                    try {
                      await reportScheduleStore.update(item.id, {
                        description: item.description,
                        impact: item.description || item.impact,
                      })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />

                <input
                  className={`${styles.input} ${styles.scheduleDaysInput}`}
                  value={item.impactDays}
                  placeholder="Impact Days"
                  readOnly
                  onChange={(e) =>
                    setSchedule((p) =>
                      p.map((r) =>
                        r.id === item.id ? { ...r, impactDays: e.target.value } : r
                      )
                    )
                  }
                  onBlur={async () => {
                    try {
                      await reportScheduleStore.update(item.id, { impactDays: item.impactDays })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />

                <select
                  className={`${styles.select} ${styles.scheduleLevelSelect}`}
                  value={item.level}
                  disabled
                  onChange={async (e) => {
                    const v = e.target.value as ScheduleItem['level']
                    setSchedule((p) => p.map((r) => (r.id === item.id ? { ...r, level: v } : r)))
                    try {
                      await reportScheduleStore.update(item.id, { level: v })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                >
                  <option value="Positive">Positive</option>
                  <option value="Medium">Medium</option>
                </select>

                <div className={styles.scheduleRowActions}>
                  <button
                    type="button"
                    className={styles.scheduleIconBtn}
                    title="Edit"
                    aria-label="Edit schedule impact"
                    onClick={() => openEditModal({ kind: 'schedule', ...item })}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                      <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.scheduleIconBtn} ${styles.scheduleIconBtnDelete}`}
                    title="Delete"
                    aria-label="Delete schedule impact"
                    onClick={() => openDeleteModal('schedule', item.id, 'Delete schedule impact?')}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'schedule'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  // ─── Deliveries tab ────────────────────────────────────────────────────────
  if (activeTab === 'delivers') {
    return (
      <>
        <div className={styles.deliveryPanel}>
          <div className={styles.deliveryHeader}>
            <h2 className={styles.sectionTitle}>Deliveries</h2>
            <button
              type="button"
              className={styles.btnAddDelivery}
              onClick={() => openAddModal('delivery')}
            >
              + Add Delivery
            </button>
          </div>

          <div className={styles.deliveryTableCard}>
            {deliveries.length === 0 && (
              <p className={styles.noDataText}>No deliveries recorded.</p>
            )}

            {deliveries.length > 0 && (
              <div className={styles.deliveryHeadRow}>
                <div>Supplier</div>
                <div>Material</div>
                <div>Time</div>
                <div>Received</div>
                <div />
              </div>
            )}

            {deliveries.map((item) => (
              <div key={item.id} className={styles.deliveryDataRow}>
                <input
                  id={`delivery-supplier-${item.id}`}
                  className={`${styles.input} ${styles.deliveryInput}`}
                  value={item.supplier}
                  readOnly
                  onChange={(e) =>
                    setDeliveries((p) =>
                      p.map((r) => (r.id === item.id ? { ...r, supplier: e.target.value } : r))
                    )
                  }
                  onBlur={async () => {
                    try {
                      await reportDeliveryStore.update(item.id, { supplier: item.supplier })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />
                <input
                  className={`${styles.input} ${styles.deliveryInput}`}
                  value={item.material}
                  readOnly
                  onChange={(e) =>
                    setDeliveries((p) =>
                      p.map((r) => (r.id === item.id ? { ...r, material: e.target.value } : r))
                    )
                  }
                  onBlur={async () => {
                    try {
                      await reportDeliveryStore.update(item.id, { material: item.material })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />
                <input
                  className={`${styles.input} ${styles.deliveryInput}`}
                  value={item.time}
                  readOnly
                  onChange={(e) =>
                    setDeliveries((p) =>
                      p.map((r) => (r.id === item.id ? { ...r, time: e.target.value } : r))
                    )
                  }
                  onBlur={async () => {
                    try {
                      await reportDeliveryStore.update(item.id, { time: item.time })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                />

                <button
                  type="button"
                  className={styles.deliveryReceivedBtn}
                  aria-label={item.received ? 'Mark as not received' : 'Mark as received'}
                  title={item.received ? 'Received' : 'Not received'}
                  disabled
                  onClick={async () => {
                    const v = !item.received
                    setDeliveries((p) => p.map((r) => (r.id === item.id ? { ...r, received: v } : r)))
                    try {
                      await reportDeliveryStore.update(item.id, { received: v })
                    } catch (err) {
                      console.error(err)
                    }
                  }}
                >
                  {item.received ? (
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="10" cy="10" r="8" fill="#1f9a58" />
                      <path d="M6.2 10.2 8.8 12.8 13.8 7.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <circle cx="10" cy="10" r="8" stroke="#7d8389" strokeWidth="1.2" fill="#fff" />
                      <circle cx="7.8" cy="8.2" r="0.9" fill="#7d8389" />
                      <circle cx="12.2" cy="8.2" r="0.9" fill="#7d8389" />
                      <path d="M7.2 12.1h5.6" stroke="#7d8389" strokeWidth="1.1" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                <div className={styles.deliveryRowActions}>
                  <button
                    type="button"
                    className={styles.deliveryIconBtn}
                    title="Edit"
                    aria-label="Edit delivery"
                    onClick={() => openEditModal({ kind: 'delivery', ...item })}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                      <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.deliveryIconBtn} ${styles.deliveryIconBtnDelete}`}
                    title="Delete"
                    aria-label="Delete delivery"
                    onClick={() =>
                      openDeleteModal(
                        'delivery',
                        item.id,
                        `Delete delivery from "${item.supplier}"?`
                      )
                    }
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'delivery'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  // ─── Observations tab ──────────────────────────────────────────────────────
  if (activeTab === 'observations') {
    return (
      <>
        <div className={styles.observationPanel}>
          <div className={styles.observationHeader}>
            <div />
            <button
              type="button"
              className={styles.btnAddObservation}
              onClick={() => openAddModal('observation')}
            >
              + Add Observation
            </button>
          </div>

          <div className={styles.observationListArea}>
            {observations.length === 0 && (
              <p className={styles.noDataText}>No observations recorded.</p>
            )}
            {observations.map((item) => (
              <div key={item.id} className={styles.observationCard}>
                {/* Header with author, category, and actions */}
                <div className={styles.observationCardHeader}>
                  <div className={styles.observationCardMeta}>
                    <input
                      id={`obs-author-${item.id}`}
                      className={styles.observationAuthorInput}
                      value={item.author}
                      placeholder="Author"
                      readOnly
                      onChange={(e) =>
                        setObservations((p) =>
                          p.map((r) => (r.id === item.id ? { ...r, author: e.target.value } : r))
                        )
                      }
                      onBlur={async () => {
                        try {
                          await reportObservationStore.update(item.id, { author: item.author })
                        } catch (err) {
                          console.error(err)
                        }
                      }}
                    />
                    <select
                      className={`${styles.select} ${styles.observationCategorySelect}`}
                      value={item.category}
                      disabled
                      onChange={async (e) => {
                        const v = e.target.value
                        setObservations((p) =>
                          p.map((r) => (r.id === item.id ? { ...r, category: v } : r))
                        )
                        try {
                          await reportObservationStore.update(item.id, { category: v })
                        } catch (err) {
                          console.error(err)
                        }
                      }}
                    >
                      <option value="Safety">Safety</option>
                      <option value="Quality">Quality</option>
                    </select>
                  </div>

                  <div className={styles.observationCardActions}>
                    <button
                      type="button"
                      className={styles.observationIconBtn}
                      title="Edit"
                      aria-label="Edit observation"
                      onClick={() => openEditModal({ kind: 'observation', ...item })}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1a.5.5 0 0 1-.707 0L12.354 2.2l1-1a.5.5 0 0 1 .707 0l1.44 1.44z" />
                        <path d="M11.854 2.7 2.5 12.05V14h1.95l9.354-9.354-1.95-1.95z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`${styles.observationIconBtn} ${styles.observationIconBtnDelete}`}
                      title="Delete"
                      aria-label="Delete observation"
                      onClick={() =>
                        openDeleteModal(
                          'observation',
                          item.id,
                          `Delete observation by "${item.author}"?`
                        )
                      }
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Notes section */}
                <div className={styles.observationSection}>
                  <div className={styles.observationSectionTitle}>Notes</div>
                  <textarea
                    className={`${styles.textarea} ${styles.observationDetailsArea}`}
                    value={item.details}
                    readOnly
                    onChange={(e) =>
                      setObservations((p) =>
                        p.map((r) => (r.id === item.id ? { ...r, details: e.target.value } : r))
                      )
                    }
                    onBlur={async () => {
                      try {
                        await reportObservationStore.update(item.id, { details: item.details })
                      } catch (err) {
                        console.error(err)
                      }
                    }}
                  />
                </div>

                {/* Attachments section */}
                <div className={styles.observationSection}>
                  <div className={styles.observationSectionTitle}>Attachments</div>
                  <div className={styles.observationAttachments}>
                    {item.attachments && item.attachments.length > 0 ? (
                      item.attachments.map((img, idx) => (
                        <div key={`${item.id}-attachment-${idx}`} className={styles.observationAttachmentTile}>
                          <img src={img} alt={`Attachment ${idx + 1}`} />
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#adb5bd', fontSize: '13px' }}>No attachments added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.observationsFooter}>
          <button
            type="button"
            className={styles.btnNav}
            onClick={onPrev}
            disabled={!onPrev}
          >
            ← Prev
          </button>
          <button
            type="button"
            className={styles.btnNav}
            onClick={() => void handleGenerateReportPreview()}
            disabled={isSaving}
          >
            {isSaving ? 'Generating...' : 'Generate Report →'}
          </button>
        </div>

        {saveError && <p style={{ marginTop: 8, color: '#cf3d09', fontWeight: 600 }}>{saveError}</p>}
        <DeleteConfirmModal
          isOpen={itemDeleteState.open && itemDeleteState.kind === 'observation'}
          message={itemDeleteState.message}
          onClose={() => setItemDeleteState((p) => ({ ...p, open: false }))}
          onConfirm={confirmDelete}
          isSubmitting={false}
          errorMessage={null}
        />
        {renderAddModal()}
        {renderEditModal()}
      </>
    )
  }

  return null
}

export default DailyReportWorkspace
