import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { connectWallet as connectWalletUtil, getProvider, restoreConnection } from '@/utils/walletUtils';
import { useWalletContext } from '@/contexts/WalletContext';

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
  // Re-export the context-based wallet API so existing components keep working
  const ctx = useWalletContext();
  return {
    wallet: ctx.wallet,
    connectMetaMask: ctx.connectMetaMask,
    connectWalletConnect: ctx.connectWalletConnect,
  };
}
