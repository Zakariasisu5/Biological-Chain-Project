// src/utils/walletUtils.ts
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export type WalletType = "metamask" | "coinbase" | "trustwallet" | "walletconnect";

export interface WalletInfo {
  address: string;
  network: string;
  chainId: number;
  balance: string;
  walletType: WalletType;
  isConnected: boolean;
}

/**
 * Represents a disconnected wallet state.
 */
export const defaultWalletInfo: WalletInfo = {
  address: "",
  network: "",
  chainId: 0,
  balance: "0",
  walletType: "walletconnect",
  isConnected: false,
};

/**
 * Sets up listeners for injected wallets (e.g. MetaMask).
 * Returns a cleanup function that removes all listeners.
 */
export function setupWalletEventListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: () => void
): () => void {
  const eth = (window as any).ethereum;
  if (!eth || typeof eth.on !== "function") {
    return () => {};
  }

  const handleAccountsChanged = (accounts: string[]) => {
    onAccountsChanged(accounts);
  };
  const handleChainChanged = () => {
    onChainChanged();
  };
  const handleDisconnect = () => {
    onAccountsChanged([]);
  };

  eth.on("accountsChanged", handleAccountsChanged);
  eth.on("chainChanged", handleChainChanged);
  eth.on("disconnect", handleDisconnect);

  return () => {
    eth.removeListener("accountsChanged", handleAccountsChanged);
    eth.removeListener("chainChanged", handleChainChanged);
    eth.removeListener("disconnect", handleDisconnect);
  };
}

let currentProvider: any = null;

/**
 * Connects to the requested wallet type and returns WalletInfo.
 */
export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  if (walletType === "metamask") {
    if (!(window as any).ethereum) throw new Error("MetaMask not found");
    currentProvider = (window as any).ethereum;
    await currentProvider.request({ method: "eth_requestAccounts" });
  }

  if (walletType === "coinbase") {
    currentProvider = (window as any).coinbaseWalletExtension;
    if (!currentProvider) throw new Error("Coinbase Wallet not found");
    await currentProvider.request({ method: "eth_requestAccounts" });
  }

  if (walletType === "trustwallet") {
    currentProvider = (window as any).trustwallet;
    if (!currentProvider) throw new Error("Trust Wallet not found");
    await currentProvider.request({ method: "eth_requestAccounts" });
  }

  if (walletType === "walletconnect") {
    const wc = new WalletConnectProvider({
      rpc: { 1: "https://mainnet.infura.io/v3/c4996bc7a2fb4c25b756648d9f850a2d" },
    });
    await wc.enable();
    currentProvider = wc;
    (window as any).walletConnectProvider = wc; // for disconnect
  }

  const web3 = new Web3(currentProvider);
  const accounts = await web3.eth.getAccounts();
  const chainId = await web3.eth.getChainId();
  const rawBalance = await web3.eth.getBalance(accounts[0]);
  const balance = Web3.utils.fromWei(rawBalance, "ether");

  return {
    address: accounts[0],
    network: `Chain ${chainId}`,
    chainId,
    balance,
    walletType,
    isConnected: true,
  };
}

/**
 * Disconnects a WalletConnect session if active.
 */
export async function disconnectWallet(): Promise<void> {
  try {
    const wc = (window as any).walletConnectProvider;
    if (wc?.disconnect) {
      await wc.disconnect();
    }
  } catch (err) {
    console.warn("Error disconnecting wallet:", err);
  } finally {
    currentProvider = null;
  }
}    currentProvider = wc;
    // Expose WalletConnect provider for explicit disconnect
    ;(window as any).walletConnectProvider = wc;
  }

  // 2) Read on-chain data
  const web3 = new Web3(currentProvider);
  const accounts = await web3.eth.getAccounts();
  const chainId = await web3.eth.getChainId();
  const rawBalance = await web3.eth.getBalance(accounts[0]);
  const balance = Web3.utils.fromWei(rawBalance, "ether");

  return {
    address: accounts[0],
    network: `Chain ${chainId}`,
    chainId,
    balance,
    walletType,
    isConnected: true,
  };
}

/**
 * Disconnects WalletConnect sessions cleanly. Other injected wallets
 * automatically lose connection when you clear state.
 */
export async function disconnectWallet(): Promise<void> {
  try {
    const wc = (window as any).walletConnectProvider;
    if (wc?.disconnect) {
      await wc.disconnect();
    }
  } catch (err) {
    console.warn("Error disconnecting wallet:", err);
  } finally {
    currentProvider = null;
  }
}
