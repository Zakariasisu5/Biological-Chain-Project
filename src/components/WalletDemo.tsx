import React from "react";
import { useWallet } from "../hooks/useWallet";

export default function WalletDemo() {
  const { wallet, connectMetaMask, connectWalletConnect } = useWallet();

  return (
    <div className="p-4">
      <button
        onClick={connectMetaMask}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Connect MetaMask
      </button>

      <button
        onClick={connectWalletConnect}
        className="ml-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        Connect WalletConnect
      </button>

      {wallet.account && (
        <div className="mt-4">
          <p><strong>Account:</strong> {wallet.account}</p>
          <p><strong>Chain ID:</strong> {wallet.chainId}</p>
        </div>
      )}
    </div>
  );
}
