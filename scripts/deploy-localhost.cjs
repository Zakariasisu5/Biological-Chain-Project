const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying to localhost...");

  // Get the contract factory
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");

  // Deploy the contract
  const medicalRecords = await MedicalRecords.deploy();

  // Wait for deployment to finish
  await medicalRecords.waitForDeployment();

  const contractAddress = await medicalRecords.getAddress();
  console.log("✅ MedicalRecords deployed to:", contractAddress);

  // Get contract owner
  const owner = await medicalRecords.owner();
  console.log("👤 Contract owner:", owner);

  // Get deployment transaction details
  const deploymentTx = medicalRecords.deploymentTransaction();
  if (deploymentTx) {
    console.log("📝 Deployment transaction hash:", deploymentTx.hash);
    console.log("⛽ Gas used:", deploymentTx.gasLimit?.toString());
  }

  // Test contract functionality
  try {
    const stats = await medicalRecords.getStats();
    console.log("📊 Contract stats - Total Records:", stats[0].toString(), "Total Patients:", stats[1].toString());
  } catch (error) {
    console.log("⚠️ Error getting contract stats:", error.message);
  }

  // Save deployment info to .env.local
  const fs = require('fs');
  const envContent = `# Localhost Contract Address
REACT_APP_CONTRACT_ADDRESS_LOCALHOST=${contractAddress}
REACT_APP_NETWORK_NAME=localhost
REACT_APP_CHAIN_ID=31337
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log("💾 Contract address saved to .env.local");
  } catch (error) {
    console.log("⚠️ Could not save to .env.local:", error.message);
  }

  console.log("\n🎉 Localhost deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("1. Start your React app: npm run dev");
  console.log("2. Make sure MetaMask is connected to localhost:8545");
  console.log("3. Import the Hardhat account with private key from hardhat.config.cjs");
  console.log("4. The contract address has been saved to .env.local");
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log("\n✅ Localhost deployment successful!");
    console.log("Contract Address:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Localhost deployment failed:", error);
    process.exit(1);
  });
