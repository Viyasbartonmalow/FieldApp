import { Router, Request, Response } from 'express'
import { DynamoDBClient, ScanCommand, AttributeValue } from '@aws-sdk/client-dynamodb'
import { fromIni } from '@aws-sdk/credential-providers'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import logger from '@/utils/logger'

const router = Router()

// Lazy initialization of DynamoDB client - create on first use
let dynamoClient: DynamoDBClient | null = null

const LEGACY_PROJECT_TABLE = 'Project-c37hpkplf5d5jnfqgermgnww5a-stgdev'

const initializeDynamoClient = async (): Promise<DynamoDBClient> => {
  if (dynamoClient) return dynamoClient

  const profile = process.env.AWS_PROFILE || 'amplify-stg-admin'
  const userHome = process.env.USERPROFILE || process.env.HOME || ''
  const credentialsFile = `${userHome}\\.aws\\credentials`
  logger.info(`Initializing DynamoDB client - profile: ${profile}, credentialsFile: ${credentialsFile}`)

  try {
    dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-west-2',
      credentials: fromIni({
        profile,
        filepath: credentialsFile,
      }),
    })
    logger.info('✓ DynamoDB client initialized')
    return dynamoClient
  } catch (error) {
    logger.error('Failed to initialize DynamoDB client:', error)
    throw error
  }
}

interface ProjectItem {
  id?: string
  project_name?: string
  [key: string]: unknown
}

const fetchLegacyProjectNames = async (): Promise<string[]> => {
  const client = await initializeDynamoClient()

  const projectNames = new Set<string>()
  let lastEvaluatedKey: Record<string, AttributeValue> | undefined

  do {
    const command = new ScanCommand({
      TableName: LEGACY_PROJECT_TABLE,
      Limit: 200,
      ExclusiveStartKey: lastEvaluatedKey,
    })

    const response = await client.send(command)

    if (response.Items) {
      for (const item of response.Items) {
        const unmarshalled = unmarshall(item) as ProjectItem
        const projectName = unmarshalled.project_name?.toString().trim() || ''
        if (projectName) projectNames.add(projectName)
      }
    }

    lastEvaluatedKey = response.LastEvaluatedKey as Record<string, AttributeValue> | undefined
  } while (lastEvaluatedKey)

  return Array.from(projectNames).sort((a, b) => a.localeCompare(b))
}

/**
 * GET /api/v1/projects/legacy-projects
 * Scans the old DynamoDB Project table and returns unique project names
 */
router.get('/legacy-projects', async (_req: Request, res: Response) => {
  try {
    logger.info(`Fetching legacy projects from table ${LEGACY_PROJECT_TABLE}`)
    const sortedProjectNames = await fetchLegacyProjectNames()

    logger.info(`Retrieved ${sortedProjectNames.length} unique project names from legacy table`)

    res.json({
      success: true,
      data: sortedProjectNames,
      count: sortedProjectNames.length,
    })
  } catch (error) {
    logger.error('Error fetching legacy projects:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch legacy projects',
      message: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure AWS credentials are configured. Use the web tool at /project-migration-tool.html if you prefer a browser-based solution.',
    })
  }
})

/**
 * GET /api/v1/projects
 * Returns unique project names from legacy table
 */
router.get('/', async (req: Request, res: Response) => {
  if (!dynamoClient) {
    return res.status(503).json({
      success: false,
      error: 'DynamoDB client not initialized',
      message: 'AWS credentials are not configured. Please set up AWS CLI credentials or use the web migration tool at /project-migration-tool.html',
    })
  }

  try {
    const sortedProjectNames = await fetchLegacyProjectNames()

    res.json({
      success: true,
      data: sortedProjectNames,
      count: sortedProjectNames.length,
    })
  } catch (error) {
    logger.error('Error fetching projects:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
      message: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure AWS credentials are configured.',
    })
  }
})

export default router
