import React, { useState } from 'react';
import { Bell, Search, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockAlerts } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { AlertData } from '@/lib/types';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useWalletContext } from '@/contexts/WalletContext';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeNotifications, setActiveNotifications] = useState<AlertData[]>(
    mockAlerts.filter(alert => !alert.resolved).slice(0, 2)
  );

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  const handleViewAllAlerts = () => {
    navigate('/alerts');
  };

  const handleDismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'critical':
        return <span className="h-2 w-2 rounded-full bg-health-red mr-2"></span>;
      case 'warning':
        return <span className="h-2 w-2 rounded-full bg-health-orange mr-2"></span>;
      case 'info':
        return <span className="h-2 w-2 rounded-full bg-health-blue mr-2"></span>;
      default:
        return null;
    }
  };

  return (
    <header className="flex justify-between items-center h-14 md:h-16 px-3 sm:px-6 border-b bg-background">
      <div className="flex items-center gap-2">
        {children}
        
        {!isMobile && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-8 bg-background"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1 sm:gap-4">
  <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {activeNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-health-red text-white text-[10px] flex items-center justify-center">
                  {activeNotifications.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <Badge variant="outline" className="text-xs">
                  {activeNotifications.length} new
                </Badge>
              </div>
            </div>
            {activeNotifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {activeNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-3 border-b hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex items-center mt-1">
                          {getAlertIcon(notification.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {notification.type === 'critical' ? 'Critical Alert' : 
                             notification.type === 'warning' ? 'Warning' : 'Information'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleDismissNotification(notification.id)}
                      >
                        <span className="sr-only">Dismiss</span>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            )}
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-center justify-center"
                onClick={handleViewAllAlerts}
              >
                View all alerts
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="" />
              <AvatarFallback>{currentUser?.name?.charAt(0) || 'JD'}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{currentUser?.name || 'John Doe'}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.plan || 'Premium'} Plan</p>
              </div>
              <Button variant="ghost" size="sm" className="justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>

        {/* Wallet connect button */}
        <WalletConnectButton />
      </div>
    </header>
  );
};

export default Header;

function WalletConnectButton() {
  const { wallet, connectMetaMask, connectWalletConnect, disconnect } = useWalletContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const shortAddress = wallet.account ? `${wallet.account.slice(0, 6)}...${wallet.account.slice(-4)}` : null;

  const onConnectMetaMask = async () => {
    setLoading(true);
    try {
      // If no injected provider, guide user to install MetaMask
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasInjected = typeof (window as any).ethereum !== 'undefined';
      if (!hasInjected) {
        try {
          toast({ title: 'MetaMask not detected', description: 'Install MetaMask to connect with a browser wallet.' });
        } catch (e) {}
        // open MetaMask download page in a new tab
        try { window.open('https://metamask.io/download.html', '_blank'); } catch (e) {}
        return;
      }

      await connectMetaMask();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onConnectWalletConnect = async () => {
    setLoading(true);
    try {
      await connectWalletConnect();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onDisconnect = async () => {
    setLoading(true);
    try {
      await disconnect();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={wallet.account ? 'secondary' : 'default'} size="sm" disabled={loading}>
            {loading ? 'Connecting...' : (wallet.account ? shortAddress : 'Connect Wallet')}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 p-2">
          {!wallet.account ? (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onConnectMetaMask}
                disabled={loading}
              >
                Connect MetaMask
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onConnectWalletConnect}
                disabled={loading}
              >
                Connect WalletConnect
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => navigator.clipboard?.writeText(wallet.account || '')}
              >
                Copy Address
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={onDisconnect}
                disabled={loading}
              >
                Disconnect
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
