import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export type WalletType =
  | "metamask"
  | "coinbase"
  | "trustwallet"
  | "walletconnect";

export interface WalletInfo {
  address: string;
  network: string;
  chainId: number;
  balance: string;
  walletType: WalletType;
  isConnected: boolean;
}

/**
 * Disconnected default state.
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
 * Listen for injected wallet events (accounts/chain changes, disconnect).
 * Returns a cleanup function.
 */
export function setupWalletEventListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: () => void
): () => void {
  const eth = (window as any).ethereum;
  if (!eth || typeof eth.on !== "function") {
    return () => {};
  }

  const handleAccounts = (accounts: string[]) => onAccountsChanged(accounts);
  const handleChain = () => onChainChanged();
  const handleDisconnect = () => onAccountsChanged([]);

  eth.on("accountsChanged", handleAccounts);
  eth.on("chainChanged", handleChain);
  eth.on("disconnect", handleDisconnect);

  return () => {
    eth.removeListener("accountsChanged", handleAccounts);
    eth.removeListener("chainChanged", handleChain);
    eth.removeListener("disconnect", handleDisconnect);
  };
}

let currentProvider: any = null;

/**
 * Connect to MetaMask, Coinbase, Trust Wallet (injected),
 * or WalletConnect (QR modal).
 */
export async function connectWallet(
  walletType: WalletType
): Promise<WalletInfo> {
  // 1) Initialize provider
  if (walletType === "metamask") {
    if (!(window as any).ethereum) {
      throw new Error("MetaMask not found");
    }
    currentProvider = (window as any).ethereum;
    await currentProvider.request({ method: "eth_requestAccounts" });
  }

  if (walletType === "coinbase") {
    currentProvider = (window as any).coinbaseWalletExtension;
    if (!currentProvider) {
      throw new Error("Coinbase Wallet not found");
    }
    await currentProvider.request({ method: "eth_requestAccounts" });
  }

  if (walletType === "trustwallet") {
    currentProvider = (window as any).trustwallet;
    if (!currentProvider) {
      throw new Error("Trust Wallet not found");
    }
    await currentProvider.request({ method: "eth_requestAccounts" });
  }

  if (walletType === "walletconnect") {
    const wc = new WalletConnectProvider({
      rpc: {
        1: "https://mainnet.infura.io/v3/c4996bc7a2fb4c25b756648d9f850a2d",
      },
    });
    await wc.enable();
    currentProvider = wc;
    // expose for explicit disconnect
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
 * Disconnect a WalletConnect session cleanly.
 * Injected wallets auto-drop on page reload / state clear.
 */
export async function disconnectWallet(): Promise<void> {
  try {
    const wc = (window as any).walletConnectProvider;
    if (wc?.disconnect) {
      await wc.disconnect();
    }
  } catch (err) {
    console.warn("disconnectWallet error:", err);
  } finally {
    currentProvider = null;
  }
}
