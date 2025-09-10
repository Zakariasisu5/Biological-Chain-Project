import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Key, UploadCloud, Wallet, ExternalLink, Info } from 'lucide-react';
import { WalletInfo, connectWallet, disconnectWallet, isWalletInstalled, WalletType } from '@/utils/walletUtils';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/utils/activityTracker';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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
  className 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  type ExtendedWalletType = WalletType | 'walletconnect';
  const [selectedWalletType, setSelectedWalletType] = useState<ExtendedWalletType>('walletconnect');
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();

  // Make the page use dark theme while this component is mounted
  useEffect(() => {
    try {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } catch (e) {
      // no-op if running in environment without document
    }
    return () => {
      try {
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('theme');
      } catch (e) {}
    };
  }, []);

  const walletOptions: { value: WalletType; label: string; icon: React.ReactNode; installUrl?: string }[] = [
    { 
      value: 'metamask', 
      label: 'MetaMask', 
      installUrl: 'https://metamask.io/download/',
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M383.4 32H128.6C80.7 32 48 74.5 48 122.2v267.6C48 437.5 80.7 480 128.6 480h254.8c47.9 0 80.6-42.5 80.6-90.2V122.2C464 74.5 431.3 32 383.4 32zM221.7 348c-1.7 1.9-4.7 3.9-7.8 3.9c-5.4 0-9.8-4.4-9.8-9.7c0-3.1 2-6.1 3.9-7.8l60.8-60.7l-60.8-60.8c-1.9-1.7-3.9-4.7-3.9-7.8c0-5.4 4.4-9.7 9.8-9.7c3.1 0 6.1 2 7.8 3.9L295 272l-73.3 76z"/>
            </svg>
    },
    { 
      value: 'coinbase', 
      label: 'Coinbase Wallet',
      installUrl: 'https://www.coinbase.com/wallet',
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M260.7 254.3c0-4-1-7-3-10a13.96 13.96 0 0 0-7-6.3c-3-1.3-6.3-1.9-9.7-1.9c-3.5 0-6.7.7-9.7 2a15.18 15.18 0 0 0-7 6.4c-2 2.8-3 6-3 9.8c0 3.5 1 6.6 3 9.3a15.72 15.72 0 0 0 7 6.3c3 1.4 6.2 2 9.7 2c3.4 0 6.6-.7 9.7-2a15.3 15.3 0 0 0 7-6.2c2-2.7 3-5.8 3-9.4z"/>
              <path d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224s224-100.3 224-224S379.7 32 256 32zm50 322.8h-99.9v-28.7h99.9v28.7zm1.8-110.7c-3.8 9-9.1 16-15.7 21.9c-6.7 5.9-14.2 10.3-22.7 13.3c-8.6 2.9-17.3 4.5-26.3 4.5v43H215v-43c-8.9 0-17.6-1.5-26.1-4.5c-8.5-3-16-7.4-22.5-13.3c-6.6-5.9-11.8-12.9-15.6-21.9c-3.8-8.9-5.7-19-5.7-30.1c0-11 1.9-21.1 5.7-30c3.8-9 9-16 15.6-21.9c6.5-5.9 14-10.3 22.5-13.3c8.5-3 17.1-4.5 26.1-4.5V120h28.1v25c8.9 0 17.7 1.5 26.3 4.5c8.5 3 16 7.4 22.7 13.3c6.7 5.9 11.9 12.9 15.7 21.9c3.8 8.9 5.7 19 5.7 30c0 11.1-1.9 21.1-5.7 30.1z"/>
            </svg>
    },
    { 
      value: 'walletconnect', 
      label: 'WalletConnect', 
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M256 48c-110.5 0-200 89.5-200 200s89.5 200 200 200s200-89.5 200-200S366.5 48 256 48zm0 89.3c31.8 0 63.5 12.1 87.8 36.4c1.4 1.4 1.4 3.6 0 5l-26.4 26.4c-.7.7-1.8.7-2.5 0c-16.9-16.9-39.2-26.2-59-26.2c-19.7 0-42.1 9.3-59 26.2c-.7.7-1.8.7-2.5 0l-26.4-26.4c-1.4-1.4-1.4-3.6 0-5c24.3-24.3 56.1-36.4 87.8-36.4h.2zm-129.2 68.4c0-.8.3-1.6.9-2.1l26.4-26.4c.7-.7 1.8-.7 2.5 0c16.9 16.9 39.2 26.3 59 26.3c19.8 0 42.1-9.4 59-26.3c.7-.7 1.8-.7 2.5 0l26.4 26.4c.6.6.9 1.3.9 2.1c0 .8-.3 1.6-.9 2.1c-32.3 32.1-74.9 49.8-120.4 49.8c-45.2 0-88-17.6-120.3-49.8c-.6-.5-1-1.3-1-2.1z"/>
            </svg>
    },
    { 
      value: 'trustwallet', 
      label: 'Trust Wallet',
      installUrl: 'https://trustwallet.com/download',
      icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M374.1 92.1C358 75.9 336.3 64 312 64c-24.3 0-46 11.9-62.1 28.1C164.8 95.7 96 177 96 273.2c0 81.3 56.8 126.6 120.2 126.6c29.9 0 53.9-9.7 70.8-27c17.5 17.8 41.6 27 68.2 27c63.4 0 120-45.3 120-126.6c0-96.1-68.9-177.3-201.1-181.1zm10 221.8c0 21.5-15.4 38.1-34.9 38.1c-19.5 0-34.7-16.6-34.7-38.1c0-21.5 15.2-38.1 34.7-38.1c19.5 0 34.9 16.6 34.9 38.1zm-152.2 0c0 21.5-15.4 38.1-34.9 38.1s-34.7-16.6-34.7-38.1c0-21.5 15.2-38.1 34.7-38.1s34.9 16.6 34.9 38.1z"/>
            </svg>
    }
  ];

  // implemented helpers and handlers
  function getWalletName(walletType: string): string {
    const opt = walletOptions.find(w => w.value === (walletType as WalletType));
    return opt ? opt.label : String(walletType);
  }

  function shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function viewOnExplorer(): void {
    if (!walletInfo?.address) {
      toast({ title: 'No address', description: 'No wallet address to view on explorer', variant: 'destructive' });
      return;
    }
    const url = `https://etherscan.io/address/${walletInfo.address}`;
    window.open(url, '_blank', 'noopener');
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const info = await connectWallet(selectedWalletType as WalletType);
      onWalletConnect(info);
      toast({
        title: "Wallet Connected",
        description: `Connected: ${shortenAddress(info.address)}`,
        variant: "default"
      });
      trackActivity('connect_wallet', '/blockchain', {
        address: info.address,
        network: info.network,
        chainId: info.chainId,
        walletType: selectedWalletType
      });
    } catch (error: any) {
      console.error('connect error', error);
      toast({
        title: "Connection Failed",
        description: error?.message || 'Failed to connect wallet',
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (e) {
      console.warn('disconnect failed', e);
    }
    onWalletDisconnect();
    toast({ title: 'Disconnected', description: 'Wallet disconnected', variant: 'default' });
  };

  function renderWalletSelector(): React.ReactNode {
    return (
      <TooltipProvider>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Select value={selectedWalletType} onValueChange={(v) => setSelectedWalletType(v as ExtendedWalletType)}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {walletOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className="opacity-90">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleConnectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedWalletType('walletconnect')}>
              Use WalletConnect
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const opt = walletOptions.find(o => o.value === selectedWalletType);
              if (opt?.installUrl) window.open(opt.installUrl, '_blank', 'noopener');
              else toast({ title: 'Install Wallet', description: 'Please install the selected wallet or use WalletConnect', variant: 'default' });
            }}>
              Install / Help
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              If a browser extension isn't available, use WalletConnect to connect via QR or mobile wallet.
            </AlertDescription>
          </Alert>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your wallet to manage health records</CardDescription>
        </div>
        <Wallet className="h-5 w-5 text-health-purple" />
      </CardHeader>
      <CardContent>
        {walletInfo.isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {walletOptions.find(w => w.value === walletInfo.walletType)?.icon}
                  <span>{getWalletName(walletInfo.walletType)}</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground">
                  {shortenAddress(walletInfo.address)}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <Check className="h-3 w-3 mr-1" /> Connected
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">{walletInfo.network}</span>
                
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium">{parseFloat(walletInfo.balance || '0').toFixed(4)} ETH</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={viewOnExplorer}
              >
                <ExternalLink className="h-4 w-4" />
                View on Explorer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
              >
                <UploadCloud className="h-4 w-4" />
                Backup Data
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm">Connect your blockchain wallet to securely manage your health records.</p>
            {renderWalletSelector()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
