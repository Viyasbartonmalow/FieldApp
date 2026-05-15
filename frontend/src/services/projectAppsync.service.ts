import amplifyconfig from '@/amplifyconfiguration.json'

interface LegacyProjectsResponse {
  success: boolean
  data?: string[]
  count?: number
  message?: string
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message?: string }>
}

interface ListProjectsResponse {
  listProjects?: {
    items?: Array<{ project_name?: string | null } | null>
    nextToken?: string | null
  }
}

interface LegacyPretaskControlRow {
  id?: string
  control_id?: string
  company_name?: string
  createdAt?: string
  control_name?: string
  worker_count?: number
  workers?: number
  workerCount?: number
  companyName?: string
  projectName?: string
}

interface LegacyPretaskControlsResponse {
  success: boolean
  data?: LegacyPretaskControlRow[]
  count?: number
  message?: string
}

export interface PretaskSubcontractorPrefillRow {
  sourceId?: string
  controlId?: string
  createdAt?: string
  companyName: string
  projectName: string
  workerCount: number
}

const normalizeCompanyName = (row: LegacyPretaskControlRow): string => {
  const value = row.companyName ?? row.company_name
  if (typeof value === 'string') return value.trim()

  if (value && typeof value === 'object') {
    const nested = value as { company_name?: unknown; foreman_name?: unknown }
    if (typeof nested.company_name === 'string') return nested.company_name.trim()
    if (typeof nested.foreman_name === 'string') return nested.foreman_name.trim()
  }

  return ''
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
const PRETASK_FETCH_TIMEOUT_MS = 20000
const APPSYNC_ENDPOINT = (amplifyconfig as { aws_appsync_graphqlEndpoint?: string }).aws_appsync_graphqlEndpoint
const APPSYNC_API_KEY = (amplifyconfig as { aws_appsync_apiKey?: string }).aws_appsync_apiKey

const LIST_PROJECTS_QUERY = `
  query ListProjects($limit: Int, $nextToken: String) {
    listProjects(limit: $limit, nextToken: $nextToken) {
      items {
        project_name
      }
      nextToken
    }
  }
`

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

class ProjectAppsyncService {
  private async listProjectNamesFromAppSync(limit?: number): Promise<string[]> {
    if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
      throw new Error('Missing AppSync endpoint or API key in amplifyconfiguration.json')
    }

    const names = new Set<string>()
    let nextToken: string | null | undefined = null

    const pageLimit = limit ? Math.min(limit, 1000) : 1000

    do {
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          query: LIST_PROJECTS_QUERY,
          variables: {
            limit: pageLimit,
            nextToken,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`AppSync listProjects request failed with status ${response.status}`)
      }

      const payload = (await response.json()) as GraphQLResponse<ListProjectsResponse>
      if (payload.errors?.length) {
        throw new Error(payload.errors.map((item) => item.message).filter(Boolean).join(', '))
      }

      const items = payload.data?.listProjects?.items ?? []
      for (const item of items) {
        const name = item?.project_name?.trim() ?? ''
        if (name) names.add(name)
      }

      nextToken = payload.data?.listProjects?.nextToken
    } while (nextToken && (typeof limit !== 'number' || names.size < limit))

    const sorted = Array.from(names).sort((a, b) => a.localeCompare(b))
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
  }

  private async listProjectNamesFromLegacy(limit?: number): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/projects/legacy-projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Legacy projects request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as LegacyProjectsResponse
    const names = Array.isArray(payload.data) ? payload.data : []

    const sorted = Array.from(new Set(names.map((name) => name.trim()).filter((name) => Boolean(name))))
      .sort((a, b) => a.localeCompare(b))
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
  }

  async listProjectNames(limit?: number): Promise<string[]> {
    const combined = new Set<string>()

    try {
      const appSyncNames = await this.listProjectNamesFromAppSync(limit)
      for (const name of appSyncNames) combined.add(name)
    } catch {
      // Continue and attempt legacy source.
    }

    try {
      const legacyNames = await this.listProjectNamesFromLegacy(limit)
      for (const name of legacyNames) combined.add(name)
    } catch {
      // Keep whatever data is already available.
    }

    const sorted = Array.from(combined).sort((a, b) => a.localeCompare(b))
    if (sorted.length === 0) {
      throw new Error('Failed to load project names from both AppSync and legacy sources')
    }

    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
  }

  async getPretaskSubcontractorPrefill(
    projectName: string,
    reportDate: string
  ): Promise<PretaskSubcontractorPrefillRow[]> {
    const params = new URLSearchParams({ projectName, reportDate })

    const endpointCandidates = [
      `${API_BASE_URL}/pretask-controls/legacy-pretask-controls?${params.toString()}`,
      `${API_BASE_URL}/projects/legacy-pretask-controls?${params.toString()}`,
    ]

    let lastError: Error | null = null

    for (const endpoint of endpointCandidates) {
      try {
        const response = await fetchWithTimeout(
          endpoint,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
          PRETASK_FETCH_TIMEOUT_MS
        )

        if (!response.ok) {
          throw new Error(`Legacy pretask request failed with status ${response.status}`)
        }

        const payload = (await response.json()) as LegacyPretaskControlsResponse
        const rows = Array.isArray(payload.data) ? payload.data : []

        return rows
          .map((row) => {
            const baseWorkerCount =
              typeof row.workerCount === 'number'
                ? row.workerCount
                : typeof row.worker_count === 'number'
                  ? row.worker_count
                  : typeof row.workers === 'number'
                    ? row.workers
                    : 0

            return {
              sourceId: row.id,
              controlId: row.control_id,
              createdAt: row.createdAt,
              companyName: normalizeCompanyName(row),
              projectName: (row.projectName ?? row.control_name ?? '').toString().trim(),
              workerCount: baseWorkerCount + 1,
            }
          })
          .filter((row) => Boolean(row.companyName) || Boolean(row.projectName))
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new Error(`Legacy pretask request timed out after ${PRETASK_FETCH_TIMEOUT_MS}ms`)
        } else {
          lastError = err instanceof Error ? err : new Error('Failed to fetch legacy pretask controls')
        }
      }
    }

    throw lastError ?? new Error('Failed to fetch legacy pretask controls')
  }
}

const projectAppsyncService = new ProjectAppsyncService()
export default projectAppsyncService
