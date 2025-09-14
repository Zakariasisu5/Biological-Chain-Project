import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Key, UploadCloud, Wallet, ExternalLink } from 'lucide-react';
import { WalletInfo, connectWallet, disconnectWallet, WalletType } from '@/utils/walletUtils';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/utils/activityTracker';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadFileToIPFS } from '@/hooks/ipfs';
import { useBlockchain } from '@/hooks/blockchain';

interface WalletConnectProps {
  walletInfo: WalletInfo;
  onWalletConnect: (info: WalletInfo) => void;
  onWalletDisconnect: () => void;
  className?: string;
  onUploadSuccess?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  walletInfo,
  onWalletConnect,
  onWalletDisconnect,
  className,
  onUploadSuccess
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('walletconnect');
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();
  const { contract } = useBlockchain();

  // Dark theme while mounted
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    return () => {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    };
  }, []);

  const walletOptions: { value: WalletType; label: string; icon: React.ReactNode; installUrl?: string }[] = [
    { value: 'metamask', label: 'MetaMask', installUrl: 'https://metamask.io/download/', icon: <Wallet className="h-4 w-4" /> },
    { value: 'coinbase', label: 'Coinbase Wallet', installUrl: 'https://www.coinbase.com/wallet', icon: <Wallet className="h-4 w-4" /> },
    { value: 'walletconnect', label: 'WalletConnect', icon: <Wallet className="h-4 w-4" /> },
    { value: 'trustwallet', label: 'Trust Wallet', installUrl: 'https://trustwallet.com/download', icon: <Wallet className="h-4 w-4" /> }
  ];

  const getWalletName = (walletType: string) => {
    const opt = walletOptions.find(w => w.value === walletType);
    return opt ? opt.label : String(walletType);
  };

  const shortenAddress = (address: string) => address ? `${address.slice(0,6)}...${address.slice(-4)}` : '';

  const viewOnExplorer = () => {
    if (!walletInfo.address) return toast({ title: 'No address', description: 'No wallet connected', variant: 'destructive' });
    window.open(`https://etherscan.io/address/${walletInfo.address}`, '_blank', 'noopener');
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const info = await connectWallet(selectedWalletType);
      onWalletConnect(info);
      toast({ title: 'Wallet Connected', description: `Connected: ${shortenAddress(info.address)}` });
      trackActivity('connect_wallet', '/blockchain', { address: info.address, network: info.network, chainId: info.chainId, walletType: selectedWalletType });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Connection Failed', description: err?.message || 'Failed to connect wallet', variant: 'destructive' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try { await disconnectWallet(); } catch (e) { console.warn('Disconnect failed', e); }
    onWalletDisconnect();
    toast({ title: 'Disconnected', description: 'Wallet disconnected' });
  };

  const handleFileUpload = async (file: File) => {
    if (!walletInfo.isConnected || !contract) {
      return toast({ title: 'Wallet not connected', description: 'Connect your wallet first', variant: 'destructive' });
    }
    try {
      toast({ title: 'Uploading file...', description: 'Please wait...' });
      const cid = await uploadFileToIPFS(file);
      const tx = await contract.addRecord(file.name, cid);
      await tx.wait();
      toast({ title: 'Success', description: 'File uploaded to IPFS and added on-chain' });
      trackActivity('upload_document', '/profile/documents', { name: file.name, cid });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    }
  };

  const renderWalletSelector = () => (
    <TooltipProvider>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Select value={selectedWalletType} onValueChange={v => setSelectedWalletType(v as WalletType)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {walletOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <span>{opt.icon}</span>
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
          <Button variant="ghost" size="sm" onClick={() => setSelectedWalletType('walletconnect')}>Use WalletConnect</Button>
          <Button variant="outline" size="sm" onClick={() => {
            const opt = walletOptions.find(o => o.value === selectedWalletType);
            if (opt?.installUrl) window.open(opt.installUrl, '_blank', 'noopener');
            else toast({ title: 'Install Wallet', description: 'Please install the selected wallet', variant: 'default' });
          }}>Install / Help</Button>
        </div>

        <Alert>
          <AlertDescription>If a browser extension isn't available, use WalletConnect to connect via QR or mobile wallet.</AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  );

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
                <p className="text-sm font-mono text-muted-foreground">{shortenAddress(walletInfo.address)}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><Check className="h-3 w-3 mr-1" /> Connected</Badge>
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
              <Button variant="outline" size="sm" className="gap-1" onClick={viewOnExplorer}><ExternalLink className="h-4 w-4" />View on Explorer</Button>
              
              {/* File Upload */}
              <input type="file" id="file-upload" className="hidden" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" className="gap-1"><UploadCloud className="h-4 w-4 mr-1" />Upload Document</Button>
              </label>

              <Button variant="destructive" size="sm" onClick={handleDisconnect}>Disconnect</Button>
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
