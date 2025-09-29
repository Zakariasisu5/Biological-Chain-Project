@echo off
echo 🚀 BioLogic Chain - Deploy and Test Script
echo.

echo 📦 Deploying contract to localhost...
npx hardhat run scripts/quick-deploy.cjs --network localhost

if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo ✅ Contract deployed successfully!
echo.
echo 📋 Next steps:
echo 1. Make sure MetaMask is configured for localhost:8545 (Chain ID: 31337)
echo 2. Import test account with private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo 3. Refresh your browser and test wallet connection
echo.
echo 🌐 Your app is running at: http://localhost:3000
echo.
pause
