#!/usr/bin/env pwsh
# Alfamart Food Kiosk Cleanup Script
# This script removes unnecessary files and directories for a simplified kiosk app

$projectRoot = "C:\Users\Macko\Documents\SaleorProj\storefront"
cd $projectRoot

Write-Host "Alfamart Food Kiosk Cleanup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Paths to delete
$pathsToDelete = @(
    "src\app\[channel]\(main)\login",
    "src\app\[channel]\(main)\orders",
    "src\ui\components\LoginForm.tsx",
    "src\ui\components\OrderListItem.tsx"
)

foreach ($path in $pathsToDelete) {
    $fullPath = Join-Path $projectRoot $path
    if (Test-Path $fullPath) {
        Write-Host "Deleting: $path" -ForegroundColor Yellow
        try {
            Remove-Item -Recurse -Force $fullPath -ErrorAction Stop
            Write-Host "Deleted successfully" -ForegroundColor Green
        } catch {
            Write-Host "Failed to delete: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Already deleted or not found: $path" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Remaining optional cleanup:" -ForegroundColor Cyan
Write-Host "  - Review src/checkout/sections for unused auth components"
Write-Host "  - Clean up unused GraphQL queries if needed"
Write-Host "  - Remove ChannelSelect and DraftModeNotification if not used"
Write-Host ""
Write-Host "Ready to run: pnpm run dev" -ForegroundColor Green
