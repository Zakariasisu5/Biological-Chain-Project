import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import type { BrowserProvider } from 'ethers';
import { connectWallet as connectWalletUtil, getProvider, restoreConnection, disconnectWallet as disconnectWalletUtil, type WalletInfo } from '@/utils/walletUtils';

interface WalletState {
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
}

interface WalletContextValue {
  wallet: WalletState;
  connectMetaMask: () => Promise<WalletInfo | null>;
  connectWalletConnect: () => Promise<WalletInfo | null>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({ provider: null, signer: null, account: null, chainId: null });

  const connectMetaMask = useCallback(async () => {
    if (!(window as any).ethereum) return null;
    try {
      const info = await connectWalletUtil('metamask');
      if (!info) return null;
      const sharedProvider = getProvider();
      let providerObj = sharedProvider;
      if (!providerObj && typeof window !== 'undefined' && (window as any).ethereum) {
        providerObj = new ethers.BrowserProvider((window as any).ethereum as any);
      }
      const signer = providerObj ? await providerObj.getSigner() : null;
      const network = providerObj ? await providerObj.getNetwork() : null;
      setWallet({ provider: providerObj, signer, account: info.address, chainId: network ? Number(network.chainId) : null });
      return info as WalletInfo;
    } catch (e) {
      console.error('connectMetaMask failed', e);
      return null;
    }
  }, []);

  const connectWalletConnect = useCallback(async () => {
    try {
      try { await disconnectWalletUtil(); } catch (e) {}
      const info = await connectWalletUtil('walletconnect');
      if (!info) return null;
      const sharedProvider = getProvider();
      let providerObj = sharedProvider;
      if (!providerObj && typeof window !== 'undefined' && (window as any).ethereum) {
        providerObj = new ethers.BrowserProvider((window as any).ethereum as any);
      }
      const signer = providerObj ? await providerObj.getSigner() : null;
      const network = providerObj ? await providerObj.getNetwork() : null;
      setWallet({ provider: providerObj, signer, account: info.address, chainId: network ? Number(network.chainId) : null });
      return info as WalletInfo;
    } catch (e) {
      console.error('connectWalletConnect failed', e);
      return null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectWalletUtil();
    } catch (e) {
      console.error('disconnect failed', e);
    }
    setWallet({ provider: null, signer: null, account: null, chainId: null });
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanupListeners: (() => void) | null = null;
    (async () => {
      try {
        const lastWallet = (() => { try { return localStorage.getItem('lastWallet'); } catch (e) { return null } })();
        // eslint-disable-next-line no-console
        console.debug('[WalletContext] lastWallet from storage:', lastWallet);
        const info = await restoreConnection();
        // eslint-disable-next-line no-console
        console.debug('[WalletContext] restoreConnection result:', info);
        if (info && mounted) {
          const sharedProvider = getProvider();
          let providerObj = sharedProvider;
          if (!providerObj && typeof window !== 'undefined' && (window as any).ethereum) {
            providerObj = new ethers.BrowserProvider((window as any).ethereum as any);
          }
          const signer = providerObj ? await providerObj.getSigner() : null;
          const network = providerObj ? await providerObj.getNetwork() : null;
          setWallet({ provider: providerObj, signer, account: info.address, chainId: network ? Number(network.chainId) : null });

          // attach listeners to keep context in sync with provider events
          cleanupListeners = (await import('@/utils/walletUtils')).setupWalletEventListeners(
            (accounts: string[]) => {
              setWallet((w) => ({ ...w, account: accounts && accounts.length > 0 ? accounts[0] : null }));
            },
            () => {
              (async () => {
                const p = getProvider();
                if (p) {
                  const net = await p.getNetwork();
                  setWallet((w) => ({ ...w, chainId: Number(net.chainId) }));
                }
              })();
            }
          );
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; if (cleanupListeners) try { cleanupListeners(); } catch (e) {} };
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connectMetaMask, connectWalletConnect, disconnect }}>{children}</WalletContext.Provider>
  );
};

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}

export default WalletContext;
