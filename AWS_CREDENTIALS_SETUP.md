# AWS Credentials Setup Guide

## Option 1: Use the Web-Based Tool (Easiest)

No AWS credentials needed! Open this in your browser:
```
http://localhost:3000/project-migration-tool.html
(or file:///d:/Barton%20Malow/Field%20App/public/project-migration-tool.html)
```

This web tool queries the old DynamoDB table directly and creates projects in AppSync.

---

## Option 2: Configure AWS CLI (For Backend API)

The backend `/api/v1/projects` endpoint needs AWS credentials to scan the legacy table.

### Windows Setup

#### Method A: AWS CLI Configuration (Recommended)

1. **Install AWS CLI:**
   ```powershell
   # Download from https://aws.amazon.com/cli/
   # Or use Chocolatey:
   choco install awscli
   ```

2. **Configure credentials:**
   ```powershell
   aws configure
   ```
   When prompted, enter:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-west-2`
   - Default output format: `json`

3. **Verify setup:**
   ```powershell
   aws sts get-caller-identity
   ```

4. **Restart your backend:**
   ```powershell
   # Kill the current backend process
   # Run: npm run dev again
   ```

#### Method B: Environment Variables

Set temporary environment variables in PowerShell:

```powershell
$env:AWS_ACCESS_KEY_ID = "your-access-key"
$env:AWS_SECRET_ACCESS_KEY = "your-secret-key"
$env:AWS_REGION = "us-west-2"

# Then start backend:
cd 'D:\Barton Malow\Field App\backend'
npm run dev
```

Or create a `.env` file in the backend directory:
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
```

#### Method C: Named AWS Profile

If you have multiple AWS accounts configured:

1. **Configure profile in `~/.aws/config`:**
   ```
   [profile barton-malow]
   region = us-west-2
   ```

2. **Use profile in backend:**
   ```powershell
   $env:AWS_PROFILE = "barton-malow"
   npm run dev
   ```

---

## Testing After Setup

### Test 1: Verify Credentials
```powershell
aws sts get-caller-identity
```

Should show your AWS Account ID and user ARN.

### Test 2: Test Backend Endpoint
```powershell
Invoke-WebRequest -Uri 'http://localhost:5000/api/v1/projects' `
  -Headers @{'Content-Type'='application/json'} | `
  Select-Object -ExpandProperty Content | ConvertFrom-Json | Format-List
```

Expected response:
```json
{
  "success": true,
  "data": ["Project Alpha", "Project Beta", ...],
  "count": 15
}
```

### Test 3: Check Frontend
Open the app and go to "Create Daily Report" → "Project site" dropdown should show project names.

---

## Troubleshooting

### "Could not load credentials from any providers"
- AWS credentials are not configured
- Solutions:
  1. Run `aws configure`
  2. Use environment variables
  3. Use the web tool instead (no credentials needed)

### "Access Denied" Error
- Your AWS credentials don't have DynamoDB read permissions
- Ask your AWS administrator to grant:
  - `dynamodb:Scan` on `arn:aws:dynamodb:us-west-2:*:table/Project-*`
  - Or use the web tool (it uses AppSync API key instead)

### "Table not found"
- Table name or region is wrong
- Check: `aws dynamodb list-tables --region us-west-2`

### Region Mismatch
- Default region might be different
- Set explicitly: `$env:AWS_REGION = "us-west-2"`

---

## Quick Start Commands

### PowerShell (Windows)
```powershell
# 1. Configure AWS
aws configure

# 2. Verify
aws sts get-caller-identity

# 3. Start backend
cd 'D:\Barton Malow\Field App\backend'
npm run dev

# 4. In another PowerShell window, test:
Invoke-WebRequest -Uri 'http://localhost:5000/api/v1/projects' -Method Get |
  Select-Object -ExpandProperty Content
```

### Or Just Use the Web Tool
```
Open: file:///d:/Barton%20Malow/Field%20App/public/project-migration-tool.html
```

---

## More Information

- [AWS CLI Setup Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS Credentials Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [DynamoDB Permissions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/using-identity-based-policies.html)
