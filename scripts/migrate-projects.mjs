#!/usr/bin/env node

/**
 * Project Migration Script - Simplified Version
 * 
 * This script migrates project data from the old DynamoDB table to the new AppSync Project table.
 * 
 * Prerequisites:
 *   - Node.js 18+ (has native fetch)
 *   - AWS CLI configured with credentials that can access the old DynamoDB table
 *   - jq (optional, for formatting JSON output)
 * 
 * Installation:
 *   npm install @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb
 * 
 * Usage:
 *   node scripts/migrate-projects.mjs
 * 
 * Or with npx (from the root):
 *   npx node scripts/migrate-projects.mjs
 */

// Configuration
const config = {
  oldTableName: 'Project-c37hpkplf5d5jnfqgermgnww5a-stgdev',
  region: 'us-west-2',
  appsyncEndpoint: 'https://vcmd32juabdkplgtfaleds5bke.appsync-api.us-west-2.amazonaws.com/graphql',
  appsyncApiKey: 'da2-kurejmc32bgevfw2nwmap4gx2e',
};

// GraphQL Mutation
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

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Scan old DynamoDB table using AWS CLI
 */
async function scanOldProjectTable() {
  console.log(`\nScanning old DynamoDB table: ${config.oldTableName}...\n`);
  
  try {
    // Use AWS CLI to scan the table
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const command = `aws dynamodb scan --table-name "${config.oldTableName}" --region ${config.region} --output json`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout);
    
    if (!result.Items || result.Items.length === 0) {
      console.log('No items found in old table.');
      return [];
    }

    // Convert DynamoDB items to regular objects
    const projects = result.Items.map((item) => {
      const obj = {};
      for (const [key, value] of Object.entries(item)) {
        const typeKey = Object.keys(value)[0];
        const typeValue = Object.values(value)[0];
        obj[key] = typeValue;
      }
      return obj;
    });

    console.log(`Found ${projects.length} items in old table\n`);
    return projects;
  } catch (error) {
    console.error('Error scanning old table:', error.message);
    console.error('\nMake sure:');
    console.error('1. AWS CLI is installed and configured');
    console.error('2. You have credentials with DynamoDB read access');
    console.error('3. The table name and region are correct\n');
    process.exit(1);
  }
}

/**
 * Create a project via AppSync mutation
 */
async function createProjectViaAppSync(projectName) {
  try {
    const response = await fetch(config.appsyncEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.appsyncApiKey,
      },
      body: JSON.stringify({
        query: CREATE_PROJECT_MUTATION,
        variables: {
          input: {
            id: generateUUID(),
            project_name: projectName.trim(),
          },
        },
      }),
    });

    const payload = await response.json();
    
    if (payload.errors?.length) {
      // Check if it's a duplicate key error - if so, it's okay
      const isDuplicate = payload.errors[0]?.message?.includes('DuplicateItem') || 
                         payload.errors[0]?.message?.includes('violates unique');
      if (isDuplicate) {
        console.log(`⊘ Project already exists: ${projectName}`);
        return true; // Don't count as failure
      }
      console.error(`✗ Failed to create project "${projectName}": ${payload.errors[0]?.message}`);
      return false;
    }

    if (!payload.data?.createProject) {
      console.error(`✗ Failed to create project "${projectName}": No data returned`);
      return false;
    }

    console.log(`✓ Created project: ${projectName}`);
    return true;
  } catch (error) {
    console.error(`✗ Error creating project "${projectName}":`, error.message);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     Project Migration Tool              ║');
  console.log('║ Old DynamoDB → New AppSync Project Table║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // Step 1: Scan old table
    const oldProjects = await scanOldProjectTable();

    if (oldProjects.length === 0) {
      console.log('No projects found in old table.');
      return;
    }

    // Step 2: Extract unique project names
    const uniqueProjectNames = Array.from(
      new Set(
        oldProjects
          .map((p) => p.project_name?.trim?.() || p.projectName?.trim?.())
          .filter((name) => Boolean(name))
      )
    );

    if (uniqueProjectNames.length === 0) {
      console.log('No project names found in records.');
      return;
    }

    console.log(`Found ${uniqueProjectNames.length} unique project names:\n`);
    uniqueProjectNames.forEach((name) => console.log(`  • ${name}`));

    // Step 3: Create projects via AppSync
    console.log('\nCreating projects via AppSync...\n');
    
    let successCount = 0;
    let failureCount = 0;

    for (const projectName of uniqueProjectNames) {
      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      const success = await createProjectViaAppSync(projectName);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         Migration Summary               ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`Total projects processed: ${uniqueProjectNames.length}`);
    console.log(`✓ Successfully created: ${successCount}`);
    console.log(`✗ Failed: ${failureCount}\n`);

    if (failureCount === 0) {
      console.log('Migration completed successfully! 🎉\n');
    } else {
      console.log('Migration completed with some errors.\n');
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate();
