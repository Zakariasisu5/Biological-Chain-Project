const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS environment variable");
    process.exit(1);
  }

  console.log("Verifying contract at:", contractAddress);

  try {
    // Get the contract
    const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
    const contract = MedicalRecords.attach(contractAddress);

    // Test basic functionality
    console.log("Testing contract functionality...");

    // Get contract owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);

    // Get stats
    const stats = await contract.getStats();
    console.log("Total records:", stats[0].toString());
    console.log("Total patients:", stats[1].toString());

    // Test record hash verification (should return false for non-existent hash)
    const testHash = "test-hash-123";
    const hashExists = await contract.verifyRecordHash(testHash);
    console.log("Test hash exists:", hashExists);

    console.log("✅ Contract verification successful!");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    process.exit(1);
  }
}

main();
