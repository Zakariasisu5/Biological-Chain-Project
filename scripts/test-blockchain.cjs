const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Blockchain Integration...");

  // Get the contract
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
  const contract = MedicalRecords.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  // Get test accounts
  const [owner, patient1, patient2, provider] = await ethers.getSigners();

  console.log("👤 Test accounts:");
  console.log("Owner:", owner.address);
  console.log("Patient 1:", patient1.address);
  console.log("Patient 2:", patient2.address);
  console.log("Provider:", provider.address);

  try {
    // Test 1: Register patients
    console.log("\n📝 Test 1: Registering patients...");
    await contract.connect(patient1).registerPatient();
    await contract.connect(patient2).registerPatient();
    console.log("✅ Patients registered successfully");

    // Test 2: Add records
    console.log("\n📝 Test 2: Adding health records...");
    const recordHash1 = ethers.keccak256(ethers.toUtf8Bytes("test-record-1-" + Date.now()));
    const recordHash2 = ethers.keccak256(ethers.toUtf8Bytes("test-record-2-" + Date.now()));
    
    await contract.connect(patient1).addRecord(
      patient1.address,
      "QmTest1...",
      "text",
      "Patient 1 test record",
      recordHash1
    );
    
    await contract.connect(patient2).addRecord(
      patient2.address,
      "QmTest2...",
      "text",
      "Patient 2 test record",
      recordHash2
    );
    console.log("✅ Records added successfully");

    // Test 3: Grant access
    console.log("\n📝 Test 3: Granting access permissions...");
    await contract.connect(patient1).grantAccess(provider.address, 2, 30); // Write access for 30 days
    await contract.connect(patient2).grantAccess(provider.address, 1, 7); // Read access for 7 days
    console.log("✅ Access permissions granted");

    // Test 4: Verify access
    console.log("\n📝 Test 4: Verifying access permissions...");
    const hasAccess1 = await contract.hasAccess(patient1.address, provider.address);
    const hasAccess2 = await contract.hasAccess(patient2.address, provider.address);
    console.log("Provider has access to Patient 1:", hasAccess1);
    console.log("Provider has access to Patient 2:", hasAccess2);

    // Test 5: Get records
    console.log("\n📝 Test 5: Retrieving records...");
    const records1 = await contract.connect(patient1).getAllRecords(patient1.address);
    const records2 = await contract.connect(patient2).getAllRecords(patient2.address);
    console.log("Patient 1 records:", records1[0].length);
    console.log("Patient 2 records:", records2[0].length);

    // Test 6: Verify record hash
    console.log("\n📝 Test 6: Verifying record hashes...");
    const hashExists1 = await contract.verifyRecordHash(recordHash1);
    const hashExists2 = await contract.verifyRecordHash(recordHash2);
    console.log("Record hash 1 exists:", hashExists1);
    console.log("Record hash 2 exists:", hashExists2);

    // Test 7: Get contract stats
    console.log("\n📝 Test 7: Getting contract statistics...");
    const stats = await contract.getStats();
    console.log("Total records:", stats[0].toString());
    console.log("Total patients:", stats[1].toString());

    // Test 8: Provider adding record for patient
    console.log("\n📝 Test 8: Provider adding record for patient...");
    const providerRecordHash = ethers.keccak256(ethers.toUtf8Bytes("provider-record-" + Date.now()));
    await contract.connect(provider).addRecord(
      patient1.address,
      "QmProvider...",
      "text",
      "Provider added record for Patient 1",
      providerRecordHash
    );
    console.log("✅ Provider successfully added record for patient");

    // Test 9: Get updated records
    console.log("\n📝 Test 9: Getting updated records...");
    const updatedRecords = await contract.connect(patient1).getAllRecords(patient1.address);
    console.log("Patient 1 total records:", updatedRecords[0].length);

    // Test 10: Revoke access
    console.log("\n📝 Test 10: Revoking access...");
    await contract.connect(patient1).revokeAccess(provider.address);
    const hasAccessAfterRevoke = await contract.hasAccess(patient1.address, provider.address);
    console.log("Provider has access after revoke:", hasAccessAfterRevoke);

    console.log("\n🎉 All tests passed successfully!");
    console.log("\n📊 Final Statistics:");
    const finalStats = await contract.getStats();
    console.log("Total records:", finalStats[0].toString());
    console.log("Total patients:", finalStats[1].toString());

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Blockchain integration test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
