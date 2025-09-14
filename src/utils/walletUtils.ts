// utils/walletUtils.ts
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export type WalletType = 'metamask' | 'coinbase' | 'trustwallet' | 'walletconnect';

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
  if (walletType === 'metamask') {
    if (!window.ethereum) throw new Error("MetaMask not found");
    currentProvider = window.ethereum;
    await currentProvider.request({ method: 'eth_requestAccounts' });
  }

  if (walletType === 'walletconnect') {
    currentProvider = new WalletConnectProvider({
      rpc: {
        1: "https://mainnet.infura.io/v3/c4996bc7a2fb4c25b756648d9f850a2d"
      }
    });
    await currentProvider.enable();
  }

  if (walletType === 'coinbase') {
    currentProvider = (window as any).coinbaseWalletExtension;
    if (!currentProvider) throw new Error("Coinbase Wallet not found");
    await currentProvider.request({ method: 'eth_requestAccounts' });
  }

  if (walletType === 'trustwallet') {
    currentProvider = (window as any).trustwallet;
    if (!currentProvider) throw new Error("Trust Wallet not found");
    await currentProvider.request({ method: 'eth_requestAccounts' });
  }

  const web3 = new Web3(currentProvider);
  const accounts = await web3.eth.getAccounts();
  const chainId = await web3.eth.getChainId();
  const balance = await web3.eth.getBalance(accounts[0]);

  return {
    address: accounts[0],
    network: `Chain ${chainId}`,
    chainId,
    balance: Web3.utils.fromWei(balance, 'ether'),
    walletType,
    isConnected: true
  };
}

export async function disconnectWallet() {
  if (currentProvider?.disconnect) {
    await currentProvider.disconnect();
  }
  currentProvider = null;
}
