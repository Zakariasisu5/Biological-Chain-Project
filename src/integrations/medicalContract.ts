import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/contracts/MedicalRecords';

async function getProviderAndSigner() {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No injected wallet found');
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getContract(signerOrProvider?: any) {
  if (!signerOrProvider) {
    const { signer } = await getProviderAndSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function addRecordOnChain(patientAddress: string, cid: string, fileType = 'any', meta = '') {
  const { signer } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.addRecord(patientAddress, cid, fileType, meta);
  await tx.wait();
  return tx;
}

export async function grantAccessOnChain(providerAddress: string) {
  const { signer } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.grantAccess(providerAddress);
  await tx.wait();
  return tx;
}

export async function revokeAccessOnChain(providerAddress: string) {
  const { signer } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.revokeAccess(providerAddress);
  await tx.wait();
  return tx;
}

export async function fetchRecords(patientAddress: string) {
  const { provider } = await getProviderAndSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const countBN = await contract.getRecordCount(patientAddress);
  const count = Number(countBN);
  const out: Array<{ cid: string; fileType: string; meta: string; timestamp: number; addedBy: string }> = [];
  for (let i = 0; i < count; i++) {
    const rec = await contract.getRecord(patientAddress, i);
    out.push({
      cid: rec[0],
      fileType: rec[1],
      meta: rec[2],
      timestamp: Number(rec[3]),
      addedBy: rec[4]
    });
  }
  return out;
}