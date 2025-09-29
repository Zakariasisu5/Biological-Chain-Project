const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MedicalRecords contract...");

  // Get the contract factory
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");

  // Deploy the contract
  const medicalRecords = await MedicalRecords.deploy();

  // Wait for deployment to finish
  await medicalRecords.waitForDeployment();

  const contractAddress = await medicalRecords.getAddress();
  console.log("MedicalRecords deployed to:", contractAddress);

  // Get contract owner
  const owner = await medicalRecords.owner();
  console.log("Contract owner:", owner);

  // Get deployment transaction details
  const deploymentTx = medicalRecords.deploymentTransaction();
  if (deploymentTx) {
    console.log("Deployment transaction hash:", deploymentTx.hash);
    console.log("Gas used:", deploymentTx.gasLimit?.toString());
  }

  // Verify contract is working
  try {
    const stats = await medicalRecords.getStats();
    console.log("Contract stats - Total Records:", stats[0].toString(), "Total Patients:", stats[1].toString());
  } catch (error) {
    console.log("Error getting contract stats:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    owner,
    network: await ethers.provider.getNetwork(),
    timestamp: new Date().toISOString(),
    deploymentTx: deploymentTx?.hash
  };

  console.log("\nDeployment completed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", deploymentInfo.network.name, "Chain ID:", deploymentInfo.network.chainId);
  
  return contractAddress;
}

main()
  .then((contractAddress) => {
    console.log("\n✅ Deployment successful!");
    console.log("Contract Address:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
