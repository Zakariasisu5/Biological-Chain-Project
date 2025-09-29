import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { blockchainService, HealthRecord, ContractStats } from "@/services/blockchainService";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/contracts/MedicalRecords';

interface BlockchainHook {
  contract: Contract | null;
  account: string | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  network: string | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
  // New methods
  registerPatient: () => Promise<string>;
  addRecord: (patient: string, cid: string, fileType: string, meta: string, recordHash: string) => Promise<string>;
  getAllRecords: (patient: string) => Promise<HealthRecord[]>;
  getRecord: (patient: string, index: number) => Promise<HealthRecord>;
  getRecordCount: (patient: string) => Promise<number>;
  grantAccess: (provider: string, permissionType: number, durationInDays: number) => Promise<string>;
  revokeAccess: (provider: string) => Promise<string>;
  hasAccess: (patient: string, provider: string) => Promise<boolean>;
  getPermission: (patient: string, provider: string) => Promise<any>;
  getPatientProviders: (patient: string) => Promise<string[]>;
  verifyRecordHash: (recordHash: string) => Promise<boolean>;
  verifyRecord: (recordHash: string) => Promise<string>;
  getStats: () => Promise<ContractStats>;
  updateRecordMeta: (patient: string, index: number, newMeta: string) => Promise<string>;
  generateRecordHash: (data: string) => string;
}

export const useBlockchain = (): BlockchainHook => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Delegate to the centralized blockchainService which will create the signer and contract
      const result = await blockchainService.connectWallet();
      const ethProvider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(ethProvider);
      setAccount(result.account);
      setIsConnected(true);

      // network and balance from provider/service
      const networkObj = await ethProvider.getNetwork();
      setNetwork(networkObj.name);
      try {
        const bal = await blockchainService.getBalance();
        setBalance(bal);
      } catch (e) {
        try {
          const b = await ethProvider.getBalance(result.account);
          setBalance(ethers.formatEther(b));
        } catch (e2) {
          // ignore
        }
      }

      // set contract reference if available via service
      try {
        const svcContract = blockchainService.contractInstance;
        setContract(svcContract as Contract | null);
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    try {
      blockchainService.disconnectWallet();
    } catch (e) {
      // ignore
    }
    setProvider(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
    setError(null);
    setNetwork(null);
    setBalance(null);
  };

  // Switch network function
  const switchNetwork = async (chainId: string) => {
    if (!window.ethereum) {
      setError("MetaMask not detected");
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (err: any) {
      setError(err.message || "Failed to switch network");
    }
  };

  // Small wrappers that delegate to the centralized blockchainService singleton
  const addRecord = async (
    patient: string,
    cid: string,
    fileType: string,
    meta: string,
    recordHash: string
  ): Promise<string> => {
    try {
      return await blockchainService.addRecord(patient, cid, fileType, meta, recordHash);
    } catch (err: any) {
      setError(err.message || 'Failed to add record');
      throw err;
    }
  };

  const getRecord = async (patient: string, index: number) => {
    try {
      return await blockchainService.getRecord(patient, index);
    } catch (err: any) {
      setError(err.message || 'Failed to get record');
      throw err;
    }
  };

  const getRecordCount = async (patient: string) => {
    try {
      return await blockchainService.getRecordCount(patient);
    } catch (err: any) {
      setError(err.message || 'Failed to get record count');
      throw err;
    }
  };

  const registerPatient = async () => {
    try {
      return await blockchainService.registerPatient();
    } catch (err: any) {
      setError(err.message || 'Failed to register patient');
      throw err;
    }
  };

  const getAllRecords = async (patient: string) => {
    try {
      return await blockchainService.getAllRecords(patient);
    } catch (err: any) {
      setError(err.message || 'Failed to get records');
      throw err;
    }
  };

  const generateRecordHash = (data: string): string => {
    try {
      return blockchainService.generateRecordHash(data);
    } catch (err: any) {
      // fallback to local ethers keccak256
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { ethers } = require('ethers');
        return ethers.keccak256(ethers.toUtf8Bytes(data + Date.now().toString()));
      } catch (e) {
        throw new Error('Failed to generate record hash');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // If the centralized service is already connected (singleton), use it to populate state
        if (blockchainService.isConnected) {
          const acct = blockchainService.currentAccount;
          const chainId = blockchainService.currentChainId;
          // populate local state
          if (acct) setAccount(acct);
          setIsConnected(Boolean(blockchainService.isConnected));
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            const ethProvider = new ethers.BrowserProvider((window as any).ethereum as any);
            setProvider(ethProvider);
            try { ethProvider.getNetwork().then(n => setNetwork(n.name)); } catch (e) {}
            try { blockchainService.getBalance().then(b => setBalance(b)); } catch (e) {}
          }
          try { setContract(blockchainService.contractInstance); } catch (e) {}
          return;
        }

        // Otherwise, if eth_accounts returns authorized accounts, auto-connect
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              await connectWallet();
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize wallet");
      }
    };

    init();

    // Set up event listeners
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    // Cleanup listeners
    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return { 
    provider, 
    contract, 
    account, 
    isConnected, 
    isLoading, 
    error, 
    network, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork,
    // wrappers
    addRecord,
    getAllRecords,
    generateRecordHash,
  } as unknown as BlockchainHook;
};
