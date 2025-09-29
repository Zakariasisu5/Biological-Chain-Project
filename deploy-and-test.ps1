Write-Host "🚀 BioLogic Chain - Deploy and Test Script" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Deploying contract to localhost..." -ForegroundColor Yellow
npx hardhat run scripts/quick-deploy.cjs --network localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure MetaMask is configured for localhost:8545 (Chain ID: 31337)" -ForegroundColor White
Write-Host "2. Import test account with private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
Write-Host "3. Refresh your browser and test wallet connection" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your app is running at: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Read-Host "Press Enter to continue"
