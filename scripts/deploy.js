import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
  const medical = await MedicalRecords.deploy();
  await medical.waitForDeployment();

  console.log("✅ MedicalRecords deployed to:", await medical.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
