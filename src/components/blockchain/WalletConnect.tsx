// components/WalletConnect.tsx
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Alert, AlertDescription,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  TooltipProvider
} from '@/components/ui';
import { Check, Wallet, UploadCloud, ExternalLink } from 'lucide-react';
import { WalletInfo, connectWallet, disconnectWallet, WalletType } from '@/utils/walletUtils';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/utils/activityTracker';

interface WalletConnectProps {
  walletInfo: WalletInfo;
  onWalletConnect: (info: WalletInfo) => void;
  onWalletDisconnect: () => void;
  className?: string;
}

type ExtendedWalletType = WalletType;

const WalletConnect: React.FC<WalletConnectProps> = ({
  walletInfo,
  onWalletConnect,
  onWalletDisconnect,
  className
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<ExtendedWalletType>('walletconnect');
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    return () => {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    };
  }, []);

  const walletOptions = [
    { value: 'metamask', label: 'MetaMask', installUrl: 'https://metamask.io/download/', icon: <Wallet /> },
    { value: 'coinbase', label: 'Coinbase Wallet', installUrl: 'https://www.coinbase.com/wallet', icon: <Wallet /> },
    { value: 'walletconnect', label: 'WalletConnect', icon: <Wallet /> },
    { value: 'trustwallet', label: 'Trust Wallet', installUrl: 'https://trustwallet.com/download', icon: <Wallet /> }
  ];

  const shortenAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const viewOnExplorer = () => {
    if (!walletInfo?.address) {
      toast({ title: 'No address', description: 'No wallet address available', variant: 'destructive' });
      return;
    }
    window.open(`https://etherscan.io/address/${walletInfo.address}`, '_blank', 'noopener');
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const info = await connectWallet(selectedWalletType);
      onWalletConnect(info);
      toast({
        title: 'Wallet Connected',
        description: `Connected: ${shortenAddress(info.address)}`
      });
      trackActivity('connect_wallet', '/blockchain', {
        address: info.address,
        network: info.network,
        chainId: info.chainId,
        walletType: selectedWalletType
      });
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error?.message || 'Failed to connect wallet',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onWalletDisconnect();
    toast({ title: 'Disconnected', description: 'Wallet disconnected' });
    trackActivity('disconnect_wallet', '/blockchain', {});
  };

  const renderWalletSelector = () => (
    <TooltipProvider>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Select value={selectedWalletType} onValueChange={v => setSelectedWalletType(v as ExtendedWalletType)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {walletOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">{opt.icon}{opt.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleConnectWallet} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedWalletType('walletconnect')}>Use WalletConnect</Button>
          <Button variant="outline" size="sm" onClick={() => {
            const opt = walletOptions.find(o => o.value === selectedWalletType);
            if (opt?.installUrl) window.open(opt.installUrl, '_blank', 'noopener');
            else toast({ title: 'Install Wallet', description: 'Please install the selected wallet or use WalletConnect' });
          }}>Install / Help</Button>
        </div>

        <Alert>
          <AlertDescription>Use WalletConnect if a browser extension isn't available.</AlertDescription>
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
                  {walletOptions.find(w => w.value === walletInfo.walletType)?.icon}
                  <span>{walletInfo.walletType}</span>
                </div>
                <p className="text-sm font-mono text-muted-foreground">{shortenAddress(walletInfo.address)}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <Check className="h-3 w-3 mr-1" /> Connected
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Network:</span><span className="font-medium">{walletInfo.network}</span>
              <span className="text-muted-foreground">Balance:</span><span className
