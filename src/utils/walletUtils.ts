
import { ethers, type Eip1193Provider } from "ethers";
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

let provider: ethers.BrowserProvider | null = null;

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  if (walletType === "walletconnect") {
    // 🔑 WalletConnect provider
    const wcProvider = await EthereumProvider.init({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID, // you must set this in Vercel
      chains: [11155111], // Sepolia chain ID
      showQrModal: true,
    });

    await wcProvider.enable();
    provider = new ethers.BrowserProvider(wcProvider as unknown as Eip1193Provider);

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
  }

  // 🔑 Browser wallets (MetaMask, Coinbase, TrustWallet)
  if (!window.ethereum) throw new Error(`${walletType} wallet not detected`);
  provider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider);

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

export async function disconnectWallet(): Promise<void> {
  provider = null;
}

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
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
    }
  };
}
