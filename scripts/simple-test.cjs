const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Simple Blockchain Test...");

  // Get the contract
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
  const contract = MedicalRecords.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  // Get test accounts
  const [owner, patient1] = await ethers.getSigners();

  console.log("👤 Test accounts:");
  console.log("Owner:", owner.address);
  console.log("Patient 1:", patient1.address);

  try {
    // Test 1: Get contract stats
    console.log("\n📝 Test 1: Getting contract stats...");
    const stats = await contract.getStats();
    console.log("Total records:", stats[0].toString());
    console.log("Total patients:", stats[1].toString());

    // Test 2: Register patient
    console.log("\n📝 Test 2: Registering patient...");
    await contract.connect(patient1).registerPatient();
    console.log("✅ Patient registered successfully");

    // Test 3: Get updated stats
    console.log("\n📝 Test 3: Getting updated stats...");
    const updatedStats = await contract.getStats();
    console.log("Total records:", updatedStats[0].toString());
    console.log("Total patients:", updatedStats[1].toString());

    // Test 4: Add a record
    console.log("\n📝 Test 4: Adding a record...");
    const recordHash = ethers.keccak256(ethers.toUtf8Bytes("test-record-" + Date.now()));
    await contract.connect(patient1).addRecord(
      patient1.address,
      "QmTest...",
      "text",
      "Test record",
      recordHash
    );
    console.log("✅ Record added successfully");

    // Test 5: Get record count
    console.log("\n📝 Test 5: Getting record count...");
    const recordCount = await contract.getRecordCount(patient1.address);
    console.log("Record count:", recordCount.toString());

    // Test 6: Get all records
    console.log("\n📝 Test 6: Getting all records...");
    const records = await contract.connect(patient1).getAllRecords(patient1.address);
    console.log("Records retrieved:", records[0].length);

    // Test 7: Verify record hash
    console.log("\n📝 Test 7: Verifying record hash...");
    const hashExists = await contract.verifyRecordHash(recordHash);
    console.log("Record hash exists:", hashExists);

    console.log("\n🎉 All simple tests passed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Simple blockchain test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
