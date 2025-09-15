// utils/walletUtils.ts
import { ethers } from "ethers";
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

/**
 * Connect to a wallet (MetaMask, Coinbase, TrustWallet, WalletConnect)
 */
export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  let externalProvider: any;

  if (walletType === "walletconnect") {
    // WalletConnect v2
    externalProvider = await EthereumProvider.init({
      projectId: "4f4c596844dd89275d4815534ff37881", // ✅ your WalletConnect projectId
      chains: [1], // Ethereum Mainnet
      showQrModal: true,
    });

    await externalProvider.enable();
  } else {
    if (!window.ethereum) throw new Error(`${walletType} wallet not detected`);
    externalProvider = window.ethereum;
    await externalProvider.request({ method: "eth_requestAccounts" });
  }

  provider = new ethers.BrowserProvider(externalProvider);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const balanceBN = await provider.getBalance(address);

  return {
    isConnected: true,
    address,
    network: network.name,
    balance: ethers.formatEther(balanceBN),
    walletType,
  };
}

/**
 * Disconnect wallet (simply resets provider)
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
