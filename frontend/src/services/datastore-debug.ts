import { DataStore } from 'aws-amplify/datastore'
import { Hub } from 'aws-amplify/utils'
import amplifyconfig from '@/amplifyconfiguration.json'

const APPSYNC_ENDPOINT = (amplifyconfig as Record<string, string>).aws_appsync_graphqlEndpoint
const APPSYNC_API_KEY = (amplifyconfig as Record<string, string>).aws_appsync_apiKey

interface SyncStatus {
  phase: string
  timestamp: number
  message: string
  error?: string
}

const syncLog: SyncStatus[] = []

export const getSyncLog = (): SyncStatus[] => syncLog

export const logSync = (phase: string, message: string, error?: string) => {
  const entry: SyncStatus = {
    phase,
    timestamp: Date.now(),
    message,
    error,
  }
  syncLog.push(entry)
  console.log(`[DataStore Debug] ${phase}: ${message}`, error || '')
}

/**
 * Test AppSync connectivity and API Key validity
 */
export const testAppSyncConnectivity = async (): Promise<{
  connected: boolean
  apiKey?: string
  endpoint?: string
  error?: string
}> => {
  try {
    logSync('appSync.test', 'Testing AppSync connectivity...')

    const endpoint = APPSYNC_ENDPOINT
    const apiKey = APPSYNC_API_KEY

    if (!endpoint || !apiKey) {
      throw new Error('Missing AppSync config in amplifyconfiguration.json')
    }

    logSync('appSync.config', `Endpoint: ${endpoint.substring(0, 50)}...`)
    logSync('appSync.config', `API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`)

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query: 'query { __typename }' }),
    })

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    logSync('appSync.test', '✓ AppSync connection successful')
    return { connected: true, apiKey, endpoint }
  } catch (error) {
    logSync('appSync.test', '✗ AppSync connection failed', String(error))
    return { connected: false, error: String(error) }
  }
}

/**
 * Monitor DataStore Hub events
 */
export const monitorDataStoreHub = (): (() => void) => {
  logSync('hub.listen', 'Starting DataStore Hub monitoring...')
  
  return Hub.listen('datastore', ({ payload }) => {
    const { event, data } = payload

    if (event === 'syncQueriesStarted') {
      logSync('hub.event', 'Sync queries started', undefined)
    } else if (event === 'modelSynced') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logSync('hub.event', `Model synced: ${(data as any)?.modelName}`, undefined)
    } else if (event === 'syncQueriesReady') {
      logSync('hub.event', 'Sync queries ready', undefined)
    } else if (event === 'ready') {
      logSync('hub.event', 'DataStore ready', undefined)
    } else if (event === 'outboxStatus') {
      logSync('hub.event', `Outbox status: ${JSON.stringify(data)}`, undefined)
    } else {
      logSync('hub.event', `Event: ${event}`, JSON.stringify(data))
    }
  })
}

/**
 * Force clear and full resync
 */
export const forceFullResync = async (): Promise<boolean> => {
  try {
    logSync('resync.start', 'Starting force full resync...')

    logSync('resync.stop', 'Stopping DataStore...')
    await DataStore.stop()
    
    logSync('resync.clear', 'Clearing DataStore...')
    await DataStore.clear()

    logSync('resync.start', 'Starting DataStore...')
    await DataStore.start()

    logSync('resync.complete', '✓ Full resync completed')
    return true
  } catch (error) {
    logSync('resync.error', '✗ Full resync failed', String(error))
    return false
  }
}

/**
 * Check DataStore outbox (pending mutations)
 */
export const checkDataStoreOutbox = async (): Promise<any> => {
  try {
    logSync('outbox.check', 'Checking outbox...')
    const outbox = await (DataStore as any).getOutbox()
    logSync('outbox.result', `Outbox items: ${outbox?.length || 0}`)
    return outbox
  } catch (error) {
    logSync('outbox.error', 'Failed to check outbox', String(error))
    return null
  }
}

/**
 * Get comprehensive sync diagnostics
 */
export const getDiagnostics = async (): Promise<{
  appSyncConnected: boolean
  dataStoreReady: boolean
  syncLog: SyncStatus[]
  outbox: any
}> => {
  const appSync = await testAppSyncConnectivity()
  const outbox = await checkDataStoreOutbox()

  return {
    appSyncConnected: appSync.connected,
    dataStoreReady: (DataStore as any).isReady?.() || false,
    syncLog,
    outbox,
  }
}
