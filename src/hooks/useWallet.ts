import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
  });

  // 🦊 Connect MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

    try {
      const accounts: string[] = await window.ethereum.request?.({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setWallet({
        provider,
        signer,
        account: accounts[0],
        chainId: Number(network.chainId),
      });

      localStorage.setItem("lastWallet", "metamask");
    } catch (err) {
      console.error("MetaMask connection failed:", err);
    }
  }, []);

  // 🔗 Connect WalletConnect
  const connectWalletConnect = useCallback(async () => {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId: "4f4c596844dd89275d4815534ff37881", // ✅ Inserted your WalletConnect Project ID
        chains: [11155111], // Sepolia testnet (change to 1 for Mainnet if needed)
        showQrModal: true,
      });

      await wcProvider.enable();

      const provider = new ethers.BrowserProvider(wcProvider as any);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setWallet({
        provider,
        signer,
        account,
        chainId: Number(network.chainId),
      });

      localStorage.setItem("lastWallet", "walletconnect");
    } catch (err) {
      console.error("WalletConnect connection failed:", err);
    }
  }, []);

  // 🌀 Auto-reconnect
  useEffect(() => {
    const lastWallet = localStorage.getItem("lastWallet");
    if (lastWallet === "metamask") {
      connectMetaMask();
    } else if (lastWallet === "walletconnect") {
      connectWalletConnect();
    }
  }, [connectMetaMask, connectWalletConnect]);

  return {
    wallet,
    connectMetaMask,
    connectWalletConnect,
  };
}
