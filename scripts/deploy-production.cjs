const { ethers } = require("hardhat");

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log(`🚀 Deploying to ${network.name} (Chain ID: ${network.chainId})...`);

  // Get the contract factory
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");

  // Deploy the contract
  console.log("📦 Deploying contract...");
  const medicalRecords = await MedicalRecords.deploy();

  // Wait for deployment to finish
  console.log("⏳ Waiting for deployment confirmation...");
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

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    owner,
    network: network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    deploymentTx: deploymentTx?.hash
  };

  const fs = require('fs');
  const deploymentFile = `deployment-${network.name}-${Date.now()}.json`;
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to ${deploymentFile}`);

  // Update environment variables based on network
  let envContent = '';
  if (network.chainId === 11155111n) { // Sepolia
    envContent = `# Sepolia Contract Address
REACT_APP_CONTRACT_ADDRESS_SEPOLIA=${contractAddress}
REACT_APP_NETWORK_NAME=sepolia
REACT_APP_CHAIN_ID=11155111
`;
  } else if (network.chainId === 1n) { // Mainnet
    envContent = `# Mainnet Contract Address
REACT_APP_CONTRACT_ADDRESS_MAINNET=${contractAddress}
REACT_APP_NETWORK_NAME=mainnet
REACT_APP_CHAIN_ID=1
`;
  }

  if (envContent) {
    try {
      fs.writeFileSync('.env.production', envContent);
      console.log("💾 Contract address saved to .env.production");
    } catch (error) {
      console.log("⚠️ Could not save to .env.production:", error.message);
    }
  }

  console.log("\n🎉 Production deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("1. Verify the contract on Etherscan (if supported)");
  console.log("2. Update your frontend environment variables");
  console.log("3. Test the contract functionality");
  console.log("4. Deploy your frontend to production");
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log("\n✅ Production deployment successful!");
    console.log("Contract Address:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Production deployment failed:", error);
    process.exit(1);
  });
