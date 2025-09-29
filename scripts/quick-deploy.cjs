const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Quick Deploy to Localhost...");

  // Get the contract factory
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");

  // Deploy the contract
  const medicalRecords = await MedicalRecords.deploy();

  // Wait for deployment to finish
  await medicalRecords.waitForDeployment();

  const contractAddress = await medicalRecords.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);

  // Update .env.local
  const fs = require('fs');
  const envContent = `# Localhost Contract Address
REACT_APP_CONTRACT_ADDRESS_LOCALHOST=${contractAddress}
REACT_APP_NETWORK_NAME=localhost
REACT_APP_CHAIN_ID=31337
`;

  fs.writeFileSync('.env.local', envContent);
  console.log("💾 Contract address saved to .env.local");
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log("✅ Deployment successful!");
    console.log("Contract Address:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
