// utils/walletUtils.ts
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

let currentProvider: any = null;

export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  // 1. Set up the provider based on type
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
      rpc: { 1: "https://mainnet.infura.io/v3/c4996bc7a2fb4c25b756648d9f850a2d" }
    });
    await wc.enable();
    currentProvider = wc;
    // Expose for disconnect
    ;(window as any).walletConnectProvider = wc;
  }

  // 2. Use Web3 to read accounts, chainId, balance
  const web3 = new Web3(currentProvider);
  const accounts = await web3.eth.getAccounts();
  const chainId = await web3.eth.getChainId();
  const rawBal = await web3.eth.getBalance(accounts[0]);

  return {
    address: accounts[0],
    network: `Chain ${chainId}`,
    chainId,
    balance: Web3.utils.fromWei(rawBal, "ether"),
    walletType,
    isConnected: true
  };
}

export async function disconnectWallet() {
  try {
    // Only WalletConnect needs an explicit disconnect()
    const wc = (window as any).walletConnectProvider;
    if (wc?.disconnect) {
      await wc.disconnect();
    }
  } catch (err) {
    console.warn("Error disconnecting wallet:", err);
  }
  currentProvider = null;
}
