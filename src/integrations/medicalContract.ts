import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/contracts/MedicalRecords';

async function getProviderAndSigner({ promptIfNeeded = true } = {}) {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No injected wallet found');
  }

  const raw = (window as any).ethereum;
  const provider = new ethers.BrowserProvider(raw);

  try {
    // Try silent accounts retrieval first to avoid a permission prompt during app init
    const accounts: string[] = (await provider.send('eth_accounts', [])) as string[];
    if (accounts && accounts.length > 0) {
      const signer = await provider.getSigner();
      return { provider, signer };
    }
  } catch (e) {
    // ignore and fall back to explicit request below
  }

  // If no accounts were available and prompting is allowed, request accounts interactively
  if (promptIfNeeded) {
    try {
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      return { provider, signer };
    } catch (err: any) {
      // Provide a clearer, actionable error message instead of raw RPC error objects
      const msg = String(err?.message || err || 'Failed to request accounts');
      if (msg.includes('User rejected') || err?.code === 4001) {
        throw new Error('Connection request rejected by user');
      }
      // Generic fallback
      throw new Error(`Failed to access accounts from injected wallet: ${msg}`);
    }
  }

  throw new Error('No authorized accounts found. Call a connect action to prompt the user to connect their wallet.');
}

export async function getContract(signerOrProvider?: any) {
  if (!signerOrProvider) {
    // default to non-prompting behavior; callers that need an interactive connect can call
    // getProviderAndSigner({ promptIfNeeded: true }) explicitly
    const { signer } = await getProviderAndSigner({ promptIfNeeded: false });
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function addRecordOnChain(patientAddress: string, cid: string, fileType = 'any', meta = '') {
  // This action requires an explicit user prompt if not already connected.
  const { signer } = await getProviderAndSigner({ promptIfNeeded: true });
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const recordHash = ethers.keccak256(ethers.toUtf8Bytes(`${patientAddress}-${cid}-${Date.now()}`));
  const tx = await contract.addRecord(patientAddress, cid, fileType, meta, recordHash);
  await tx.wait();
  return tx;
}

export async function grantAccessOnChain(providerAddress: string) {
  const { signer } = await getProviderAndSigner({ promptIfNeeded: true });
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.grantAccess(providerAddress);
  await tx.wait();
  return tx;
}

export async function revokeAccessOnChain(providerAddress: string) {
  const { signer } = await getProviderAndSigner({ promptIfNeeded: true });
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.revokeAccess(providerAddress);
  await tx.wait();
  return tx;
}

export async function fetchRecords(patientAddress: string) {
  const { provider } = await getProviderAndSigner();

  // Quick sanity: ensure there's code at the contract address
  try {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (!code || code === '0x') {
      // No contract deployed at address: return empty list instead of failing to decode
      console.warn(`No contract code found at ${CONTRACT_ADDRESS}`);
      return [];
    }
  } catch (e) {
    console.warn('getCode failed', e);
  }

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  let countBN: any;
  try {
    countBN = await contract.getRecordCount(patientAddress);
  } catch (err: any) {
    // BAD_DATA typically means the call returned empty (no contract / wrong chain)
    const msg = err?.message || String(err);
    throw new Error(`Failed to read record count: ${msg}`);
  }
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