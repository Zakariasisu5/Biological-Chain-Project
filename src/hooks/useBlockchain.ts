import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { blockchainService, HealthRecord, ContractStats } from "@/services/blockchainService";

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
    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.connectWallet();
      setAccount(result.account);
      setContract(blockchainService.contractInstance);
      setProvider(blockchainService['provider']);
      setIsConnected(true);
      setNetwork(`Chain ID: ${result.chainId}`);
      
      // Get balance
      const balance = await blockchainService.getBalance();
      setBalance(balance);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await blockchainService.disconnectWallet();
      setProvider(null);
      setContract(null);
      setAccount(null);
      setIsConnected(false);
      setError(null);
      setNetwork(null);
      setBalance(null);
    } catch (err: any) {
      setError(err.message || "Failed to disconnect wallet");
    }
  };

  // Switch network function
  const switchNetwork = async (chainId: string) => {
    try {
      await blockchainService.switchNetwork(chainId);
      // Reconnect after network switch
      await connectWallet();
    } catch (err: any) {
      setError(err.message || "Failed to switch network");
    }
  };

  // Wrapper methods for blockchain service
  const registerPatient = async (): Promise<string> => {
    try {
      return await blockchainService.registerPatient();
    } catch (err: any) {
      setError(err.message || "Failed to register patient");
      throw err;
    }
  };

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
      setError(err.message || "Failed to add record");
      throw err;
    }
  };

  const getAllRecords = async (patient: string): Promise<HealthRecord[]> => {
    try {
      return await blockchainService.getAllRecords(patient);
    } catch (err: any) {
      setError(err.message || "Failed to get records");
      throw err;
    }
  };

  const getRecord = async (patient: string, index: number): Promise<HealthRecord> => {
    try {
      return await blockchainService.getRecord(patient, index);
    } catch (err: any) {
      setError(err.message || "Failed to get record");
      throw err;
    }
  };

  const getRecordCount = async (patient: string): Promise<number> => {
    try {
      return await blockchainService.getRecordCount(patient);
    } catch (err: any) {
      setError(err.message || "Failed to get record count");
      throw err;
    }
  };

  const grantAccess = async (
    provider: string, 
    permissionType: number, 
    durationInDays: number
  ): Promise<string> => {
    try {
      return await blockchainService.grantAccess(provider, permissionType, durationInDays);
    } catch (err: any) {
      setError(err.message || "Failed to grant access");
      throw err;
    }
  };

  const revokeAccess = async (provider: string): Promise<string> => {
    try {
      return await blockchainService.revokeAccess(provider);
    } catch (err: any) {
      setError(err.message || "Failed to revoke access");
      throw err;
    }
  };

  const hasAccess = async (patient: string, provider: string): Promise<boolean> => {
    try {
      return await blockchainService.hasAccess(patient, provider);
    } catch (err: any) {
      setError(err.message || "Failed to check access");
      throw err;
    }
  };

  const getPermission = async (patient: string, provider: string): Promise<any> => {
    try {
      return await blockchainService.getPermission(patient, provider);
    } catch (err: any) {
      setError(err.message || "Failed to get permission");
      throw err;
    }
  };

  const getPatientProviders = async (patient: string): Promise<string[]> => {
    try {
      return await blockchainService.getPatientProviders(patient);
    } catch (err: any) {
      setError(err.message || "Failed to get patient providers");
      throw err;
    }
  };

  const verifyRecordHash = async (recordHash: string): Promise<boolean> => {
    try {
      return await blockchainService.verifyRecordHash(recordHash);
    } catch (err: any) {
      setError(err.message || "Failed to verify record hash");
      throw err;
    }
  };

  const verifyRecord = async (recordHash: string): Promise<string> => {
    try {
      return await blockchainService.verifyRecord(recordHash);
    } catch (err: any) {
      setError(err.message || "Failed to verify record");
      throw err;
    }
  };

  const getStats = async (): Promise<ContractStats> => {
    try {
      return await blockchainService.getStats();
    } catch (err: any) {
      setError(err.message || "Failed to get stats");
      throw err;
    }
  };

  const updateRecordMeta = async (
    patient: string, 
    index: number, 
    newMeta: string
  ): Promise<string> => {
    try {
      return await blockchainService.updateRecordMeta(patient, index, newMeta);
    } catch (err: any) {
      setError(err.message || "Failed to update record meta");
      throw err;
    }
  };

  const generateRecordHash = (data: string): string => {
    return blockchainService.generateRecordHash(data);
  };

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (blockchainService.isConnected) {
        setAccount(blockchainService.currentAccount);
        setContract(blockchainService.contractInstance);
        setProvider(blockchainService['provider']);
        setIsConnected(true);
        setNetwork(`Chain ID: ${blockchainService.currentChainId}`);
        
        try {
          const balance = await blockchainService.getBalance();
          setBalance(balance);
        } catch (err) {
          console.warn("Failed to get balance:", err);
        }
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

    if (window.ethereum) {
      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);
    }

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener?.("chainChanged", handleChainChanged);
      }
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
    registerPatient,
    addRecord,
    getAllRecords,
    getRecord,
    getRecordCount,
    grantAccess,
    revokeAccess,
    hasAccess,
    getPermission,
    getPatientProviders,
    verifyRecordHash,
    verifyRecord,
    getStats,
    updateRecordMeta,
    generateRecordHash
  };
};
