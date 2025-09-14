// scripts/interact.js
const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7";

  // Get contract factory
  const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
  const medical = MedicalRecords.attach(CONTRACT_ADDRESS);

  console.log("✅ Connected to MedicalRecords at:", CONTRACT_ADDRESS);

  // Example: Add a record
  console.log("\n📌 Adding a record...");
  const tx = await medical.addRecord("Patient123", "Flu diagnosis", "2025-09-12");
  await tx.wait();
  console.log("✅ Record added successfully!");

  // Example: Get all records for Patient123
  console.log("\n📌 Fetching records for Patient123...");
  const records = await medical.getRecords("Patient123");
  console.log("📝 Records:", records);
}

// Run main()
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
