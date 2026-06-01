param(
    [string]$sourceTable = "Project-c37hpkplf5d5jnfqgermgnww5a-stgdev",
    [string]$destTable = "Project-dhqciqywsnh2bmawgarpjbhwhi-ptpreplace",
    [string]$region = "us-west-2",
    [int]$batchSize = 25
)

try {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting Project table migration..." -ForegroundColor Cyan
    Write-Host "  Source: $sourceTable" -ForegroundColor Gray
    Write-Host "  Destination: $destTable" -ForegroundColor Gray
    Write-Host "  Region: $region" -ForegroundColor Gray
    Write-Host ""

    # Step 1: Verify both tables exist
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Verifying tables exist..." -ForegroundColor Cyan
    $tables = aws dynamodb list-tables --region $region --query 'TableNames' --output json | ConvertFrom-Json
    
    if ($sourceTable -notin $tables) {
        throw "Source table '$sourceTable' not found!"
    }
    if ($destTable -notin $tables) {
        throw "Destination table '$destTable' not found!"
    }
    Write-Host "[OK] Both tables verified" -ForegroundColor Green
    Write-Host ""

    # Step 2: Scan source table
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Scanning source table for Project records..." -ForegroundColor Cyan
    $allItems = @()
    $lastEvaluatedKey = $null
    $scanCount = 0

    do {
        $response = aws dynamodb scan --table-name $sourceTable `
            --region $region `
            --limit 100 `
            --output json | ConvertFrom-Json

        $items = $response.Items
        $allItems += $items
        $scanCount += $items.Count

        Write-Host "  Scanned: $scanCount records..." -ForegroundColor Gray

        $lastEvaluatedKey = $response.LastEvaluatedKey
    } while ($lastEvaluatedKey)

    Write-Host "[OK] Scanned $scanCount total records from source table" -ForegroundColor Green
    Write-Host ""

    if ($allItems.Count -eq 0) {
        Write-Host "[ERROR] No items found in source table!" -ForegroundColor Red
        exit 1
    }

    # Step 3: Write to destination table in batches
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Writing $($allItems.Count) records to destination table in batches of $batchSize..." -ForegroundColor Cyan
    $written = 0

    for ($i = 0; $i -lt $allItems.Count; $i += $batchSize) {
        $batch = $allItems[$i..([Math]::Min($i + $batchSize - 1, $allItems.Count - 1))]
        
        # Build batch write request
        $requests = @()
        foreach ($item in $batch) {
            $requests += @{
                PutRequest = @{
                    Item = $item
                }
            }
        }

        $batchWriteParams = @{
            RequestItems = @{
                $destTable = $requests
            }
        } | ConvertTo-Json -Depth 10

        # Execute batch write
        $tempFile = [System.IO.Path]::GetTempFileName()
        $batchWriteParams | Set-Content -Path $tempFile -Encoding UTF8

        try {
            aws dynamodb batch-write-item `
                --cli-input-json file://$tempFile `
                --region $region `
                --output json | Out-Null

            $written += $batch.Count
            Write-Host "  Written: $written / $($allItems.Count) records..." -ForegroundColor Gray
        }
        finally {
            Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "[OK] All $written records written to destination table" -ForegroundColor Green
    Write-Host ""

    # Step 4: Verify copy
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Verifying destination table..." -ForegroundColor Cyan
    $destCount = aws dynamodb scan --table-name $destTable `
        --region $region `
        --select 'COUNT' `
        --output json | ConvertFrom-Json | Select-Object -ExpandProperty Count

    Write-Host "[OK] Destination table now contains $destCount records" -ForegroundColor Green
    Write-Host ""

    if ($destCount -ne $allItems.Count) {
        Write-Host "[ERROR] Record count mismatch! Source: $($allItems.Count), Destination: $destCount" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update AppSync resolver to use: $destTable"
    Write-Host "2. Restart the app and test the project dropdown"

} catch {
    Write-Host "[ERROR] Migration failed: $_" -ForegroundColor Red
    exit 1
}
