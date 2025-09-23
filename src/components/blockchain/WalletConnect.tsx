// components/blockchain/WalletConnect.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Wallet, ExternalLink } from "lucide-react";
import { WalletInfo, connectWallet, disconnectWallet, WalletType, getWalletConnectDisplayUri } from "@/utils/walletUtils";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  walletInfo: WalletInfo;
  onWalletConnect: (info: WalletInfo) => void;
  onWalletDisconnect: () => void;
  className?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ walletInfo, onWalletConnect, onWalletDisconnect, className }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>("walletconnect");
  const [displayUri, setDisplayUri] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async () => {
    let mounted = true;
    setIsConnecting(true);
    try {
      setConnectError(null);
      // If using WalletConnect, proactively clear any stale provider/session to avoid
      // reusing an expired proposal which results in 'Proposal expired' errors.
      if (selectedWallet === 'walletconnect') {
        try { await disconnectWallet(); } catch (e) {}
      }

      // Connect but avoid hanging indefinitely — timeout after 25s
      const connectWithTimeout = (ms: number): Promise<WalletInfo> =>
        Promise.race([
          connectWallet(selectedWallet),
          new Promise((_, reject) => setTimeout(() => reject(new Error('WalletConnect timeout')), ms)),
        ]) as Promise<WalletInfo>;

      const info = await connectWithTimeout(25000);
      // try to read displayUri for WalletConnect (web fallback / QR)
      try {
        const d = getWalletConnectDisplayUri();
        setDisplayUri(d);
      } catch (e) {}
      if (mounted) {
        onWalletConnect(info);
        toast({ title: "Wallet Connected", description: info.address });
      }
    } catch (err: any) {
      // handle timeout specifically
      if (String(err?.message || err).toLowerCase().includes('walletconnect timeout') || String(err?.message || err).toLowerCase().includes('timeout')) {
        try { await disconnectWallet(); } catch (e) {}
        setDisplayUri(null);
        toast({ title: 'Connection Timeout', description: 'WalletConnect timed out. Ensure your wallet app is open and try again.', variant: 'destructive' });
        setConnectError('Connection timed out — try Reset or refresh.');
        return;
      }

      setConnectError(String(err?.message || err || 'Failed to connect'));
      // Provide a clearer message when mobile deep-linking isn't handled by the device/browser
      const msg = String(err?.message || err || 'Failed to connect');
      // If the WalletConnect proposal expired, clear provider to allow a fresh re-init
      if (msg.toLowerCase().includes('proposal expired')) {
        try { await disconnectWallet(); } catch (e) {}
        setDisplayUri(null);
        toast({ title: 'Connection Failed', description: 'WalletConnect proposal expired. Please try connecting again (open wallet app or scan QR).', variant: 'destructive' });
        return;
      }

      if (msg.includes('scheme does not have a registered handler') || msg.includes('No handler')) {
        // show a helpful toast and leave QR/fallback available in UI
        toast({ title: 'Open Wallet App', description: 'Your browser could not open the wallet app link. Use the QR or Open in Wallet button below.', variant: 'destructive' });
      } else {
        toast({ title: "Connection Failed", description: msg, variant: "destructive" });
      }
    } finally {
      if (mounted) setIsConnecting(false);
      mounted = false;
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onWalletDisconnect();
    toast({ title: "Disconnected", description: "Wallet disconnected" });
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
  <Card className={className}>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>Connect your wallet to manage health records</CardDescription>
      </CardHeader>
      <CardContent>
        {walletInfo.isConnected ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <span>{walletInfo.walletType}</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" /> Connected
              </Badge>
            </div>
            <p className="text-sm font-mono">{shortenAddress(walletInfo.address)}</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={handleDisconnect}>Disconnect</Button>
              <Button variant="outline" onClick={() => window.open(`https://etherscan.io/address/${walletInfo.address}`, "_blank")}>
                <ExternalLink className="h-4 w-4" /> View on Explorer
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
             
              <Button className="mt-2" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>

              {/* Persistent connect error panel: show connectError and displayUri copy/open actions */}
              {(connectError || displayUri) && (
                <div className="p-3 mt-3 border rounded bg-red-50 border-red-100">
                  {connectError && (
                    <div className="text-sm text-red-800 mb-2">{connectError}</div>
                  )}
                  {displayUri && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono truncate">{displayUri}</span>
                      <Button size="sm" variant="outline" onClick={() => {
                        navigator.clipboard?.writeText(displayUri);
                        toast({ title: 'Copied', description: 'WalletConnect URI copied to clipboard' });
                      }}>Copy</Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const web = `https://walletconnect.com/wc?uri=${encodeURIComponent(displayUri)}`;
                        window.open(web, '_blank');
                      }}>Open Web</Button>
                    </div>
                  )}
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      try {
                        await disconnectWallet();
                      } catch (e) {}
                      setDisplayUri(null);
                      setConnectError(null);
                      toast({ title: 'Reset', description: 'WalletConnect reset — try connecting again.' });
                    }}>Reset WalletConnect</Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
