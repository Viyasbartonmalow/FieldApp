import { DataStore } from 'aws-amplify/datastore'
import { Hub } from 'aws-amplify/utils'
import { PreTaskPlanControl, Project } from '@/models'

const DATASTORE_READY_TIMEOUT_MS = 30000
let dataStoreReady = false
let syncPhase: 'idle' | 'stopping' | 'clearing' | 'starting' | 'waiting-ready' | 'ready' | 'error' = 'idle'
let websocketErrors = 0

Hub.listen('datastore', ({ payload }) => {
  const event = payload?.event
  if (event === 'ready' || event === 'syncQueriesReady' || event === 'modelSynced') {
    dataStoreReady = true
    syncPhase = 'ready'
    if (websocketErrors > 0) {
      console.log(`[DataStore] ✅ Ready (WebSocket had ${websocketErrors} errors, using HTTP polling)`)
    } else {
      console.log('[DataStore] ✅ Ready with WebSocket sync')
    }
    return
  }

  if (event === 'syncQueriesStarted') {
    dataStoreReady = false
    syncPhase = 'starting'
    console.log('[DataStore] Sync queries starting...')
  }
})

export const isDataStoreReady = (): boolean => dataStoreReady
export const getDataStoreSyncPhase = () => syncPhase
export const getWebSocketErrorCount = () => websocketErrors

/**
 * Wait for DataStore to reach ready state after starting sync
 */
export const waitForDataStoreReady = async (timeoutMs: number): Promise<void> => {
  if (isDataStoreReady()) return

  await new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe()
      resolve()
    }, timeoutMs)

    const unsubscribe = Hub.listen('datastore', ({ payload }) => {
      const event = payload?.event
      if (event === 'ready' || event === 'syncQueriesReady') {
        window.clearTimeout(timeoutId)
        unsubscribe()
        resolve()
      }
    })
  })
}

/**
 * Trigger DataStore sync after login.
 * In Amplify v6, DataStore auto-starts on first query — do NOT call DataStore.start() explicitly.
 * This function fires a lightweight query to wake DataStore, then waits for Hub "ready" event.
 */
export const clearAndSyncDataStore = async (): Promise<void> => {
  try {
    console.log('[DataStore] Starting aggressive sync...')
    syncPhase = 'starting'

    // Step 1: Stop any existing sync
    try {
      await DataStore.stop()
      syncPhase = 'stopping'
      console.log('[DataStore] Stopped existing session')
    } catch (e) {
      console.warn('[DataStore] No active session to stop')
    }

    // Step 2: Clear local storage
    try {
      await DataStore.clear()
      syncPhase = 'clearing'
      console.log('[DataStore] Cleared local storage')
    } catch (e) {
      console.warn('[DataStore] Failed to clear storage:', e)
    }

    // Step 3: Start fresh
    await DataStore.start()
    syncPhase = 'waiting-ready'
    console.log('[DataStore] Started fresh sync')

    // Step 4: Fire queries to wake DataStore sync for critical models.
    // Querying a model causes DataStore to pull that model's records from DynamoDB.
    try {
      await DataStore.query(PreTaskPlanControl as any)
      console.log('[DataStore] PreTaskPlanControl query fired')
    } catch (e) {
      console.warn('[DataStore] PreTaskPlanControl query failed (may still sync):', e)
    }

    try {
      await DataStore.query(Project as any)
      console.log('[DataStore] Project query fired — project dropdown data will be available from DataStore')
    } catch (e) {
      console.warn('[DataStore] Project query failed (may still sync):', e)
    }

    await waitForDataStoreReady(DATASTORE_READY_TIMEOUT_MS)
    syncPhase = 'ready'
    console.log('[DataStore] ✓ Aggressive sync complete.')
  } catch (err) {
    syncPhase = 'error'
    console.error('[DataStore] Aggressive sync failed:', err)
  }
}
