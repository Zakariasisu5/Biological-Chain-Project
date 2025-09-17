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
  const { toast } = useToast();

  const handleConnect = async () => {
    let mounted = true;
    setIsConnecting(true);
    try {
      const info = await connectWallet(selectedWallet);
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

              {/* If we have a WalletConnect display URI, show Open in Wallet / Web fallback options */}
              {displayUri && (
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    // try deep link using a generic metamask scheme first
                    const deep = `metamask://wc?uri=${encodeURIComponent(displayUri)}`;
                    window.open(deep, '_blank');
                  }}>Open in Wallet App</Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const web = `https://walletconnect.com/wc?uri=${encodeURIComponent(displayUri)}`;
                    window.open(web, '_blank');
                  }}>Open WalletConnect Web</Button>
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
