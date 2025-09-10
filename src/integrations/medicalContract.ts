// ...new file...
import { ethers } from 'ethers';

// TODO: replace with deployed address after running Hardhat deploy
export const CONTRACT_ADDRESS = "0xREPLACE_WITH_DEPLOYED_ADDRESS";

// Minimal ABI for functions we need
export const MEDICAL_ABI = [
  "function addRecord(address patient, string cid, string fileType, string meta) external",
  "function grantAccess(address provider) external",
  "function revokeAccess(address provider) external",
  "function getRecordCount(address patient) external view returns (uint256)",
  "function getRecord(address patient, uint256 index) external view returns (string cid, string fileType, string meta, uint256 timestamp, address addedBy)",
  "function hasAccess(address patient, address provider) external view returns (bool)",
  "event RecordAdded(address indexed patient, uint256 indexed index, string cid, address indexed addedBy)"
];

async function getProviderAndSigner() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No injected wallet found");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getContract(signerOrProvider?: any) {
  if (!signerOrProvider) {
    const { signer } = await getProviderAndSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_ABI, signerOrProvider);
}

export async function addRecordOnChain(patientAddress: string, cid: string, fileType = "any", meta = "") {
  const { signer } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_ABI, signer);
  const tx = await contract.addRecord(patientAddress, cid, fileType, meta);
  await tx.wait();
  return tx;
}

export async function grantAccessOnChain(providerAddress: string) {
  const { signer } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_ABI, signer);
  const tx = await contract.grantAccess(providerAddress);
  await tx.wait();
  return tx;
}

export async function revokeAccessOnChain(providerAddress: string) {
  const { signer } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_ABI, signer);
  const tx = await contract.revokeAccess(providerAddress);
  await tx.wait();
  return tx;
}

export async function fetchRecords(patientAddress: string) {
  const { provider } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDICAL_ABI, provider);
  const countBN = await contract.getRecordCount(patientAddress);
  const count = Number(countBN);
  const out = [];
  for (let i = 0; i < count; i++) {
    const rec = await contract.getRecord(patientAddress, i);
    out.push({
      cid: rec.cid,
      fileType: rec.fileType,
      meta: rec.meta,
      timestamp: Number(rec.timestamp),
      addedBy: rec.addedBy
    });
  }
  return out;
}
// ...new file...