
import { Buffer as BufferPolyfill } from 'buffer';
import { inherits } from 'util';

// Define process first to ensure it's available globally before any imports
if (typeof window !== 'undefined') {
  // @ts-ignore - We need to ignore TypeScript here since we're creating a custom process object
  window.process = window.process || {
    env: {},
    version: '', 
    versions: {},
    nextTick: (callback: Function) => {
      setTimeout(callback, 0);
    },
    platform: 'browser'
  };
}

// Polyfill for "global" required by WalletConnect
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
}

// Polyfill for Node.js buffer
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Buffer = window.Buffer || BufferPolyfill;
}

// Polyfill for Node.js util.inherits
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.util = window.util || {};
  // @ts-ignore
  window.util.inherits = window.util.inherits || inherits || function(ctor, superCtor) {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  };
}
