import { Router, Request, Response } from 'express'
import { DynamoDBClient, ScanCommand, QueryCommand, AttributeValue } from '@aws-sdk/client-dynamodb'
import { fromIni } from '@aws-sdk/credential-providers'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import logger from '@/utils/logger'

const router = Router()

let dynamoClient: DynamoDBClient | null = null

const PROJECT_TABLE = 'Project-c37hpkplf5d5jnfqgermgnww5a-stgdev'
const PRETASK_CONTROL_TABLE = 'PreTaskPlanControl-c37hpkplf5d5jnfqgermgnww5a-stgdev'
const PRETASK_TASK_DETAIL_TABLE = 'PreTaskPlanTaskDetail-c37hpkplf5d5jnfqgermgnww5a-stgdev'

const initializeDynamoClient = async (): Promise<DynamoDBClient> => {
  if (dynamoClient) return dynamoClient

  const profile = process.env.AWS_PROFILE || 'amplify-stg-admin'
  const userHome = process.env.USERPROFILE || process.env.HOME || ''
  const credentialsFile = `${userHome}\\.aws\\credentials`
  logger.info(`[PreTaskControls] Initializing DynamoDB client - profile: ${profile}`)

  try {
    dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-west-2',
      credentials: fromIni({
        profile,
        filepath: credentialsFile,
      }),
    })
    logger.info('[PreTaskControls] ✓ DynamoDB client initialized')
    return dynamoClient
  } catch (error) {
    logger.error('[PreTaskControls] Failed to initialize DynamoDB client:', error)
    throw error
  }
}

interface ProjectItem {
  id?: string
  project_name?: string
  project_number?: string | number
  [key: string]: unknown
}

interface PreTaskControlItem {
  id?: string
  control_id?: string | number
  project_number?: string | number
  control_name?: string
  control_option?: string
  shift_start_signature?: string
  createdAt?: string
  [key: string]: unknown
}

interface PreTaskTaskDetailItem {
  control_id?: string | number
  task_type?: string
  [key: string]: unknown
}

const resolveControlId = (control: PreTaskControlItem): string => {
  return String(control.control_id ?? control.id ?? '').trim()
}

const getCrewMemberLoginCounts = async (
  client: DynamoDBClient,
  controlIds: string[]
): Promise<Map<string, number>> => {
  const counts = new Map<string, number>()
  if (!controlIds.length) return counts

  // Fast path: if control_id is queryable, this avoids full table scans.
  try {
    for (const controlId of controlIds) {
      let total = 0
      let lastEvaluatedKey: Record<string, AttributeValue> | undefined

      do {
        const query = new QueryCommand({
          TableName: PRETASK_TASK_DETAIL_TABLE,
          KeyConditionExpression: 'control_id = :controlId',
          FilterExpression: 'task_type = :taskType',
          ExpressionAttributeValues: {
            ':controlId': { S: controlId },
            ':taskType': { S: 'CrewMemberLogin' },
          },
          Select: 'COUNT',
          ExclusiveStartKey: lastEvaluatedKey,
        })

        const response = await client.send(query)
        total += response.Count ?? 0
        lastEvaluatedKey = response.LastEvaluatedKey as Record<string, AttributeValue> | undefined
      } while (lastEvaluatedKey)

      counts.set(controlId, total)
    }

    return counts
  } catch (error) {
    logger.warn('[PreTaskControls] Query by control_id unavailable, falling back to filtered scan')
  }

  // Fallback: filtered/projection scan to reduce payload when query path is not available.
  const controlIdSet = new Set(controlIds)
  const expressionValues: Record<string, AttributeValue> = {
    ':taskType': { S: 'CrewMemberLogin' },
  }
  const controlIdTokens: string[] = []
  controlIds.forEach((controlId, index) => {
    const token = `:cid${index}`
    expressionValues[token] = { S: controlId }
    controlIdTokens.push(token)
  })

  const filterExpression =
    controlIdTokens.length > 0
      ? `task_type = :taskType AND control_id IN (${controlIdTokens.join(', ')})`
      : 'task_type = :taskType'

  let lastEvaluatedKey: Record<string, AttributeValue> | undefined

  do {
    const command = new ScanCommand({
      TableName: PRETASK_TASK_DETAIL_TABLE,
      ProjectionExpression: 'control_id, task_type',
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionValues,
      Limit: 1000,
      ExclusiveStartKey: lastEvaluatedKey,
    })

    const response = await client.send(command)

    if (response.Items) {
      for (const item of response.Items) {
        const unmarshalled = unmarshall(item) as PreTaskTaskDetailItem
        const controlId = String(unmarshalled.control_id ?? '').trim()
        if (!controlId || !controlIdSet.has(controlId)) continue

        counts.set(controlId, (counts.get(controlId) ?? 0) + 1)
      }
    }

    lastEvaluatedKey = response.LastEvaluatedKey as Record<string, AttributeValue> | undefined
  } while (lastEvaluatedKey)

  return counts
}

/**
 * Fetch project number from Project table by project name
 */
const getProjectNumber = async (client: DynamoDBClient, projectName: string): Promise<string | number | null> => {
  try {
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined
    const allProjects: ProjectItem[] = []

    // Scan all items since we need to match by name
    do {
      const command = new ScanCommand({
        TableName: PROJECT_TABLE,
        Limit: 100,
        ExclusiveStartKey: lastEvaluatedKey,
      })

      const response = await client.send(command)

      if (response.Items) {
        for (const item of response.Items) {
          const unmarshalled = unmarshall(item) as ProjectItem
          allProjects.push(unmarshalled)
        }
      }

      lastEvaluatedKey = response.LastEvaluatedKey as Record<string, AttributeValue> | undefined
    } while (lastEvaluatedKey)

    logger.info(`[PreTaskControls] Scanned ${allProjects.length} projects looking for "${projectName}"`)

    // Find matching project by name (case-insensitive)
    const projectNameLower = projectName.toLowerCase().trim()
    const matchingProject = allProjects.find(
      (proj) => proj.project_name?.toString().toLowerCase().trim() === projectNameLower
    )

    if (matchingProject) {
      logger.info(`[PreTaskControls] Found project "${projectName}" with number: ${matchingProject.project_number || matchingProject.id}`)
      return matchingProject.project_number ?? matchingProject.id ?? null
    }

    logger.info(`[PreTaskControls] Project not found: "${projectName}" after scanning ${allProjects.length} projects`)
    return null
  } catch (error) {
    logger.error('[PreTaskControls] Error fetching project number:', error)
    throw error
  }
}

/**
 * Fetch PreTaskControl records by project number and date
 */
const getPreTaskControls = async (
  client: DynamoDBClient,
  projectNumber: string | number,
  reportDate: string
): Promise<PreTaskControlItem[]> => {
  const controls: PreTaskControlItem[] = []
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined

  // Parse date to match createdAt format (ISO 8601)
  // Input: 2026-05-04 -> search for 2026-05-04T* in createdAt
  const datePrefix = `${reportDate}T`

  do {
    const command = new ScanCommand({
      TableName: PRETASK_CONTROL_TABLE,
      FilterExpression: 'project_number = :projectNumber AND begins_with(createdAt, :datePrefix)',
      ExpressionAttributeValues: {
        ':projectNumber': { S: String(projectNumber) },
        ':datePrefix': { S: datePrefix },
      },
      Limit: 100,
      ExclusiveStartKey: lastEvaluatedKey,
    })

    try {
      const response = await client.send(command)

      if (response.Items) {
        for (const item of response.Items) {
          const unmarshalled = unmarshall(item) as PreTaskControlItem
          controls.push(unmarshalled)
        }
      }

      lastEvaluatedKey = response.LastEvaluatedKey as Record<string, AttributeValue> | undefined
    } catch (error) {
      logger.error('[PreTaskControls] Error scanning PreTaskControl table:', error)
      throw error
    }
  } while (lastEvaluatedKey)

  return controls
}

/**
 * GET /api/v1/pretask-controls/legacy-pretask-controls
 * Query parameters:
 *   - projectName: string (required)
 *   - reportDate: string (required, format: YYYY-MM-DD)
 *
 * Returns PreTaskPlanControl records for the given project and date
 */
router.get('/legacy-pretask-controls', async (req: Request, res: Response) => {
  const { projectName, reportDate } = req.query

  if (!projectName || typeof projectName !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: projectName',
    })
  }

  if (!reportDate || typeof reportDate !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: reportDate',
    })
  }

  try {
    logger.info(`[PreTaskControls] Fetching data for project: ${projectName}, date: ${reportDate}`)
    const client = await initializeDynamoClient()

    // Step 1: Get project number from Project table
    const projectNumber = await getProjectNumber(client, projectName)

    if (!projectNumber) {
      logger.info(`[PreTaskControls] No project found with name: ${projectName}`)
      return res.json({
        success: true,
        data: [],
        count: 0,
        projectName,
        reportDate,
      })
    }

    logger.info(`[PreTaskControls] Found project number: ${projectNumber}`)

    // Step 2: Get PreTaskControl records by project number and date
    const controls = await getPreTaskControls(client, projectNumber, reportDate)

    logger.info(`[PreTaskControls] Retrieved ${controls.length} records`)

    // Step 3: Build control_id list from filtered controls
    const controlIds = controls
      .map((control) => resolveControlId(control))
      .filter((value) => Boolean(value))

    // Step 4: Count CrewMemberLogin rows per control_id
    const workerCountsByControlId = await getCrewMemberLoginCounts(client, controlIds)

    // Step 5: Transform response to include fields needed by subcontractor prefill
    const transformedData = controls.map((control) => {
      const controlId = resolveControlId(control)
      const workerCount = workerCountsByControlId.get(controlId) ?? 0

      return {
        id: control.id,
        control_id: controlId,
        project_number: control.project_number,
        control_name: control.control_name, // Auto-populate Project Name
        control_option: control.control_option, // Include control_option for permits
        company_name: control.shift_start_signature, // Auto-populate Company Name
        shift_start_signature: control.shift_start_signature,
        createdAt: control.createdAt,
        worker_count: workerCount,
        workers: workerCount,
      }
    })

    res.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
      projectName,
      reportDate,
    })
  } catch (error) {
    logger.error('[PreTaskControls] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PreTaskPlanControl data'
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PreTaskPlanControl data',
      message: errorMessage,
      hint: 'Make sure AWS credentials are configured.',
    })
  }
})

export default router
