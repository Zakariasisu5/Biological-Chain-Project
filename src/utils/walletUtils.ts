// utils/walletUtils.ts
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider"; // default import

export type WalletType = "metamask" | "coinbase" | "trustwallet" | "walletconnect";

export interface WalletInfo {
  isConnected: boolean;
  address: string;
  network: string;
  balance: string;
  walletType: WalletType;
}

export const defaultWalletInfo: WalletInfo = {
  isConnected: false,
  address: "",
  network: "",
  balance: "",
  walletType: "walletconnect",
};

let provider: ethers.BrowserProvider | null = null;
let wcProvider: any = null; // WalletConnect provider, typed as any to avoid TS issues

/**
 * Connect to a wallet (MetaMask, Coinbase, TrustWallet, WalletConnect)
 */
export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  if (walletType === "walletconnect") {
    // Initialize WalletConnect
    wcProvider = await EthereumProvider.init({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string, // Set this in your .env
      chains: [11155111], // Sepolia chain
      showQrModal: true,
    });

    await wcProvider.enable();
    provider = new ethers.BrowserProvider(wcProvider as any);
  } else {
    // Browser wallets
    if (!window.ethereum) throw new Error(`${walletType} wallet not detected`);
    provider = new ethers.BrowserProvider(window.ethereum as any);
  }

  const accounts: string[] = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) throw new Error("No accounts found");

  const network = await provider.getNetwork();
  const balanceBN = await provider.getBalance(accounts[0]);

  return {
    isConnected: true,
    address: accounts[0],
    network: network.name,
    balance: ethers.formatEther(balanceBN),
    walletType,
  };
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  if (wcProvider) {
    await wcProvider.disconnect();
    wcProvider = null;
  }
  provider = null;
}

/**
 * Setup wallet event listeners (account/chain changes)
 */
export function setupWalletEventListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: () => void
) {
  // Browser wallets
  if (window.ethereum) {
    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);
  }

  // WalletConnect
  if (wcProvider) {
    wcProvider.on("accountsChanged", onAccountsChanged);
    wcProvider.on("chainChanged", onChainChanged);
  }

  // Return cleanup function
  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    }
    if (wcProvider) {
      wcProvider.removeListener("accountsChanged", onAccountsChanged);
      wcProvider.removeListener("chainChanged", onChainChanged);
    }
  };
}
