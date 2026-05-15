interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message?: string }>
}

export interface DailyReportRecord {
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
}

export interface DailyReportInput {
  reportId?: string
  userId: string
  reportDate: string
  employeeName?: string
  trade?: string
  taskDetails?: string
  hoursWorked?: number
  status?: string
  remarks?: string
}

export interface SubcontractorRecord {
  id: string
  reportId: string
  company: string
  workers: number
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateSubcontractorInput {
  id?: string
  reportId: string
  company: string
  workers: number
}

export interface UpdateSubcontractorInput {
  id: string
  reportId?: string
  company?: string
  workers?: number
}

const APPSYNC_ENDPOINT = (
  import.meta.env.VITE_APPSYNC_GRAPHQL_ENDPOINT ||
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  import.meta.env.VITE_AWS_APPSYNC_GRAPHQL_ENDPOINT
) as string | undefined

const APPSYNC_API_KEY = (
  import.meta.env.VITE_APPSYNC_API_KEY ||
  import.meta.env.VITE_GRAPHQL_API_KEY ||
  import.meta.env.VITE_AWS_APPSYNC_API_KEY
) as string | undefined

const DAILY_REPORT_FIELDS = `
  reportId
  userId
  reportDate
  employeeName
  trade
  taskDetails
  hoursWorked
  status
  remarks
  createdAt
  updatedAt
`

const CREATE_DAILY_REPORT = `
  mutation CreateDailyReport($input: CreateDailyReportInput!) {
    createDailyReport(input: $input) {
      ${DAILY_REPORT_FIELDS}
    }
  }
`

const UPDATE_DAILY_REPORT = `
  mutation UpdateDailyReport($input: UpdateDailyReportInput!) {
    updateDailyReport(input: $input) {
      ${DAILY_REPORT_FIELDS}
    }
  }
`

const DELETE_DAILY_REPORT = `
  mutation DeleteDailyReport($input: DeleteDailyReportInput!) {
    deleteDailyReport(input: $input) {
      ${DAILY_REPORT_FIELDS}
    }
  }
`

const GET_DAILY_REPORT = `
  query GetDailyReport($reportId: ID!) {
    getDailyReport(reportId: $reportId) {
      ${DAILY_REPORT_FIELDS}
    }
  }
`

const LIST_DAILY_REPORTS_BY_USER = `
  query ListDailyReportsByUserId($userId: String!, $limit: Int, $nextToken: String) {
    listDailyReportsByUserId(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        ${DAILY_REPORT_FIELDS}
      }
      nextToken
    }
  }
`

const SUBCONTRACTOR_FIELDS = `
  id
  reportId
  company
  workers
  createdAt
  updatedAt
`

const CREATE_SUBCONTRACTOR = `
  mutation CreateSubcontractor($input: CreateSubcontractorInput!) {
    createSubcontractor(input: $input) {
      ${SUBCONTRACTOR_FIELDS}
    }
  }
`

const UPDATE_SUBCONTRACTOR = `
  mutation UpdateSubcontractor($input: UpdateSubcontractorInput!) {
    updateSubcontractor(input: $input) {
      ${SUBCONTRACTOR_FIELDS}
    }
  }
`

const DELETE_SUBCONTRACTOR = `
  mutation DeleteSubcontractor($input: DeleteSubcontractorInput!) {
    deleteSubcontractor(input: $input) {
      ${SUBCONTRACTOR_FIELDS}
    }
  }
`

const LIST_SUBCONTRACTORS_BY_REPORT_ID = `
  query ListSubcontractorsByReportId($reportId: String!, $limit: Int, $nextToken: String) {
    listSubcontractorsByReportId(reportId: $reportId, limit: $limit, nextToken: $nextToken) {
      items {
        ${SUBCONTRACTOR_FIELDS}
      }
      nextToken
    }
  }
`

const createUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `dr-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const toIsoDate = (inputDate: string): string => {
  const parsed = new Date(inputDate)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid report date provided')
  }
  return parsed.toISOString().split('T')[0]
}

const graphQLRequest = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
    throw new Error('Missing AppSync endpoint or API key in frontend environment.')
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

  const payload = (await response.json()) as GraphQLResponse<T>
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((item) => item.message).filter(Boolean).join(', '))
  }
  if (!payload.data) {
    throw new Error('No data returned from AppSync')
  }

  return payload.data
}

export const dailyReportsApi = {
  async createDailyReport(input: DailyReportInput): Promise<DailyReportRecord> {
    const normalizedInput = {
      ...input,
      reportId: input.reportId ?? createUuid(),
      reportDate: toIsoDate(input.reportDate),
    }

    const data = await graphQLRequest<{ createDailyReport: DailyReportRecord }>(
      CREATE_DAILY_REPORT,
      { input: normalizedInput }
    )
    return data.createDailyReport
  },

  async updateDailyReport(input: DailyReportInput & { reportId: string }): Promise<DailyReportRecord> {
    const normalizedInput = {
      ...input,
      reportDate: toIsoDate(input.reportDate),
    }

    const data = await graphQLRequest<{ updateDailyReport: DailyReportRecord }>(
      UPDATE_DAILY_REPORT,
      { input: normalizedInput }
    )
    return data.updateDailyReport
  },

  async deleteDailyReport(reportId: string): Promise<DailyReportRecord> {
    const data = await graphQLRequest<{ deleteDailyReport: DailyReportRecord }>(
      DELETE_DAILY_REPORT,
      { input: { reportId } }
    )
    return data.deleteDailyReport
  },

  async getDailyReport(reportId: string): Promise<DailyReportRecord | null> {
    const data = await graphQLRequest<{ getDailyReport: DailyReportRecord | null }>(
      GET_DAILY_REPORT,
      { reportId }
    )
    return data.getDailyReport
  },

  async listDailyReports(userId: string, limit = 50): Promise<DailyReportRecord[]> {
    const data = await graphQLRequest<{
      listDailyReportsByUserId: { items: DailyReportRecord[] | null }
    }>(LIST_DAILY_REPORTS_BY_USER, {
      userId,
      limit,
    })
    return data.listDailyReportsByUserId.items ?? []
  },

  async createSubcontractor(input: CreateSubcontractorInput): Promise<SubcontractorRecord> {
    const normalizedInput = {
      ...input,
      id: input.id ?? createUuid(),
    }

    const data = await graphQLRequest<{ createSubcontractor: SubcontractorRecord }>(
      CREATE_SUBCONTRACTOR,
      { input: normalizedInput }
    )
    return data.createSubcontractor
  },

  async updateSubcontractor(input: UpdateSubcontractorInput): Promise<SubcontractorRecord> {
    const data = await graphQLRequest<{ updateSubcontractor: SubcontractorRecord }>(
      UPDATE_SUBCONTRACTOR,
      { input }
    )
    return data.updateSubcontractor
  },

  async deleteSubcontractor(id: string): Promise<SubcontractorRecord> {
    const data = await graphQLRequest<{ deleteSubcontractor: SubcontractorRecord }>(
      DELETE_SUBCONTRACTOR,
      { input: { id } }
    )
    return data.deleteSubcontractor
  },

  async listSubcontractorsByReportId(reportId: string, limit = 50): Promise<SubcontractorRecord[]> {
    const data = await graphQLRequest<{
      listSubcontractorsByReportId: { items: SubcontractorRecord[] | null }
    }>(LIST_SUBCONTRACTORS_BY_REPORT_ID, {
      reportId,
      limit,
    })
    return data.listSubcontractorsByReportId.items ?? []
  },
}

