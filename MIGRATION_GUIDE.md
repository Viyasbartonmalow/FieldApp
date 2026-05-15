# Project Data Migration Guide

This guide explains how to populate the new AppSync `Project` table with data from your existing DynamoDB table.

## Overview

The Field App uses a new AppSync-managed `Project` table (created during the latest Amplify deployment). You can migrate your existing project data from the old DynamoDB table to this new table.

**Old Table:** `Project-c37hpkplf5d5jnfqgermgnww5a-stgdev`  
**New Table:** `Project` (AppSync-managed, in DynamoDB)

## Prerequisites

1. **Node.js 18+** (with native fetch support)
2. **AWS CLI** installed and configured
   - Install: https://aws.amazon.com/cli/
   - Configure: `aws configure` with credentials that have DynamoDB access

3. **Verify AWS credentials:**
   ```bash
   aws sts get-caller-identity
   ```

## Option 1: Automated Migration (Recommended)

Run the migration script from the project root:

```bash
# From project root directory
node scripts/migrate-projects.mjs
```

This script will:
1. Scan the old DynamoDB table (`Project-c37hpkplf5d5jnfqgermgnww5a-stgdev`)
2. Extract all unique `project_name` values
3. Create corresponding Project records in the new AppSync table
4. Show a summary of created vs. failed records

**Output Example:**
```
╔════════════════════════════════════════╗
║     Project Migration Tool              ║
║ Old DynamoDB → New AppSync Project Table║
╚════════════════════════════════════════╝

Scanning old DynamoDB table: Project-c37hpkplf5d5jnfqgermgnww5a-stgdev...

Found 42 items in old table

Found 15 unique project names:

  • Project Alpha
  • Project Beta
  • Main Office Complex
  • ...

Creating projects via AppSync...

✓ Created project: Project Alpha
✓ Created project: Project Beta
⊘ Project already exists: Main Office Complex
...

╔════════════════════════════════════════╗
║         Migration Summary               ║
╚════════════════════════════════════════╝
Total projects processed: 15
✓ Successfully created: 14
✗ Failed: 1

Migration completed successfully! 🎉
```

## Option 2: Manual Project Addition

If you prefer to add projects manually:

1. **Via AppSync Console:**
   - Go to AWS AppSync in the AWS Console
  - Find your GraphQL endpoint: `vcmd32juabdkplgtfaleds5bke`
   - Use Queries section with this mutation:

   ```graphql
   mutation CreateProject {
     createProject(input: { 
       id: "unique-id-here"
       project_name: "Your Project Name"
     }) {
       id
       project_name
       createdAt
       updatedAt
     }
   }
   ```

2. **Via Frontend:**
   - Navigate to "Create Daily Report"
   - Type a project name in the "Project site" field
   - Create a report
   - The project name will be saved and appear in future dropdowns

## Troubleshooting

### Issue: "AWS CLI not found"
**Solution:** Install AWS CLI
```bash
# macOS with Homebrew
brew install awscli

# Windows with Chocolatey
choco install awscli

# Or download from https://aws.amazon.com/cli/
```

### Issue: "Unable to access table" or credentials error
**Solution:** Verify AWS credentials
```bash
aws sts get-caller-identity

# If not configured, run:
aws configure
```
Enter your AWS Access Key ID and Secret Access Key when prompted.

### Issue: "Table not found"
**Solution:** Verify table name and region
```bash
# List tables in us-west-2
aws dynamodb list-tables --region us-west-2
```

### Issue: No projects created, but no errors
**Solution:** The old table might be empty. Check manually:
```bash
aws dynamodb scan --table-name Project-c37hpkplf5d5jnfqgermgnww5a-stgdev --region us-west-2
```

## After Migration

Once projects are created:

1. **Verify in AppSync:**
   - Go to AWS Console → AppSync
   - Run this query in the GraphQL explorer:
   ```graphql
   query ListProjects {
     listProjects(limit: 100) {
       items {
         id
         project_name
       }
     }
   }
   ```

2. **Test in Frontend:**
   - Open "Create Daily Report" modal
   - Click "Project site" dropdown
   - You should see migrated project names listed

3. **Filter by Project:**
   - Go to Daily Reports list
   - Use "Project site" filter dropdown
   - Filter reports by project name

## Architecture Notes

**Why migrate?**
- Old table: Direct DynamoDB Scan (requires backend IAM credentials)
- New approach: AppSync GraphQL API (secure, managed, no IAM needed)

**What happens:**
- Projects in new `Project` table are queried via AppSync `listProjects` mutation
- Frontend uses `projectAppsyncService.listProjectNames()` to fetch dropdown options
- No direct DynamoDB access needed from backend

**If you add new projects:**
- Add via "Create Daily Report" form, or
- Use AppSync mutations directly, or
- Run the migration script again to sync additional projects

## File Locations

- **Migration Script:** `scripts/migrate-projects.mjs`
- **Frontend Service:** `frontend/src/services/projectAppsync.service.ts`
- **GraphQL Schema:** `amplify/backend/api/fieldapp/schema.graphql`
- **Daily Reports Component:** `frontend/src/features/dailyReports/components/DailyReportsList.tsx`

## Support

If you encounter issues:
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify table exists: `aws dynamodb list-tables --region us-west-2`
3. Check AppSync endpoint is correct in script
4. Review frontend browser console for errors (DevTools → Console)
