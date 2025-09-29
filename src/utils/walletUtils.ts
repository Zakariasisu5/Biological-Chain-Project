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
// Keep the WalletConnect provider reference on globalThis so HMR/reloads don't re-init
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wcProviderRef: any = (globalThis as any).__WC_PROVIDER__ || null;
// Track a global init promise so concurrent init calls reuse the same initialization
// and we never call EthereumProvider.init() more than once.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wcInitPromise: Promise<any> | null = (globalThis as any).__WC_INIT_PROMISE__ || null;

// helper to persist wcProviderRef across reloads
function setGlobalWcProvider(ref: any) {
  try {
    (globalThis as any).__WC_PROVIDER__ = ref;
  } catch (e) {
    // ignore
  }
}

function setGlobalWcInitPromise(p: Promise<any> | null) {
  try {
    (globalThis as any).__WC_INIT_PROMISE__ = p;
  } catch (e) {
    // ignore
  }
}

async function safeInitWalletConnectProvider(initOptions: any) {
  // If we already have a provider, return it
  // eslint-disable-next-line no-console
  console.debug('[walletUtils] safeInitWalletConnectProvider called; hasProvider=', !!wcProviderRef, 'hasInitPromise=', !!wcInitPromise);
  if (wcProviderRef) return wcProviderRef;

  // If an init is in-flight, await it and then return the global provider
  if (wcInitPromise) {
    try {
      await wcInitPromise;
      wcProviderRef = (globalThis as any).__WC_PROVIDER__ || wcProviderRef;
      return wcProviderRef;
    } catch (e) {
      // fall through to attempt a fresh init
    }
  }

  // Create and store the init promise so concurrent callers reuse it
  const p = (async () => {
    // eslint-disable-next-line no-console
    console.debug('[walletUtils] calling EthereumProvider.init');
    const inst = await EthereumProvider.init(initOptions);
    // eslint-disable-next-line no-console
    console.debug('[walletUtils] EthereumProvider.init resolved');
    setGlobalWcProvider(inst);
    return inst;
  })();

  wcInitPromise = p;
  setGlobalWcInitPromise(p);

  try {
    const inst = await p;
    wcProviderRef = inst;
    // eslint-disable-next-line no-console
    console.debug('[walletUtils] safeInitWalletConnectProvider completed; provider set');
    return wcProviderRef;
  } catch (e) {
    // init failed, clear the promise so future attempts can retry
    wcInitPromise = null;
    setGlobalWcInitPromise(null);
    // eslint-disable-next-line no-console
    console.error('[walletUtils] safeInitWalletConnectProvider failed', e);
    throw e;
  }
}

// WalletConnect Project ID - prefer Vite env variable, fallback to a dev-only default.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : (process.env as any);
const DEFAULT_DEV_WC_PROJECT_ID = "4f4c596844dd89275d4815534ff37881"; // DO NOT use this for production
const WALLETCONNECT_PROJECT_ID = env.VITE_WALLETCONNECT_PROJECT_ID || env.WALLETCONNECT_PROJECT_ID || DEFAULT_DEV_WC_PROJECT_ID;

// Desired chain id (allow overriding via env). Prefer Vite env, fallback to REACT_APP_CHAIN_ID.
const DESIRED_CHAIN_ID = Number(env.VITE_CHAIN_ID || env.REACT_APP_CHAIN_ID || 11155111);

async function trySwitchNetworkIfNeeded(providerInstance: BrowserProvider | null, rawProvider: any) {
  try {
    if (!providerInstance) return;
    const net = await providerInstance.getNetwork();
    const current = Number(net.chainId);
    if (!DESIRED_CHAIN_ID || current === DESIRED_CHAIN_ID) return;
    // attempt to switch using provider.request if available
    const chainIdHex = `0x${DESIRED_CHAIN_ID.toString(16)}`;
    try {
      if (rawProvider && typeof rawProvider.request === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await rawProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
        // re-check network
        const net2 = await providerInstance.getNetwork();
        // eslint-disable-next-line no-console
        console.debug('[walletUtils] switched network, new chainId=', net2.chainId);
      }
    } catch (switchErr: any) {
      // Log and continue; some providers (or sessions) may not support programmatic switching
      // eslint-disable-next-line no-console
      console.warn('[walletUtils] automatic network switch failed', switchErr?.message || switchErr);
    }
  } catch (e) {
    // ignore
  }
}

// If we're using the fallback (no env var), warn loudly so developers replace it with their own project ID.
try {
  const usingFallback = !(env && (env.VITE_WALLETCONNECT_PROJECT_ID || env.WALLETCONNECT_PROJECT_ID));
  if (usingFallback) {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'unknown-origin';
    // Runtime warning so developers see it in the browser console when testing WalletConnect flows
    // eslint-disable-next-line no-console
    console.warn('[walletUtils] Using fallback WalletConnect Project ID. Create your own WalletConnect Cloud project and set VITE_WALLETCONNECT_PROJECT_ID in your .env. Current origin:', origin, 'Fallback projectId:', DEFAULT_DEV_WC_PROJECT_ID);
  }
} catch (e) {
  // ignore errors while trying to warn
}

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
        // Provide wallet metadata to WalletConnect Cloud for better UX in production
        const metadata = {
          name: (typeof document !== 'undefined' && document.title) ? document.title : 'Biologic Chain DApp',
          description: 'Connect your wallet to Biologic Chain',
          url: (typeof window !== 'undefined' && window.location ? window.location.origin : 'https://example.com'),
          icons: [] as string[],
        };

        // Prevent initializing twice during HMR; if global ref exists reuse it
        if ((globalThis as any).__WC_PROVIDER__ && !wcProviderRef) {
          wcProviderRef = (globalThis as any).__WC_PROVIDER__;
        }

        const wcProvider = wcProviderRef || await safeInitWalletConnectProvider({
          projectId: WALLETCONNECT_PROJECT_ID,
          chains: [11155111], // Sepolia
          // Use provider's built-in QR / deep-link UI to avoid handling displayUri manually
          showQrModal: true,
          metadata,
        });

        // if we just created a new provider, persist it globally
        if (!wcProviderRef) {
          wcProviderRef = wcProvider;
          setGlobalWcProvider(wcProviderRef);
        }

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
            // lifecycle events
            wcProvider.on('disconnect', (code: number, reason: string) => {
              try { localStorage.removeItem('lastWallet'); } catch (e) {}
              try { wcProviderRef = null; setGlobalWcProvider(null); } catch (e) {}
              // eslint-disable-next-line no-console
              console.debug('[walletUtils] WalletConnect provider disconnected', code, reason);
            });
            // some providers emit session_delete when a session is removed
            wcProvider.on('session_delete', () => {
              try { localStorage.removeItem('lastWallet'); } catch (e) {}
              try { wcProviderRef = null; setGlobalWcProvider(null); } catch (e) {}
              // eslint-disable-next-line no-console
              console.debug('[walletUtils] WalletConnect session deleted');
            });
            // on connect, persist lastWallet
            wcProvider.on('connect', () => {
              try { localStorage.setItem('lastWallet', 'walletconnect'); } catch (e) {}
            });
          }
        } catch (e) {
          // ignore
        }
      }

      // Enable session (this will trigger the proposal flow if not already connected)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enableWithRetries = async (attempts = 2) => {
        let lastErr: any = null;
        for (let i = 0; i < attempts; i++) {
          try {
            // eslint-disable-next-line no-console
            console.debug('[walletUtils] enabling WalletConnect (attempt', i + 1, 'of', attempts, ')');
            await (wcProviderRef as any).enable();
            // eslint-disable-next-line no-console
            console.debug('[walletUtils] WalletConnect enable succeeded');
            return;
          } catch (e: any) {
            lastErr = e;
            // small delay before retry
            await new Promise((res) => setTimeout(res, 250));
          }
        }
        throw lastErr;
      };

      try {
        // eslint-disable-next-line no-console
        console.debug('[walletUtils] attempting enableWithRetries');
        await enableWithRetries(2);
      } catch (enableErr: any) {
        // eslint-disable-next-line no-console
        console.error('[walletUtils] enableWithRetries failed', enableErr);
        const msg = String(enableErr?.message || enableErr || 'Failed to enable WalletConnect');
        // Specific WalletConnect Cloud relay error seen in production
        if (msg.includes('Failed to publish custom payload')) {
          // Reset provider so next attempt starts fresh
          try { (wcProviderRef as any).disconnect?.(); } catch (e) {}
          wcProviderRef = null;
          provider = null;
          console.error('WalletConnect publish error:', enableErr);
          throw new Error('WalletConnect relay error: Failed to publish payload. Try again in a moment or check your WalletConnect Cloud project configuration.');
        }

        // If the proposal expired, try one automatic re-init and enable attempt to recover from stale proposals
        if (msg.toLowerCase().includes('proposal expired')) {
          try {
            // Clear stale provider and provider state
            try { (wcProviderRef as any).disconnect?.(); } catch (e) {}
            wcProviderRef = null;
            provider = null;

            // Reinitialize provider and reattach display_uri listeners
            const metadata = {
              name: (typeof document !== 'undefined' && document.title) ? document.title : 'Biologic Chain DApp',
              description: 'Connect your wallet to Biologic Chain',
              url: (typeof window !== 'undefined' && window.location ? window.location.origin : 'https://example.com'),
              icons: [] as string[],
            };

            const retryProvider = await safeInitWalletConnectProvider({
              projectId: WALLETCONNECT_PROJECT_ID,
              chains: [11155111],
              showQrModal: true,
              metadata,
            });

            wcProviderRef = retryProvider;
            try {
              if (typeof wcProviderRef.on === 'function') {
                wcProviderRef.on('display_uri', (uri: string) => { try { (wcProviderRef as any).displayUri = uri; } catch (e) {} });
                wcProviderRef.on('displayUri', (uri: string) => { try { (wcProviderRef as any).displayUri = uri; } catch (e) {} });
              }
            } catch (e) {}

            // try to enable once more
            try {
              await (wcProviderRef as any).enable();
            } catch (retryErr) {
              console.error('WalletConnect retry after proposal expired failed:', retryErr);
              try { (wcProviderRef as any).disconnect?.(); } catch (e) {}
              wcProviderRef = null;
              provider = null;
              throw new Error('WalletConnect proposal expired — please refresh and try again.');
            }
          } catch (finalErr) {
            // surface as proposal expired to callers
            throw new Error('WalletConnect proposal expired — try reconnecting or refresh the page.');
          }
        }

        // Origin not allowed is returned by the relay when your site's origin is not in the project's Allowed Origins
        if (msg.toLowerCase().includes('origin not allowed') || msg.toLowerCase().includes('unauthorized: origin')) {
          try { (wcProviderRef as any).disconnect?.(); } catch (e) {}
          wcProviderRef = null;
          provider = null;
          console.error('WalletConnect origin rejected:', enableErr);
          throw new Error(`WalletConnect relay rejected this origin. Ensure the project ID (${WALLETCONNECT_PROJECT_ID}) is correct and add your app origin to the WalletConnect Cloud project's Allowed Origins (e.g. https://yourdomain.com).`);
        }
        throw enableErr;
      }

  provider = new ethers.BrowserProvider(wcProviderRef as any);
  // attempt to switch Network to desired chain if needed
  trySwitchNetworkIfNeeded(provider, wcProviderRef).catch(() => {});
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balanceBN = await provider.getBalance(address);

      const info = {
        isConnected: true,
        address,
        network: network.name,
        balance: ethers.formatEther(balanceBN),
        walletType: "walletconnect",
      } as WalletInfo;

      // persist last used wallet so we can attempt silent restore on reload
      try { localStorage.setItem('lastWallet', 'walletconnect'); } catch (e) {}

      return info;
    } catch (err: any) {
      // Log concise message and keep full details at debug level
      try {
        console.error('WalletConnect connection failed:', err?.message || String(err));
        console.debug('WalletConnect error (details):', err);
      } catch (logErr) {
        console.error('WalletConnect connection failed');
      }

      // Surface a clearer message for common WalletConnect errors
      const rawMsg = String(err?.message || '').toLowerCase();
      if (rawMsg.includes('proposal expired')) {
        throw new Error('WalletConnect proposal expired — try reconnecting or refresh the page.');
      }

      // Map relay/provider RPC internal errors (often -32603) to actionable guidance
      if (rawMsg.includes('no active wallet') || rawMsg.includes('no active session') || rawMsg.includes('no active connector') || rawMsg.includes('could not coalesce')) {
        throw new Error('No active wallet session found. Open your wallet app/extension and approve the connection. If using WalletConnect, ensure you accept the session proposal in your wallet app.');
      }

      if (rawMsg.includes('unauthorized') || rawMsg.includes('origin not allowed')) {
        throw new Error(`WalletConnect relay rejected this origin. Ensure the project ID (${WALLETCONNECT_PROJECT_ID}) is correct and add your app origin to the WalletConnect Cloud project's Allowed Origins.`);
      }

      if (err?.message?.includes('Unauthorized')) {
        throw new Error('WalletConnect failed: make sure your production domain is added to the WalletConnect Cloud console.');
      }

      throw new Error(err?.message || 'Failed to connect WalletConnect');
    }
  }

  // Browser wallets (MetaMask, Coinbase, TrustWallet)
  if (!window.ethereum) throw new Error(`${walletType} wallet not detected`);

  // Ensure the injected provider exposes a request interface (interactive wallet)
  // Some testing or mock environments may inject a minimal RPC endpoint that is not an interactive signer.
  // We prefer real injected wallets (MetaMask / Coinbase) that implement request/send methods.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawInjected = (window as any).ethereum as any;
  if (!rawInjected || typeof rawInjected.request !== 'function') {
    throw new Error(`${walletType} appears to be a non-interactive provider; please install or enable MetaMask/Coinbase Wallet`);
  }

  provider = new ethers.BrowserProvider(rawInjected);
  // attempt to switch Network to desired chain if needed
  trySwitchNetworkIfNeeded(provider, (window as any).ethereum).catch(() => {});

  // Prefer a silent accounts check first to avoid triggering permission prompts
  let accounts: string[] = [];
  try {
    try {
      // eth_accounts does not prompt the user; returns authorized accounts if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      accounts = (await provider.send('eth_accounts', [])) as string[];
    } catch (silentErr) {
      // Some providers may not implement eth_accounts via BrowserProvider; fall back to direct request
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accounts = ((window as any).ethereum?.request?.({ method: 'eth_accounts' }) || []) as string[];
      } catch (e) {
        accounts = [];
      }
    }

    if (!accounts || accounts.length === 0) {
      // No authorized accounts found silently; request interactively (user action expected)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        accounts = (await provider.send('eth_requestAccounts', [])) as string[];
      } catch (reqErr: any) {
        // Map common provider/relay errors to friendlier messages
        const msg = String(reqErr?.message || reqErr || 'Failed to request accounts');
        if (reqErr?.code === -32603 || msg.includes('PUBLIC_requestAccounts') || msg.toLowerCase().includes('could not coalesce')) {
          throw new Error('Failed to request account access from your wallet. Please open your wallet extension/app and approve the connection. If the problem persists, check that your wallet is unlocked and that its RPC/network settings match the application configuration.');
        }
        if (msg.includes('User rejected') || reqErr?.code === 4001) {
          throw new Error('Connection request rejected by user');
        }
        throw new Error(msg);
      }
    }

    if (!accounts || accounts.length === 0) throw new Error('No accounts found');
  } catch (finalErr) {
    // Bubble the error up with a clear message
    throw finalErr instanceof Error ? finalErr : new Error(String(finalErr));
  }

  const network = await provider.getNetwork();
  const balanceBN = await provider.getBalance(accounts[0]);
  try { localStorage.setItem('lastWallet', walletType); } catch (e) {}

  return {
    isConnected: true,
    address: accounts[0],
    network: network.name,
    balance: ethers.formatEther(balanceBN),
    walletType,
  };
}

/**
 * Try to restore a previously-used wallet connection without prompting the user.
 * For MetaMask this uses eth_accounts to avoid a permission prompt. For WalletConnect
 * it will initialize the provider and attempt enable() which should reconnect if
 * the provider has a stored session.
 */
export async function restoreConnection(): Promise<WalletInfo | null> {
  try {
    const last = (typeof window !== 'undefined') ? localStorage.getItem('lastWallet') : null;
    if (!last) return null;

    if (last === 'walletconnect') {
      // Initialize provider (will reuse in-flight init if present)
      try {
        await safeInitWalletConnectProvider({ projectId: WALLETCONNECT_PROJECT_ID, chains: [11155111], showQrModal: true, metadata: { name: (typeof document !== 'undefined' && document.title) ? document.title : 'Biologic Chain DApp', description: 'Connect your wallet to Biologic Chain', url: (typeof window !== 'undefined' && window.location ? window.location.origin : 'https://example.com'), icons: [] } });
      } catch (e) {
        // couldn't init provider
        return null;
      }

      try {
        // enable may reconnect silently if a session exists in storage
        // try a couple times with small delay to tolerate transient errors
        let restored = false;
        // First, try a silent eth_accounts RPC to see if a session exists without triggering a prompt
        try {
          const tmpProvider = new ethers.BrowserProvider(wcProviderRef as any);
          // eslint-disable-next-line no-console
          console.debug('[walletUtils] restoreConnection: trying eth_accounts via BrowserProvider');
          const accounts: string[] = await tmpProvider.send('eth_accounts', []) as string[];
          if (accounts && accounts.length > 0) {
            // eslint-disable-next-line no-console
            console.debug('[walletUtils] restoreConnection: eth_accounts returned', accounts);
            restored = true;
          }
        } catch (e) {
          // ignore and fall back to enable attempts
        }

        // If eth_accounts didn't work, check WalletConnect provider's session namespaces (v2)
        if (!restored) {
          try {
            const sess = (wcProviderRef as any).session;
            // eslint-disable-next-line no-console
            console.debug('[walletUtils] restoreConnection: provider.session =', sess);
            if (sess && sess.namespaces) {
              const accountsFromSession: string[] = [];
              try {
                Object.values(sess.namespaces).forEach((ns: any) => {
                  if (ns && Array.isArray(ns.accounts)) {
                    ns.accounts.forEach((acct: string) => {
                      // format is like 'eip155:1:0xabc...', extract the address
                      const parts = String(acct).split(':');
                      accountsFromSession.push(parts[parts.length - 1]);
                    });
                  }
                });
              } catch (e) {}
              if (accountsFromSession.length > 0) {
                // eslint-disable-next-line no-console
                console.debug('[walletUtils] restoreConnection: accounts from session', accountsFromSession);
                restored = true;
              }
            }
          } catch (e) {
            // ignore
          }
        }

        if (!restored) {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              // eslint-disable-next-line no-console
              console.debug('[walletUtils] restoreConnection: enable attempt', attempt + 1);
              await (wcProviderRef as any).enable();
              restored = true;
              break;
            } catch (e) {
              // eslint-disable-next-line no-console
              console.debug('[walletUtils] restoreConnection enable attempt failed', attempt + 1, e);
              await new Promise((r) => setTimeout(r, 300));
            }
          }
        }

        if (!restored) return null;
      } catch (e) {
        // failed to enable silently
        return null;
      }

  provider = new ethers.BrowserProvider(wcProviderRef as any);
  trySwitchNetworkIfNeeded(provider, wcProviderRef).catch(() => {});
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balanceBN = await provider.getBalance(address);

      return {
        isConnected: true,
        address,
        network: network.name,
        balance: ethers.formatEther(balanceBN),
        walletType: 'walletconnect',
      };
    }

    // MetaMask / injected wallets: use eth_accounts to avoid prompting the user
    if (last === 'metamask' || last === 'coinbase' || last === 'trustwallet') {
      if (!window.ethereum) return null;
      // use eth_accounts which does not prompt; returns authorized accounts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accounts: string[] = await (window.ethereum as any).request?.({ method: 'eth_accounts' }) || [];
      if (!accounts || accounts.length === 0) return null;
  provider = new ethers.BrowserProvider(window.ethereum as any);
  trySwitchNetworkIfNeeded(provider, (window as any).ethereum).catch(() => {});
      const network = await provider.getNetwork();
      const balanceBN = await provider.getBalance(accounts[0]);
      return {
        isConnected: true,
        address: accounts[0],
        network: network.name,
        balance: ethers.formatEther(balanceBN),
        walletType: last as WalletType,
      };
    }

    return null;
  } catch (e) {
    console.error('[walletUtils] restoreConnection failed', e);
    return null;
  }
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
  try { setGlobalWcProvider(null); } catch (e) {}
  // Clear any in-flight init promise so future attempts can re-init cleanly
  try { wcInitPromise = null; setGlobalWcInitPromise(null); } catch (e) {}
  provider = null;
  try { localStorage.removeItem('lastWallet'); } catch (e) {}
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
  const unsubscribers: Array<() => void> = [];

  // Injected wallets (MetaMask / Coinbase)
  try {
    if (window.ethereum && typeof window.ethereum.on === 'function') {
      window.ethereum.on('accountsChanged', onAccountsChanged);
      unsubscribers.push(() => window.ethereum.removeListener('accountsChanged', onAccountsChanged));
      window.ethereum.on('chainChanged', onChainChanged);
      unsubscribers.push(() => window.ethereum.removeListener('chainChanged', onChainChanged));
    }
  } catch (e) {
    // ignore
  }

  // WalletConnect provider events (if provider exists)
  try {
    if (wcProviderRef && typeof wcProviderRef.on === 'function') {
      // WalletConnect may emit accountsChanged or session_update depending on implementation
      const wcAccountsHandler = (accounts: string[] | any) => {
        try {
          if (Array.isArray(accounts)) onAccountsChanged(accounts as string[]);
          else if (accounts && (accounts as any).accounts) onAccountsChanged((accounts as any).accounts as string[]);
        } catch (e) {}
      };
      wcProviderRef.on('accountsChanged', wcAccountsHandler);
      unsubscribers.push(() => { try { wcProviderRef.removeListener('accountsChanged', wcAccountsHandler); } catch (e) {} });

      // session_update may include updated accounts
      const wcSessionHandler = (session: any) => {
        try {
          if (session && session.accounts) onAccountsChanged(session.accounts as string[]);
        } catch (e) {}
      };
      wcProviderRef.on('session_update', wcSessionHandler);
      unsubscribers.push(() => { try { wcProviderRef.removeListener('session_update', wcSessionHandler); } catch (e) {} });

      // chain / network changes
      const wcChainHandler = () => { try { onChainChanged(); } catch (e) {} };
      wcProviderRef.on('chainChanged', wcChainHandler);
      unsubscribers.push(() => { try { wcProviderRef.removeListener('chainChanged', wcChainHandler); } catch (e) {} });

      // disconnect -> notify and clear local stored wallet
      const wcDisconnectHandler = () => {
        try { localStorage.removeItem('lastWallet'); } catch (e) {}
        try { wcProviderRef = null; setGlobalWcProvider(null); } catch (e) {}
        // also notify accounts changed with empty array
        try { onAccountsChanged([]); } catch (e) {}
      };
      wcProviderRef.on('disconnect', wcDisconnectHandler);
      unsubscribers.push(() => { try { wcProviderRef.removeListener('disconnect', wcDisconnectHandler); } catch (e) {} });
    }
  } catch (e) {
    // ignore
  }

  return () => {
    unsubscribers.forEach((u) => {
      try { u(); } catch (e) {}
    });
  };
}
