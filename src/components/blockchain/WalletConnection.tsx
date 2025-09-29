import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useToast } from '@/hooks/use-toast';

const WalletConnection: React.FC = () => {
  const { 
    isConnected, 
    account, 
    network, 
    balance, 
    isLoading, 
    error,
    connectWallet, 
    disconnectWallet 
  } = useBlockchain();
  
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from MetaMask",
      });
    } catch (err: any) {
      toast({
        title: "Disconnect Failed",
        description: err.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  if (isConnected && account) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your MetaMask wallet is connected and ready to use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Account</label>
              <p className="text-sm font-mono">{formatAddress(account)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Network</label>
              <p className="text-sm">{network || 'Unknown'}</p>
            </div>
            {balance && (
              <div>
                <label className="text-sm font-medium text-gray-500">Balance</label>
                <p className="text-sm">{formatBalance(balance)} ETH</p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleDisconnect} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
            <Button 
              onClick={handleConnect} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to interact with the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        
        <Button 
          onClick={handleConnect} 
          disabled={isLoading || isConnecting}
          className="w-full flex items-center gap-2"
        >
          {isLoading || isConnecting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {isLoading || isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Make sure you have MetaMask installed and are connected to the correct network.</p>
          <p className="mt-1">For localhost development, use Chain ID: 31337</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
