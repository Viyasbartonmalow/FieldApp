/**
 * projectDataStore.service.ts
 *
 * Reads project names from the local Amplify DataStore (Project model).
 * DataStore is kept in sync with the DynamoDB `Project-…-stgdev` table via
 * Amplify's built-in AppSync ↔ DataStore sync engine.
 *
 * Falls back to a direct AppSync query when DataStore is not yet ready
 * so the dropdown is never blocked on startup.
 */

import { DataStore } from 'aws-amplify/datastore'
import { Project } from '@/models'
import amplifyconfig from '@/amplifyconfiguration.json'
import { isDataStoreReady, waitForDataStoreReady } from './datastore-sync'

const READY_TIMEOUT_MS = 20_000
const APPSYNC_ENDPOINT = (amplifyconfig as Record<string, string>).aws_appsync_graphqlEndpoint
const APPSYNC_API_KEY = (amplifyconfig as Record<string, string>).aws_appsync_apiKey

// ─── GraphQL fallback ────────────────────────────────────────────────────────

interface ListProjectsGqlResponse {
  data?: {
    listProjects?: {
      items?: Array<{ project_name?: string | null } | null> | null
      nextToken?: string | null
    }
  }
  errors?: Array<{ message?: string }>
}

const LIST_PROJECTS_GQL = /* GraphQL */ `
  query ListProjects($limit: Int, $nextToken: String) {
    listProjects(limit: $limit, nextToken: $nextToken) {
      items {
        project_number
        project_name
      }
      nextToken
    }
  }
`

async function fetchProjectNamesFromAppSync(limit?: number): Promise<string[]> {
  if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
    console.error('[projectDataStore] AppSync config missing!')
    console.error('  - Endpoint:', APPSYNC_ENDPOINT)
    console.error('  - API Key:', APPSYNC_API_KEY ? 'configured' : 'MISSING')
    throw new Error('[projectDataStore] Missing AppSync config in amplifyconfiguration.json')
  }

  console.log('[projectDataStore] AppSync Query Starting:')
  console.log('  - Endpoint:', APPSYNC_ENDPOINT.split('/').slice(0, 3).join('/'))
  console.log('  - API Key (first 10 chars):', APPSYNC_API_KEY.substring(0, 10) + '***')

  const names = new Set<string>()
  let nextToken: string | null | undefined = null
  const pageLimit = limit ? Math.min(limit, 1000) : 1000

  do {
    try {
      const resp = await fetch(APPSYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          query: LIST_PROJECTS_GQL,
          variables: { limit: pageLimit, nextToken },
        }),
      })

      if (!resp.ok) {
        console.error(`[projectDataStore] AppSync HTTP Error ${resp.status}`)
        throw new Error(`AppSync responded ${resp.status}`)
      }

      const payload = (await resp.json()) as ListProjectsGqlResponse
      if (payload.errors?.length) {
        const errorMsg = payload.errors.map((e) => e.message).join(', ')
        console.error('[projectDataStore] AppSync GraphQL Error:', errorMsg)
        throw new Error(errorMsg)
      }

      for (const item of payload.data?.listProjects?.items ?? []) {
        const name = item?.project_name?.trim()
        if (name) names.add(name)
      }

      nextToken = payload.data?.listProjects?.nextToken
    } catch (err) {
      console.error('[projectDataStore] AppSync request error:', err)
      throw err
    }
  } while (nextToken && (!limit || names.size < limit))

  const sorted = Array.from(names).sort((a, b) => a.localeCompare(b))
  return limit ? sorted.slice(0, limit) : sorted
}

// ─── DataStore primary path ──────────────────────────────────────────────────

async function fetchProjectNamesFromDataStore(limit?: number): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = await DataStore.query(Project as any)

  console.log(`[projectDataStore] DataStore.query(Project) returned ${projects.length} records`)
  if (projects.length === 0) {
    console.warn(
      '[projectDataStore] DataStore is empty — sync may not be complete or DynamoDB has no Project records'
    )
  }

  const names = Array.from(
    new Set(
      (projects as Array<{ project_name: string }>)
        .map((p) => p.project_name?.trim())
        .filter((n): n is string => Boolean(n))
    )
  ).sort((a, b) => a.localeCompare(b))

  return limit ? names.slice(0, limit) : names
}

// ─── Public service ──────────────────────────────────────────────────────────

export interface ProjectRecord {
  project_number: string
  project_name: string
  project_code?: string | null
  job_number?: number | null
  state?: string | null
}

const projectDataStoreService = {
  /**
   * Return sorted project names.
   *
   * Strategy:
   *  1. Wait up to READY_TIMEOUT_MS for DataStore to be ready.
   *  2. Query local DataStore — zero DynamoDB/AppSync round-trip.
   *  3. If DataStore returns no rows (not yet populated), fall back to a
   *     direct AppSync query so the dropdown is never empty.
   */
  async listProjectNames(limit?: number): Promise<string[]> {
    // ── 1. Wait for sync if not ready ────────────────────────────────────────
    if (!isDataStoreReady()) {
      console.log('[projectDataStore] Waiting for DataStore to be ready…')
      await waitForDataStoreReady(READY_TIMEOUT_MS)
      console.log('[projectDataStore] DataStore ready signal received')
    } else {
      console.log('[projectDataStore] DataStore already ready')
    }

    // ── 2. Try DataStore (local, fast) ───────────────────────────────────────
    try {
      console.log('[projectDataStore] Querying DataStore for Project records...')
      const names = await fetchProjectNamesFromDataStore(limit)
      if (names.length > 0) {
        console.log(`[projectDataStore] ✅ SUCCESS: Loaded ${names.length} projects from LOCAL DataStore`)
        console.log('[projectDataStore] Source: Local IndexedDB (synced from DynamoDB)')
        return names
      }
      console.warn(
        '[projectDataStore] ⚠️ DataStore returned 0 projects — attempting fallback to AppSync...'
      )
      console.warn('[projectDataStore] Possible causes:')
      console.warn('  1. Sync from DynamoDB incomplete (first load may take 10-20s)')
      console.warn('  2. DynamoDB Project table is empty')
      console.warn('  3. AppSync WebSocket connection failed')
    } catch (err) {
      console.error('[projectDataStore] ❌ DataStore query error (non-critical, will fallback):', err)
    }

    // ── 3. Fallback: direct AppSync query ────────────────────────────────────
    try {
      console.log('[projectDataStore] Attempting AppSync HTTP fallback...')
      const names = await fetchProjectNamesFromAppSync(limit)
      if (names.length > 0) {
        console.log(`[projectDataStore] ✅ FALLBACK SUCCESS: Loaded ${names.length} projects from AppSync`)
        console.log('[projectDataStore] Note: Using direct AppSync query (bypassing local DataStore)')
        console.log('[projectDataStore] 💡 DataStore sync will continue in background')
        return names
      }
      console.error('[projectDataStore] ❌ AppSync fallback also returned 0 projects')
      console.error('[projectDataStore] This means DynamoDB Project table is EMPTY or not accessible')
      // Return empty array instead of throwing — allow UI to show "No projects"
      // This is better than blocking the modal
      return []
    } catch (err) {
      console.error('[projectDataStore] ❌ AppSync fallback failed:', err)
      
      // Provide specific network troubleshooting guidance
      if (err instanceof TypeError) {
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_RESET')) {
          console.error('[projectDataStore] 🔥 NETWORK CONNECTION ERROR detected:')
          console.error('[projectDataStore] This typically indicates:')
          console.error('  1. ⚠️ WebSocket (wss://) may be blocked by firewall')
          console.error('  2. ⚠️ AppSync endpoint not accessible from your network')
          console.error('  3. ⚠️ Proxy/VPN interference')
          console.error('[projectDataStore] Solution: Contact IT to whitelist:')
          console.error('  - Domain: appsync-api.us-west-2.amazonaws.com')
          console.error('  - Domain: appsync-realtime-api.us-west-2.amazonaws.com')
          console.error('  - Protocol: HTTPS, WSS (WebSocket Secure)')
        } else if (err.message.includes('Unauthorized') || err.message.includes('invalid')) {
          console.error('[projectDataStore] 🔑 API KEY ISSUE:')
          console.error('  - API Key may have expired (valid for 30 days)')
          console.error('  - Or API Key was not included in request')
          console.error('[projectDataStore] Solution: Clear browser cache (F12 → Storage → Clear)')
        }
      }
      // Return empty instead of throwing so UI renders gracefully
      return []
    }
  },

  /**
   * Explicitly initialize Project model sync from DynamoDB.
   * Call this during app init to ensure Project records start syncing.
   */
  async initializeProjectSync(): Promise<void> {
    try {
      console.log('[projectDataStore] Initializing Project model sync from DynamoDB...')
      // Querying the Project model triggers DataStore to sync records from DynamoDB
      const projects = await DataStore.query(Project as any)
      console.log(
        `[projectDataStore] ✓ Project sync initialized — ${projects.length} records currently in DataStore`
      )

      if (projects.length === 0) {
        console.warn(
          '[projectDataStore] ⚠ WARNING: 0 Project records in DataStore. Check: (1) Is DynamoDB table populated? (2) Is AppSync sync working?'
        )
      }
    } catch (err) {
      console.error('[projectDataStore] Project sync initialization error (non-fatal):', err)
    }
  },

  /**
   * Warm the DataStore cache by explicitly querying the Project model.
   * Call this during app initialization so the first dropdown open is instant.
   */
  async warmCache(): Promise<void> {
    try {
      const names = await fetchProjectNamesFromDataStore()
      console.log(`[projectDataStore] ✓ Cache warmed — ${names.length} projects in DataStore`)
    } catch (err) {
      console.warn('[projectDataStore] Cache warm failed (non-fatal):', err)
    }
  },
}

export default projectDataStoreService
