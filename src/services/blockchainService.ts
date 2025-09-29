import { ethers, Contract } from 'ethers';
import { CONTRACT_ABI, getContractAddress } from '@/contracts/MedicalRecords';

export interface HealthRecord {
  cid: string;
  fileType: string;
  meta: string;
  timestamp: number;
  addedBy: string;
  isVerified: boolean;
  hash: string;
}

export interface Permission {
  permissionType: number;
  expiresAt: number;
  isActive: boolean;
}

export interface ContractStats {
  totalRecords: number;
  totalPatients: number;
}

export class BlockchainService {
  private contract: Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private account: string | null = null;
  private chainId: number | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum as any);
        const network = await this.provider.getNetwork();
        this.chainId = Number(network.chainId);
      } catch (error) {
        console.warn('Failed to initialize provider:', error);
      }
    }
  }

  async connectWallet(): Promise<{ account: string; chainId: number }> {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected. Please install MetaMask to continue.');
    }

    try {
      // Check if already connected
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (accounts.length === 0) {
        // Request account access
        const newAccounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (newAccounts.length === 0) {
          throw new Error('No accounts found');
        }
        this.account = newAccounts[0];
      } else {
        this.account = accounts[0];
      }

      // Create provider and get network info
      this.provider = new ethers.BrowserProvider(window.ethereum as any);
      this.signer = await this.provider.getSigner();
      
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      console.log('Connected to network:', network.name, 'Chain ID:', this.chainId);
      console.log('Account:', this.account);

      // Initialize contract
      await this.initializeContract();

      return {
        account: this.account,
        chainId: this.chainId
      };
    } catch (error: any) {
      // Log a concise error message and keep the full object at debug level to avoid exposing raw RPC objects
      try {
        console.error('Wallet connection error:', error?.message || String(error));
        // Keep the full object available in debug logs for developers
        console.debug('Wallet connection error (details):', { code: error?.code, data: error?.data, stack: error?.stack, raw: error });
      } catch (logErr) {
        console.error('Wallet connection error (log failed):', String(error));
      }
      
      // Provide more specific error messages
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === -32603) {
        // RPC/internal error commonly due to wrong network, inaccessible local node, or RPC/relay errors.
        // Provide actionable guidance without assuming localhost in production.
        // Map known provider RPC messages to clearer guidance
        const rawMsg = String(error?.message || '');
        if (rawMsg.toLowerCase().includes('no active wallet') || rawMsg.toLowerCase().includes('no active session') || rawMsg.toLowerCase().includes('no active connector')) {
          throw new Error('No active wallet found. Ensure your wallet app/extension is open and unlocked. For WalletConnect, open your wallet app and approve the session proposal; for browser wallets, unlock and select an account.');
        }
        const desiredChainId = Number(import.meta.env.VITE_CHAIN_ID || process.env.REACT_APP_CHAIN_ID || 11155111);
        const desiredChainHex = `0x${desiredChainId.toString(16)}`;
        const chainName = desiredChainId === 31337 ? 'Localhost (Hardhat)' : desiredChainId === 11155111 ? 'Sepolia' : desiredChainId === 1 ? 'Mainnet' : `chain ${desiredChainId}`;

        // Try to programmatically switch the user's wallet to the desired chain where possible.
        try {
          if (window.ethereum && typeof window.ethereum.request === 'function') {
            await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainHex }] });
            // reinitialize provider/signer and contract now that the chain has switched
            this.provider = new ethers.BrowserProvider(window.ethereum as any);
            this.signer = await this.provider.getSigner();
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);
            await this.initializeContract();
            return {
              account: this.account!,
              chainId: this.chainId!
            };
          }
        } catch (switchErr: any) {
          // If the chain is unknown to the wallet (4902), try to add it if RPC URL is provided via env.
          try {
            if (switchErr?.code === 4902 && window.ethereum && typeof window.ethereum.request === 'function') {
              const rpcUrl = import.meta.env.VITE_RPC_URL || process.env.REACT_APP_RPC_URL || '';
              if (rpcUrl) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: desiredChainHex,
                    chainName,
                    rpcUrls: [rpcUrl]
                  }]
                });
                // After adding, try switching again
                await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: desiredChainHex }] });
                this.provider = new ethers.BrowserProvider(window.ethereum as any);
                this.signer = await this.provider.getSigner();
                const network = await this.provider.getNetwork();
                this.chainId = Number(network.chainId);
                await this.initializeContract();
                return {
                  account: this.account!,
                  chainId: this.chainId!
                };
              }
            }
          } catch (addErr) {
            // fall through to throw a helpful message below
            console.warn('Auto-add/switch failed:', addErr);
          }
        }

        // If we reach here, programmatic switching failed. Give a helpful, environment-aware message.
        const rpcHint = import.meta.env.VITE_RPC_URL || process.env.REACT_APP_RPC_URL ? ` RPC: ${import.meta.env.VITE_RPC_URL || process.env.REACT_APP_RPC_URL}` : '';
        const isLocalDefault = (import.meta.env.VITE_CHAIN_ID || process.env.REACT_APP_CHAIN_ID || '').toString().includes('31337') || (import.meta.env.VITE_RPC_URL || process.env.REACT_APP_RPC_URL || '').toString().includes('localhost');

        if (isLocalDefault) {
          // If app is configured to use a local chain but user is in production, avoid telling them to connect to localhost explicitly.
          throw new Error(`Network error. The application is configured to use ${chainName} (chainId ${desiredChainId}), which appears to be a local/test network. If you're running in production, update the application's environment variables to a public RPC and a public chain (e.g., Sepolia/Mainnet). ${rpcHint} Otherwise, switch your wallet to ${chainName}.`);
        }

        throw new Error(`Network error. Expected network: ${chainName} (chainId ${desiredChainId}). Please switch your wallet to that network.${rpcHint} If you continue to see this message, open your wallet and ensure it's unlocked and the RPC endpoint is reachable.`);
      } else if (error.message.includes('User denied')) {
        throw new Error('Connection was denied. Please approve the connection in MetaMask');
      } else {
        throw new Error(`Failed to connect wallet: ${error.message}`);
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
  }

  private async initializeContract(): Promise<void> {
    if (!this.provider || !this.signer || !this.chainId) {
      throw new Error('Wallet not connected');
    }

    const contractAddress = getContractAddress(this.chainId);
    if (!contractAddress) {
      throw new Error(`Contract not deployed on network with chain ID: ${this.chainId}. Please deploy the contract first.`);
    }

    console.log('Initializing contract at address:', contractAddress);
    this.contract = new Contract(contractAddress, CONTRACT_ABI, this.signer);
    
    // Test contract connection
    try {
      const stats = await this.contract.getStats();
      console.log('Contract connected successfully. Stats:', stats);
    } catch (error: any) {
      console.error('Contract connection test failed:', error);
      throw new Error(`Contract not accessible at address ${contractAddress}. Please ensure the contract is deployed and the address is correct.`);
    }
  }

  async registerPatient(): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.registerPatient();
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to register patient: ${error.message}`);
    }
  }

  async addRecord(
    patient: string,
    cid: string,
    fileType: string,
    meta: string,
    recordHash: string
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.addRecord(patient, cid, fileType, meta, recordHash);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to add record: ${error.message}`);
    }
  }

  async getAllRecords(patient: string): Promise<HealthRecord[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [
        cids,
        fileTypes,
        metas,
        timestamps,
        addedBys,
        isVerifieds,
        hashes
      ] = await this.contract.getAllRecords(patient);

      return cids.map((cid: string, index: number) => ({
        cid,
        fileType: fileTypes[index],
        meta: metas[index],
        timestamp: Number(timestamps[index]),
        addedBy: addedBys[index],
        isVerified: isVerifieds[index],
        hash: hashes[index]
      }));
    } catch (error: any) {
      throw new Error(`Failed to get records: ${error.message}`);
    }
  }

  async getRecord(patient: string, index: number): Promise<HealthRecord> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [cid, fileType, meta, timestamp, addedBy, isVerified, hash] = 
        await this.contract.getRecord(patient, index);

      return {
        cid,
        fileType,
        meta,
        timestamp: Number(timestamp),
        addedBy,
        isVerified,
        hash
      };
    } catch (error: any) {
      throw new Error(`Failed to get record: ${error.message}`);
    }
  }

  async getRecordCount(patient: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const count = await this.contract.getRecordCount(patient);
      return Number(count);
    } catch (error: any) {
      throw new Error(`Failed to get record count: ${error.message}`);
    }
  }

  async grantAccess(
    provider: string,
    permissionType: number,
    durationInDays: number
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.grantAccess(provider, permissionType, durationInDays);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to grant access: ${error.message}`);
    }
  }

  async revokeAccess(provider: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.revokeAccess(provider);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }

  async hasAccess(patient: string, provider: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.hasAccess(patient, provider);
    } catch (error: any) {
      throw new Error(`Failed to check access: ${error.message}`);
    }
  }

  async getPermission(patient: string, provider: string): Promise<Permission> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [permissionType, expiresAt, isActive] = 
        await this.contract.getPermission(patient, provider);

      return {
        permissionType: Number(permissionType),
        expiresAt: Number(expiresAt),
        isActive
      };
    } catch (error: any) {
      throw new Error(`Failed to get permission: ${error.message}`);
    }
  }

  async getPatientProviders(patient: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.getPatientProviders(patient);
    } catch (error: any) {
      throw new Error(`Failed to get patient providers: ${error.message}`);
    }
  }

  async verifyRecordHash(recordHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.verifyRecordHash(recordHash);
    } catch (error: any) {
      throw new Error(`Failed to verify record hash: ${error.message}`);
    }
  }

  async verifyRecord(recordHash: string): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.verifyRecord(recordHash);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to verify record: ${error.message}`);
    }
  }

  async getStats(): Promise<ContractStats> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalRecords, totalPatients] = await this.contract.getStats();
      return {
        totalRecords: Number(totalRecords),
        totalPatients: Number(totalPatients)
      };
    } catch (error: any) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }

  async updateRecordMeta(
    patient: string,
    index: number,
    newMeta: string
  ): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.updateRecordMeta(patient, index, newMeta);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Failed to update record meta: ${error.message}`);
    }
  }

  // Utility functions
  generateRecordHash(data: string): string {
    // Simple hash generation for demo purposes
    // In production, use a proper cryptographic hash
    return ethers.keccak256(ethers.toUtf8Bytes(data + Date.now().toString()));
  }

  async switchNetwork(chainId: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }

  async getBalance(): Promise<string> {
    if (!this.provider || !this.account) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.provider.getBalance(this.account);
      return ethers.formatEther(balance);
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.contract !== null && this.account !== null;
  }

  get currentAccount(): string | null {
    return this.account;
  }

  get currentChainId(): number | null {
    return this.chainId;
  }

  get contractInstance(): Contract | null {
    return this.contract;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
