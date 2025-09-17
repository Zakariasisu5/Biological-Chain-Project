// utils/walletUtils.ts
import { ethers, type BrowserProvider, type Signer } from "ethers";
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

let provider: BrowserProvider | null = null;
let wcProviderRef: any = null;

// WalletConnect Project ID - prefer Vite env variable, fallback to hardcoded (replace in production)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : (process.env as any);
const WALLETCONNECT_PROJECT_ID = env.VITE_WALLETCONNECT_PROJECT_ID || env.WALLETCONNECT_PROJECT_ID || "4f4c596844dd89275d4815534ff37881";

/**
 * Connect wallet (MetaMask, Coinbase, TrustWallet, WalletConnect)
 */
export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  if (walletType === "walletconnect") {
    try {
      // If we already have an active WalletConnect provider, reuse it instead of init-ing again.
      if (wcProviderRef) {
        try {
          // Try to enable existing session (may be no-op if already connected)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (wcProviderRef as any).enable?.();
        } catch (e) {
          // ignore enable errors here; we'll attempt re-init below if needed
        }
      }

      // If no provider ref exists, initialize and attach listeners
      if (!wcProviderRef) {
        const wcProvider = await EthereumProvider.init({
          projectId: WALLETCONNECT_PROJECT_ID,
          chains: [11155111], // Sepolia
          // disable provider's built-in QR / deep-link UI so we can render our own fallback/QR
          showQrModal: false,
        });

        // keep a reference early so event handlers can assign displayUri
        wcProviderRef = wcProvider;

        // listen for provider display URI events (different provider versions use different event names)
        try {
          if (typeof wcProvider.on === 'function') {
            // common event name
            wcProvider.on('display_uri', (uri: string) => {
              try { (wcProviderRef as any).displayUri = uri; } catch (e) {}
            });
            // alternate event name
            wcProvider.on('displayUri', (uri: string) => {
              try { (wcProviderRef as any).displayUri = uri; } catch (e) {}
            });
          }
        } catch (e) {
          // ignore
        }
      }

      // Enable session (this will trigger the proposal flow if not already connected)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (wcProviderRef as any).enable();

      provider = new ethers.BrowserProvider(wcProviderRef as any);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balanceBN = await provider.getBalance(address);

      return {
        isConnected: true,
        address,
        network: network.name,
        balance: ethers.formatEther(balanceBN),
        walletType: "walletconnect",
      };
    } catch (err: any) {
      console.error("WalletConnect connection failed:", err);
      // Surface a clearer message for common WalletConnect errors
      if (String(err?.message || err).toLowerCase().includes('proposal expired')) {
        throw new Error('WalletConnect proposal expired — try reconnecting or refresh the page.');
      }
      throw new Error(
        err?.message?.includes("Unauthorized")
          ? "WalletConnect failed: make sure your production domain is added to the WalletConnect Cloud console."
          : err?.message || "Failed to connect WalletConnect"
      );
    }
  }

  // Browser wallets (MetaMask, Coinbase, TrustWallet)
  if (!window.ethereum) throw new Error(`${walletType} wallet not detected`);

  provider = new ethers.BrowserProvider(window.ethereum as any);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) throw new Error("No accounts found");

  const network = await provider.getNetwork();
  const balanceBN = await provider.getBalance(accounts[0]);

  return {
    isConnected: true,
    address: accounts[0],
    network: network.name,
    balance: ethers.formatEther(balanceBN),
    walletType,
  };
}

/**
 * Disconnect wallet (resets provider)
 */
export async function disconnectWallet(): Promise<void> {
  // If a WalletConnect provider is active, disconnect it cleanly
  try {
    if (wcProviderRef && typeof wcProviderRef.disconnect === 'function') {
      await wcProviderRef.disconnect();
    }
  } catch (e) {
    // ignore
    console.warn('Error disconnecting WalletConnect provider', e);
  }
  wcProviderRef = null;
  provider = null;
}

// Expose provider for other hooks/components to reuse the same BrowserProvider instance
export function getProvider(): BrowserProvider | null {
  return provider;
}

/**
 * Return WalletConnect display URI if set by the provider. This can be used to build a web fallback
 * or deep link for mobile wallets when automatic deep-linking fails.
 */
export function getWalletConnectDisplayUri(): string | null {
  try {
    if (wcProviderRef && (wcProviderRef as any).displayUri) {
      return (wcProviderRef as any).displayUri as string;
    }
  } catch (e) {
    // ignore
  }
  return null;
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
