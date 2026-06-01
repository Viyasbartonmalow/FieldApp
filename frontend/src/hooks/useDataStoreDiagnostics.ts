import { useEffect, useState } from 'react'
import { DataStore } from 'aws-amplify/datastore'
import { Hub } from 'aws-amplify/utils'
import { PreTaskPlanControl, PreTaskPlanTaskDetail } from '@/models'
import { getDataStoreSyncPhase, isDataStoreReady } from '@/services/datastore-sync'

interface DataStoreCounts {
  controls: number
  taskDetails: number
}

export interface DataStoreDiagnostics {
  enabled: boolean
  isReady: boolean
  syncPhase: string
  eventCount: number
  lastEvent: string
  lastError: string
  lastUpdated: string
  counts: DataStoreCounts
}

const EMPTY_COUNTS: DataStoreCounts = {
  controls: 0,
  taskDetails: 0,
}

const EMPTY_DIAGNOSTICS: DataStoreDiagnostics = {
  enabled: false,
  isReady: false,
  syncPhase: 'idle',
  eventCount: 0,
  lastEvent: 'none',
  lastError: '',
  lastUpdated: '',
  counts: EMPTY_COUNTS,
}

const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return 'Unknown error'
  }
}

export const useDataStoreDiagnostics = (enabled: boolean): DataStoreDiagnostics => {
  const [state, setState] = useState<DataStoreDiagnostics>(() => ({
    ...EMPTY_DIAGNOSTICS,
    enabled,
    isReady: isDataStoreReady(),
    syncPhase: getDataStoreSyncPhase(),
  }))

  useEffect(() => {
    if (!enabled) {
      setState({
        ...EMPTY_DIAGNOSTICS,
        enabled: false,
        isReady: isDataStoreReady(),
        syncPhase: getDataStoreSyncPhase(),
      })
      return
    }

    const refreshCounts = async () => {
      try {
        const [controls, taskDetails] = await Promise.all([
          DataStore.query(PreTaskPlanControl as any),
          DataStore.query(PreTaskPlanTaskDetail as any),
        ])

        setState((prev) => ({
          ...prev,
          enabled: true,
          isReady: isDataStoreReady(),
          syncPhase: getDataStoreSyncPhase(),
          counts: {
            controls: (controls as any[]).length,
            taskDetails: (taskDetails as any[]).length,
          },
          lastUpdated: new Date().toISOString(),
        }))
      } catch (err) {
        const message = getErrorMessage(err)
        if (message.includes('DataStore') && message.includes('Clearing')) {
          setState((prev) => ({
            ...prev,
            enabled: true,
            isReady: isDataStoreReady(),
            syncPhase: getDataStoreSyncPhase(),
            lastUpdated: new Date().toISOString(),
          }))
          return
        }

        setState((prev) => ({
          ...prev,
          enabled: true,
          isReady: isDataStoreReady(),
          syncPhase: getDataStoreSyncPhase(),
          lastError: message,
          lastUpdated: new Date().toISOString(),
        }))
      }
    }

    setState((prev) => ({
      ...prev,
      enabled: true,
      isReady: isDataStoreReady(),
      syncPhase: getDataStoreSyncPhase(),
      lastError: '',
    }))

    void refreshCounts()

    const unsubscribe = Hub.listen('datastore', ({ payload }) => {
      const event = payload?.event ?? 'unknown'

      setState((prev) => ({
        ...prev,
        enabled: true,
        isReady: isDataStoreReady(),
        syncPhase: getDataStoreSyncPhase(),
        eventCount: prev.eventCount + 1,
        lastEvent: event,
        lastError: '',
        lastUpdated: new Date().toISOString(),
      }))

      if (
        event === 'ready' ||
        event === 'syncQueriesReady' ||
        event === 'modelSynced' ||
        event === 'syncQueriesStarted' ||
        event === 'networkStatus'
      ) {
        void refreshCounts()
      }
    })

    const intervalId = window.setInterval(() => {
      void refreshCounts()
    }, 10000)

    return () => {
      window.clearInterval(intervalId)
      unsubscribe()
    }
  }, [enabled])

  return state
}
