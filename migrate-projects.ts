/**
 * Migration Script: Sync Projects from Old DynamoDB Table to New AppSync Project Table
 * 
 * Usage:
 *   npx ts-node migrate-projects.ts
 * 
 * Prerequisites:
 *   - AWS credentials configured (via ~/.aws/credentials or environment variables)
 *   - Run from project root directory
 * 
 * This script:
 * 1. Scans the old Project-c37hpkplf5d5jnfqgermgnww5a-stgdev DynamoDB table
 * 2. Extracts project_name values
 * 3. Creates corresponding Project records via AppSync mutations
 */

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

interface ProjectItem {
  id?: string;
  project_name?: string;
  [key: string]: unknown;
}

interface AppSyncProjectInput {
  id: string;
  project_name: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message?: string }>;
}

interface CreateProjectResponse {
  createProject?: {
    id: string;
    project_name: string;
  };
}

// Configuration
const OLD_TABLE_NAME = 'Project-c37hpkplf5d5jnfqgermgnww5a-stgdev';
const AWS_REGION = 'us-west-2'; // Update if different
const APPSYNC_ENDPOINT = 'https://vcmd32juabdkplgtfaleds5bke.appsync-api.us-west-2.amazonaws.com/graphql';
const APPSYNC_API_KEY = 'da2-kurejmc32bgevfw2nwmap4gx2e';

// GraphQL Mutation for creating projects
const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      project_name
      createdAt
      updatedAt
    }
  }
`;

/**
 * Scan the old DynamoDB table for projects
 */
async function scanOldProjectTable(): Promise<ProjectItem[]> {
  const client = new DynamoDBClient({ region: AWS_REGION });
  const projects: ProjectItem[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  console.log(`Scanning old DynamoDB table: ${OLD_TABLE_NAME}...`);

  do {
    const command = new ScanCommand({
      TableName: OLD_TABLE_NAME,
      Limit: 100,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const response = await client.send(command);
    
    if (response.Items) {
      for (const item of response.Items) {
        const unmarshalled = unmarshall(item) as ProjectItem;
        if (unmarshalled.project_name) {
          projects.push(unmarshalled);
        }
      }
    }

    lastEvaluatedKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);

  console.log(`Found ${projects.length} projects in old table`);
  return projects;
}

/**
 * Create a project via AppSync mutation
 */
async function createProjectViaAppSync(projectName: string): Promise<boolean> {
  try {
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': APPSYNC_API_KEY,
      },
      body: JSON.stringify({
        query: CREATE_PROJECT_MUTATION,
        variables: {
          input: {
            id: uuidv4(),
            project_name: projectName.trim(),
          },
        },
      }),
    });

    const payload = (await response.json()) as GraphQLResponse<CreateProjectResponse>;
    
    if (payload.errors?.length) {
      console.error(`Failed to create project "${projectName}":`, payload.errors[0]?.message);
      return false;
    }

    if (!payload.data?.createProject) {
      console.error(`Failed to create project "${projectName}": No data returned`);
      return false;
    }

    console.log(`✓ Created project: ${projectName}`);
    return true;
  } catch (error) {
    console.error(`Error creating project "${projectName}":`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrateProjects(): Promise<void> {
  try {
    console.log('\n=== Project Migration Started ===\n');

    // Step 1: Scan old table
    const oldProjects = await scanOldProjectTable();

    if (oldProjects.length === 0) {
      console.log('No projects found in old table. Migration aborted.');
      return;
    }

    // Step 2: Extract unique project names
    const uniqueProjectNames = Array.from(
      new Set(
        oldProjects
          .map((p) => p.project_name?.trim())
          .filter((name): name is string => Boolean(name))
      )
    );

    console.log(`Found ${uniqueProjectNames.length} unique project names\n`);

    // Step 3: Create projects via AppSync
    console.log('Creating projects via AppSync...\n');
    let successCount = 0;
    let failureCount = 0;

    for (const projectName of uniqueProjectNames) {
      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const success = await createProjectViaAppSync(projectName);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // Summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total projects processed: ${uniqueProjectNames.length}`);
    console.log(`✓ Successfully created: ${successCount}`);
    console.log(`✗ Failed: ${failureCount}`);
    console.log('\nMigration completed!\n');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProjects();
