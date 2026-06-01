#!/usr/bin/env node
/**
 * Migrate Project records from source to destination DynamoDB table
 * Run: node migrate-projects-table.mjs
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const sourceTable = 'Project-c37hpkplf5d5jnfqgermgnww5a-stgdev';
const destTable = 'Project-dhqciqywsnh2bmawgarpjbhwhi-ptpreplace';
const region = 'us-west-2';
const batchSize = 25;

const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

async function migrateProjects() {
  console.log(`[${new Date().toISOString().split('T')[1]}] Starting Project table migration...`);
  console.log(`  Source: ${sourceTable}`);
  console.log(`  Destination: ${destTable}`);
  console.log(`  Region: ${region}\n`);

  try {
    // Step 1: Scan source table
    console.log(`[${new Date().toISOString().split('T')[1]}] Scanning source table...`);
    const allItems = [];
    let lastEvaluatedKey = undefined;
    let scanCount = 0;

    do {
      const response = await docClient.send(
        new ScanCommand({
          TableName: sourceTable,
          Limit: 100,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      allItems.push(...(response.Items || []));
      scanCount += response.Items?.length || 0;

      console.log(`  Scanned: ${scanCount} records...`);
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    console.log(`✓ Scanned ${scanCount} total records\n`);

    if (allItems.length === 0) {
      console.error('✗ No items found in source table!');
      process.exit(1);
    }

    // Step 2: Write to destination table in batches
    console.log(
      `[${new Date().toISOString().split('T')[1]}] Writing ${allItems.length} records to destination table...`
    );

    let written = 0;
    for (let i = 0; i < allItems.length; i += batchSize) {
      const batch = allItems.slice(i, Math.min(i + batchSize, allItems.length));

      const requests = batch.map((item) => ({
        PutRequest: {
          Item: item,
        },
      }));

      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [destTable]: requests,
          },
        })
      );

      written += batch.length;
      console.log(`  Written: ${written} / ${allItems.length} records...`);
    }

    console.log(`✓ All ${written} records written\n`);

    // Step 3: Verify
    console.log(`[${new Date().toISOString().split('T')[1]}] Verifying destination table...`);
    const verifyResponse = await docClient.send(
      new ScanCommand({
        TableName: destTable,
        Select: 'COUNT',
      })
    );

    const destCount = verifyResponse.Count || 0;
    console.log(`✓ Destination table contains ${destCount} records\n`);

    if (destCount !== allItems.length) {
      console.error(
        `✗ Record count mismatch! Source: ${allItems.length}, Destination: ${destCount}`
      );
      process.exit(1);
    }

    console.log('====================================');
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('====================================\n');
    console.log('Next steps:');
    console.log(`1. All ${destCount} Project records copied to: ${destTable}`);
    console.log('2. Update frontend projectDataStore.service.ts to use new table if needed');
    console.log('3. Restart the app and test the project dropdown');
    process.exit(0);
  } catch (error) {
    console.error(`✗ Migration failed:`, error.message);
    process.exit(1);
  }
}

migrateProjects();
