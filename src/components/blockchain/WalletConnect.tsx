// components/blockchain/WalletConnect.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Wallet, ExternalLink } from "lucide-react";
import { WalletInfo, connectWallet, disconnectWallet, WalletType } from "@/utils/walletUtils";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  walletInfo: WalletInfo;
  onWalletConnect: (info: WalletInfo) => void;
  onWalletDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ walletInfo, onWalletConnect, onWalletDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>("walletconnect");
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const info = await connectWallet(selectedWallet);
      onWalletConnect(info);
      toast({ title: "Wallet Connected", description: info.address });
    } catch (err: any) {
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onWalletDisconnect();
    toast({ title: "Disconnected", description: "Wallet disconnected" });
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <Card>
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
            <div className="flex gap-2">
              <Button onClick={() => setSelectedWallet("metamask")}>MetaMask</Button>
              <Button onClick={() => setSelectedWallet("walletconnect")}>WalletConnect</Button>
            </div>
            <Button className="mt-2" onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
