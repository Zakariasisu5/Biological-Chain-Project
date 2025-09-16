// utils/walletUtils.ts
import { ethers, type BrowserProvider, type Signer } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

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

let provider: BrowserProvider | null = null;

// WalletConnect Project ID - prefer Vite env variable, fallback to hardcoded (replace in production)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : (process.env as any);
const WALLETCONNECT_PROJECT_ID = env.VITE_WALLETCONNECT_PROJECT_ID || env.WALLETCONNECT_PROJECT_ID || "4f4c596844dd89275d4815534ff37881";

/**
 * Connect wallet (MetaMask, Coinbase, TrustWallet, WalletConnect)
 */
export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  if (walletType === "walletconnect") {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [11155111], // Sepolia
        showQrModal: true,
      });

      await wcProvider.enable();

      provider = new ethers.BrowserProvider(wcProvider as any);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balanceBN = await provider.getBalance(address);

      return {
        isConnected: true,
        address,
        network: network.name,
        balance: ethers.formatEther(balanceBN),
        walletType: "walletconnect",
      };
    } catch (err: any) {
      console.error("WalletConnect connection failed:", err);
      throw new Error(
        err?.message?.includes("Unauthorized")
          ? "WalletConnect failed: make sure your production domain is added to the WalletConnect Cloud console."
          : err?.message || "Failed to connect WalletConnect"
      );
    }
  }

  // Browser wallets (MetaMask, Coinbase, TrustWallet)
  if (!window.ethereum) throw new Error(`${walletType} wallet not detected`);

  provider = new ethers.BrowserProvider(window.ethereum as any);
  const accounts = await provider.send("eth_requestAccounts", []);
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
 * Disconnect wallet (resets provider)
 */
export async function disconnectWallet(): Promise<void> {
  provider = null;
}

/**
 * Setup event listeners for wallet account/chain changes
 */
export function setupWalletEventListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: () => void
) {
  if (window.ethereum) {
    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);
  }

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    }
  };
}
