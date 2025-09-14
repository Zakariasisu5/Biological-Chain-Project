import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Check, Wallet, UploadCloud, ExternalLink } from "lucide-react";
import {
  WalletInfo,
  connectWallet,
  disconnectWallet,
  WalletType,
} from "@/utils/walletUtils";
import { useToast } from "@/hooks/use-toast";
import { useActivityTracker } from "@/utils/activityTracker";

interface WalletConnectProps {
  walletInfo: WalletInfo;
  onWalletConnect: (info: WalletInfo) => void;
  onWalletDisconnect: () => void;
  className?: string;
}

export default function WalletConnect({
  walletInfo,
  onWalletConnect,
  onWalletDisconnect,
  className,
}: WalletConnectProps) {
  // Detect MetaMask
  const hasMetaMask =
    typeof window !== "undefined" && Boolean((window as any).ethereum?.isMetaMask);

  // Default selection
  const defaultType: WalletType = hasMetaMask ? "metamask" : "walletconnect";

  const [isConnecting, setIsConnecting] = useState(false);
  const [selected, setSelected] = useState<WalletType>(defaultType);
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();

  // Force dark theme
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    return () => {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("theme");
    };
  }, []);

  const walletOptions: {
    value: WalletType;
    label: string;
    installUrl?: string;
    icon: React.ReactNode;
    disabled?: boolean;
  }[] = [
    {
      value: "metamask",
      label: "MetaMask",
      installUrl: "https://metamask.io/download/",
      icon: <Wallet />,
      disabled: !hasMetaMask,
    },
    {
      value: "coinbase",
      label: "Coinbase Wallet",
      installUrl: "https://www.coinbase.com/wallet",
      icon: <Wallet />,
    },
    {
      value: "walletconnect",
      label: "WalletConnect",
      icon: <Wallet />,
    },
    {
      value: "trustwallet",
      label: "Trust Wallet",
      installUrl: "https://trustwallet.com/download",
      icon: <Wallet />,
    },
  ];

  const shorten = (addr: string) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  const viewExplorer = () => {
    if (!walletInfo.address) {
      toast({
        title: "No address",
        description: "No wallet address available",
        variant: "destructive",
      });
      return;
    }
    window.open(`https://etherscan.io/address/${walletInfo.address}`, "_blank", "noopener");
  };

  async function handleConnect() {
    // redirect if MetaMask missing
    if (selected === "metamask" && !hasMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
      toast({
        title: "Install MetaMask",
        description: "Redirecting to MetaMask download page",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const info = await connectWallet(selected);
      onWalletConnect(info);
      toast({
        title: "Wallet Connected",
        description: shorten(info.address),
      });
      trackActivity("connect_wallet", "/blockchain", {
        address: info.address,
        network: info.network,
        chainId: info.chainId,
        walletType: info.walletType,
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
  }

  async function handleDisconnect() {
    await disconnectWallet();
    onWalletDisconnect();
    toast({ title: "Disconnected", description: "Wallet disconnected" });
    trackActivity("disconnect_wallet", "/blockchain", {});
  }

  const renderSelector = () => (
    <TooltipProvider>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Select value={selected} onValueChange={(v) => setSelected(v as WalletType)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {walletOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                  <div className="flex items-center gap-2">{opt.icon}{opt.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelected("walletconnect")}>
            Use WalletConnect
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const opt = walletOptions.find((o) => o.value === selected);
              if (opt?.installUrl) window.open(opt.installUrl, "_blank");
              else
                toast({
                  title: "Install Wallet",
                  description: "Please install the selected wallet or use WalletConnect",
                });
            }}
          >
            Install / Help
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            Use WalletConnect if a browser extension isn’t available.
          </AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  );

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
                  {
                    walletOptions.find((w) => w.value === walletInfo.walletType)
                      ?.icon
                  }
                  <span>{walletInfo.walletType}</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground">
                  {shorten(walletInfo.address)}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <Check className="h-3 w-3 mr-1" /> Connected
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">{walletInfo.network}</span>
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">
                {parseFloat(walletInfo.balance).toFixed(4)} ETH
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={viewExplorer}
              >
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
            <p className="text-sm">
              Connect your blockchain wallet to securely manage your health records.
            </p>
            {renderSelector()}
          </div>
        )}
      </CardContent>
    </Card>
  );
                    }
