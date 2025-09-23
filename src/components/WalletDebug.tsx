import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getProvider, getWalletConnectDisplayUri, restoreConnection, disconnectWallet } from '@/utils/walletUtils';

export default function WalletDebug() {
  const [output, setOutput] = useState<string>('');

  const dumpState = () => {
    try {
      const last = (() => { try { return localStorage.getItem('lastWallet'); } catch (e) { return null } })();
      const keys = Object.keys(localStorage).slice(0, 200).map(k => `${k}: ${String(localStorage.getItem(k))}`).join('\n');
      const provider = getProvider();
      // try to read provider.session if present
      let session = null;
      try { session = (provider as any)?._ethProvider?.session || (provider as any)?.session || null; } catch (e) { session = null }
      const displayUri = getWalletConnectDisplayUri();
      setOutput(`lastWallet=${last}\n---localStorage keys---\n${keys}\n---provider---\n${provider ? 'present' : 'null'}\n---provider.session---\n${session ? JSON.stringify(session, null, 2) : 'none'}\n---displayUri---\n${displayUri || 'none'}`);
    } catch (e: any) {
      setOutput(String(e));
    }
  };

  const runRestore = async () => {
    setOutput('running restoreConnection()...');
    try {
      const info = await restoreConnection();
      setOutput('restoreConnection result:\n' + JSON.stringify(info, null, 2));
    } catch (e) {
      setOutput('restoreConnection error:\n' + String(e));
    }
  };

  const runDisconnect = async () => {
    try {
      await disconnectWallet();
      setOutput('disconnectWallet() called');
    } catch (e) {
      setOutput('disconnect error: ' + String(e));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Wallet Debug</h2>
      <div className="flex gap-2 mb-4">
        <Button onClick={dumpState}>Dump Local State</Button>
        <Button onClick={runRestore}>Run restoreConnection()</Button>
        <Button variant="destructive" onClick={runDisconnect}>Disconnect</Button>
      </div>
      <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded border">{output}</pre>
    </div>
  );
}
