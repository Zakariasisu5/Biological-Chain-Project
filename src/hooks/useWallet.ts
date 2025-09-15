import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
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
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,
        chains: [11155111], // Sepolia
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
