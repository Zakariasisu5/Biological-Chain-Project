//import { ethers } from "hardhat";

async function main() {
  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
  const medical = await MedicalRecords.deploy();
  await medical.deployed();
  console.log("MedicalRecords deployed to:", medical.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});