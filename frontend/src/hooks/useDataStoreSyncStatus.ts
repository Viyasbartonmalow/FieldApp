import { useEffect, useMemo, useState } from 'react'
import { Hub } from 'aws-amplify/utils'

export type DataStoreSyncState = 'syncing' | 'outbox-empty' | 'error'

interface UseDataStoreSyncStatusResult {
  state: DataStoreSyncState
  label: string
  detail: string | null
}

const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return 'Unknown sync error'
  }
}

export const useDataStoreSyncStatus = (): UseDataStoreSyncStatusResult => {
  const [state, setState] = useState<DataStoreSyncState>('syncing')
  const [detail, setDetail] = useState<string | null>(null)
  const [outboxEmpty, setOutboxEmpty] = useState<boolean>(false)

  useEffect(() => {
    const unsubscribe = Hub.listen('datastore', ({ payload }) => {
      const event = payload?.event
      const data = payload?.data as Record<string, unknown> | undefined

      if (event === 'outboxStatus') {
        const isEmpty = Boolean(data?.isEmpty)
        setOutboxEmpty(isEmpty)
        if (isEmpty) {
          setState('outbox-empty')
          setDetail(null)
        } else {
          setState('syncing')
        }
        return
      }

      if (
        event === 'outboxMutationEnqueued' ||
        event === 'syncQueriesStarted' ||
        event === 'subscriptionsEstablished'
      ) {
        setState('syncing')
        return
      }

      if (event === 'ready' || event === 'syncQueriesReady') {
        if (outboxEmpty) {
          setState('outbox-empty')
          setDetail(null)
        } else {
          setState('syncing')
        }
        return
      }

      if (
        event === 'outboxMutationFailed' ||
        event === 'syncQueriesFailed' ||
        event === 'conditionalSaveFailed'
      ) {
        setState('error')
        setDetail(getErrorMessage(data?.error ?? data ?? payload))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [outboxEmpty])

  const label = useMemo(() => {
    if (state === 'outbox-empty') return 'Outbox empty'
    if (state === 'error') return 'Error'
    return 'Syncing'
  }, [state])

  return { state, label, detail }
}
