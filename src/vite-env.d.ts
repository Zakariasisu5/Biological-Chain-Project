/// <reference types="vite/client" />

import type { ExternalProvider } from "@ethersproject/providers";

declare global {
  interface EthereumProviderWithRequest extends ExternalProvider {
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    isTrust?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<any>;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  }

  interface Window {
    ethereum?: EthereumProviderWithRequest;
  }
}
