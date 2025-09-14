/// <reference types="vite/client" />

import type { Eip1193Provider as BaseEip1193Provider } from "@metamask/providers";

declare global {
  /**
   * Extend the base Eip1193Provider type with optional event methods
   */
  interface ExtendedEip1193Provider extends BaseEip1193Provider {
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  }

  interface Window {
    ethereum?: ExtendedEip1193Provider & {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
    };
  }
}

export {};
