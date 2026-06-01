import { useCallback, useState } from 'react'
import {
  DailyReportInput,
  DailyReportRecord,
} from '@/services/graphql/dailyReportsApi'
import {
  dailyReportStore,
  DailyReportStoreInput,
  subcontractorStore,
  reportTaskStore,
  reportIncidentStore,
  reportEquipmentStore,
  reportScheduleStore,
  reportDeliveryStore,
  reportObservationStore,
} from '@/services/datastore'

interface UseDailyReportsResult {
  reports: DailyReportRecord[]
  loading: boolean
  error: string | null
  success: string | null
  loadReports: () => Promise<void>
  saveReport: (input: DailyReportInput & { reportId?: string }) => Promise<DailyReportRecord>
  deleteReport: (reportId: string) => Promise<void>
  getReport: (reportId: string) => Promise<DailyReportRecord | null>
  clearStatus: () => void
}

const toIsoDate = (value: string): string => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().split('T')[0]
}

export const useDailyReports = (): UseDailyReportsResult => {
  const [reports, setReports] = useState<DailyReportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const mapModelToRecord = useCallback((item: {
    reportId: string
    userId: string
    reportDate: string
    employeeName?: string | null
    trade?: string | null
    taskDetails?: string | null
    hoursWorked?: number | null
    status?: string | null
    remarks?: string | null
    createdAt?: string | null
    updatedAt?: string | null
  }): DailyReportRecord => ({
    reportId: item.reportId,
    userId: item.userId,
    reportDate: item.reportDate,
    employeeName: item.employeeName ?? null,
    trade: item.trade ?? null,
    taskDetails: item.taskDetails ?? null,
    hoursWorked: item.hoursWorked ?? null,
    status: item.status ?? null,
    remarks: item.remarks ?? null,
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
  }), [])

  const clearStatus = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await dailyReportStore.listAll()
      const mapped = list.map(mapModelToRecord)
      mapped.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
      setReports(mapped)
      setSuccess(`Loaded ${mapped.length} reports.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [mapModelToRecord])

  const saveReport = useCallback(async (input: DailyReportInput & { reportId?: string }) => {
    setLoading(true)
    setError(null)

    try {
      const resolvedReportId = input.reportId ?? `dr-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const normalizedInput: DailyReportStoreInput = {
        reportId: resolvedReportId,
        userId: input.userId,
        reportDate: toIsoDate(input.reportDate),
        employeeName: input.employeeName,
        trade: input.trade,
        taskDetails: input.taskDetails,
        hoursWorked: input.hoursWorked,
        status: input.status,
        remarks: input.remarks,
      }

      const saved = await dailyReportStore.upsert(normalizedInput)
      const mappedSaved = mapModelToRecord(saved)

      setReports((prev) => {
        const existingIndex = prev.findIndex((item) => item.reportId === mappedSaved.reportId)
        if (existingIndex === -1) return [mappedSaved, ...prev]

        const clone = [...prev]
        clone[existingIndex] = mappedSaved
        return clone
      })

      setSuccess(input.reportId ? 'Report updated successfully.' : 'Report created successfully.')
      return mappedSaved
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save report'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [mapModelToRecord])

  const deleteReport = useCallback(async (reportId: string) => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        subcontractorStore.deleteAllByReportId(reportId),
        reportTaskStore.deleteAllByReportId(reportId),
        reportIncidentStore.deleteAllByReportId(reportId),
        reportEquipmentStore.deleteAllByReportId(reportId),
        reportScheduleStore.deleteAllByReportId(reportId),
        reportDeliveryStore.deleteAllByReportId(reportId),
        reportObservationStore.deleteAllByReportId(reportId),
      ])
      await dailyReportStore.deleteByReportId(reportId)
      setReports((prev) => prev.filter((item) => item.reportId !== reportId))
      setSuccess('Report deleted successfully.')
      const refreshed = await dailyReportStore.listAll()
      setReports(refreshed.map(mapModelToRecord))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report')
      throw err
    } finally {
      setLoading(false)
    }
  }, [mapModelToRecord])

  const getReport = useCallback(async (reportId: string) => {
    setLoading(true)
    setError(null)

    try {
      const report = await dailyReportStore.get(reportId)
      const mapped = report ? mapModelToRecord(report) : null
      setSuccess(mapped ? 'Report loaded successfully.' : 'Report not found.')
      return mapped
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get report')
      throw err
    } finally {
      setLoading(false)
    }
  }, [mapModelToRecord])

  return {
    reports,
    loading,
    error,
    success,
    loadReports,
    saveReport,
    deleteReport,
    getReport,
    clearStatus,
  }
}
