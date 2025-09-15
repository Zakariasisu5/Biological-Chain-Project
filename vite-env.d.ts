/// <reference types="vite/client" />

interface EthereumProviderWithRequest {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isTrust?: boolean;
  request?: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProviderWithRequest;
  }
}

export {};
