
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

// Types for wallet connection
export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  network: string;
  isConnected: boolean;
  walletType: WalletType;
}

// Supported wallet types
export type WalletType = 'metamask' | 'coinbase' | 'walletconnect' | 'trustwallet';

// Default wallet info for initialization
export const defaultWalletInfo: WalletInfo = {
  address: "",
  balance: "0",
  chainId: 0,
  network: "",
  isConnected: false,
  walletType: 'metamask'
};

// Networks supported by the app
export const supportedNetworks = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  11155111: "Sepolia Testnet",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  56: "Binance Smart Chain",
  97: "BSC Testnet",
  43114: "Avalanche C-Chain",
  43113: "Avalanche Fuji Testnet",
};

// Web3Modal configuration
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "YOUR_INFURA_PROJECT_ID", // Replace with your Infura Project ID
      bridge: "https://bridge.walletconnect.org",
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
  disableInjectedProvider: false, // allow MetaMask / Injected provider
});

// Check if a specific wallet is installed
export const isWalletInstalled = (walletType: WalletType = 'metamask'): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Special case for WalletConnect which doesn't require browser extension
  if (walletType === 'walletconnect') return true;
  
  // Check for ethereum object which indicates some wallet is installed
  if (!window.ethereum) return false;
  
  switch (walletType) {
    case 'metamask':
      return window.ethereum.isMetaMask === true;
    case 'coinbase':
      return window.ethereum.isCoinbaseWallet === true;
    case 'trustwallet':
      return window.ethereum.isTrust === true;
    default:
      // If we can't identify the specific wallet but ethereum object exists
      return true; 
  }
};

// Check if ethereum provider has required request method
const isValidEthereumProvider = (provider: any): provider is ethers.Eip1193Provider => {
  return provider && typeof provider.request === 'function';
};

// Connect wallet function with support for multiple wallets
export const connectWallet = async (walletType: WalletType = 'metamask'): Promise<WalletInfo> => {
  try {
    let provider;

    if (walletType === 'walletconnect' || !window.ethereum) {
      // Use Web3Modal for WalletConnect or when no injected provider is available
      const modalProvider = await web3Modal.connect();
      provider = new ethers.BrowserProvider(modalProvider);
    } else {
      // Verify that the ethereum object has the required request method
      if (!isValidEthereumProvider(window.ethereum)) {
        throw new Error("Ethereum provider does not support the required request method");
      }
      
      // Use injected provider (MetaMask, Coinbase, etc.)
      provider = new ethers.BrowserProvider(window.ethereum);
    }

    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Get network
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // Get balance
    const balance = ethers.formatEther(await provider.getBalance(address));

    return {
      address,
      balance,
      chainId,
      network: supportedNetworks[chainId as keyof typeof supportedNetworks] || "Unknown Network",
      isConnected: true,
      walletType
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Disconnect wallet function
export const disconnectWallet = (): WalletInfo => {
  // Clear Web3Modal cached provider to ensure clean disconnect
  if (web3Modal) {
    web3Modal.clearCachedProvider();
  }
  return defaultWalletInfo;
};

// Event listeners for wallet changes
export const setupWalletEventListeners = (
  handleAccountsChanged: (accounts: string[]) => void,
  handleChainChanged: (chainId: string) => void
) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }
  return () => {};
};
