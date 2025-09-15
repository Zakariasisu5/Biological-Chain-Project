// components/blockchain/WalletConnect.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Wallet, ExternalLink, UploadCloud } from "lucide-react";
import { WalletInfo, connectWallet, disconnectWallet, WalletType } from "@/utils/walletUtils";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletConnectProps {
  walletInfo: WalletInfo;
  onWalletConnect: (info: WalletInfo) => void;
  onWalletDisconnect: () => void;
  className?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  walletInfo,
  onWalletConnect,
  onWalletDisconnect,
  className,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>("walletconnect");
  const { toast } = useToast();

  const walletOptions: { value: WalletType; label: string; installUrl?: string; icon: React.ReactNode }[] = [
    { value: "metamask", label: "MetaMask", installUrl: "https://metamask.io/download/", icon: <Wallet /> },
    { value: "coinbase", label: "Coinbase Wallet", installUrl: "https://www.coinbase.com/wallet", icon: <Wallet /> },
    { value: "walletconnect", label: "WalletConnect", icon: <Wallet /> },
    { value: "trustwallet", label: "Trust Wallet", installUrl: "https://trustwallet.com/download", icon: <Wallet /> },
  ];

  const shortenAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const info = await connectWallet(selectedWalletType);
      onWalletConnect(info);
      toast({
        title: "Wallet Connected",
        description: `Connected: ${shortenAddress(info.address)}`,
      });
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err?.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch {}
    onWalletDisconnect();
    toast({ title: "Disconnected", description: "Wallet disconnected" });
  };

  const viewOnExplorer = () => {
    if (!walletInfo.address) {
      toast({ title: "No address", description: "No wallet address available", variant: "destructive" });
      return;
    }
    window.open(`https://etherscan.io/address/${walletInfo.address}`, "_blank", "noopener");
  };

  return (
    <Card className={className}>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your wallet to manage health records</CardDescription>
        </div>
        <Wallet className="h-5 w-5 text-health-purple" />
      </CardHeader>
      <CardContent>
        {walletInfo.isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {walletOptions.find((w) => w.value === walletInfo.walletType)?.icon}
                  <span>{walletInfo.walletType}</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground">{shortenAddress(walletInfo.address)}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <Check className="h-3 w-3 mr-1" /> Connected
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">{walletInfo.network}</span>
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">{parseFloat(walletInfo.balance || "0").toFixed(4)} ETH</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={viewOnExplorer}>
                <ExternalLink className="h-4 w-4" /> View on Explorer
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <UploadCloud className="h-4 w-4" /> Backup Data
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm">Connect your blockchain wallet to securely manage your health records.</p>
            <TooltipProvider>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Select value={selectedWalletType} onValueChange={(v) => setSelectedWalletType(v as WalletType)}>
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {walletOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">{opt.icon}{opt.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleConnectWallet} disabled={isConnecting}>
                    {isConnecting ? "Connecting..." : "Connect"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const opt = walletOptions.find((o) => o.value === selectedWalletType);
                    if (opt?.installUrl) window.open(opt.installUrl, "_blank", "noopener");
                  }}>
                    Install / Help
                  </Button>
                </div>
                <Alert>
                  <AlertDescription>Use WalletConnect if a browser extension isn't available.</AlertDescription>
                </Alert>
              </div>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
