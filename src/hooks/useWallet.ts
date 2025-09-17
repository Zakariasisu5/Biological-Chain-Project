import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { connectWallet as connectWalletUtil, getProvider } from '@/utils/walletUtils';

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
      const info = await connectWalletUtil('walletconnect');
      // Build a BrowserProvider and signer from the injected provider stored in walletUtils
      if (info && info.address) {
        // Reuse the provider constructed by walletUtils to avoid mismatched instances
        const sharedProvider = getProvider();
        let providerObj = sharedProvider;
        if (!providerObj) {
          // fallback to constructing from global ethereum if getProvider isn't set for some reason
          providerObj = new ethers.BrowserProvider((window as any).ethereum as any);
        }
        const signer = await providerObj.getSigner();
        const network = await providerObj.getNetwork();

        setWallet({
          provider: providerObj,
          signer,
          account: info.address,
          chainId: Number(network.chainId),
        });
        localStorage.setItem("lastWallet", "walletconnect");
      }
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
