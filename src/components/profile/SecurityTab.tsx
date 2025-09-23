
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, AlertCircle, CreditCard, Wallet, Check, ArrowRight } from 'lucide-react';
import { WalletInfo, connectWallet, defaultWalletInfo, disconnectWallet } from '@/utils/walletUtils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface SecurityTabProps {
  isEditing: boolean;
  currentUser: any;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ isEditing, currentUser }) => {
  const { toast } = useToast();
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(defaultWalletInfo);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Premium' | 'Enterprise'>(
    currentUser?.plan || 'Premium'
  );

  // Plans configuration
  const subscriptionPlans = [
    { 
      name: 'Basic', 
      price: '$9.99/month', 
      features: ['Basic health data tracking', 'Access to Blockchain verification', '3 verified records per month'] 
    },
    { 
      name: 'Premium', 
      price: '$19.99/month', 
      features: ['Unlimited health data tracking', 'Full Blockchain integration', 'Unlimited verified records', 'Advanced analytics'] 
    },
    { 
      name: 'Enterprise', 
      price: '$49.99/month', 
      features: ['All Premium features', 'API access', 'Custom health metrics', 'Priority support', 'Multiple user accounts'] 
    }
  ];

  const connectWalletForSubscription = async () => {
    try {
      // specify wallet type for connectWallet helper
      const info = await connectWallet('walletconnect');
      setWalletInfo(info);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${info.walletType} wallet at ${info.address.substring(0, 6)}...${info.address.substring(info.address.length - 4)}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const disconnectWalletForSubscription = async () => {
    await disconnectWallet();
    setWalletInfo(defaultWalletInfo);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  };

  const handleSubscribe = () => {
    if (!walletInfo.isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to subscribe",
        variant: "destructive"
      });
      return;
    }

    // Simulate subscription process
    toast({
      title: "Processing Subscription",
      description: "Your payment is being processed...",
    });

    // Simulate successful subscription after 2 seconds
    setTimeout(() => {
      toast({
        title: "Subscription Activated",
        description: `Your ${selectedPlan} plan is now active!`,
        variant: "success"
      });
      setSubscriptionDialogOpen(false);
    }, 2000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Password</h3>
              <div className="grid gap-4 mt-2">
                <div className="grid gap-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                  <Input id="currentPassword" type="password" disabled={!isEditing} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                  <Input id="newPassword" type="password" disabled={!isEditing} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                  <Input id="confirmPassword" type="password" disabled={!isEditing} />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground mt-1">Enhance your account security with 2FA</p>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h4 className="text-sm font-medium">Status: <span className="text-health-red">Disabled</span></h4>
                </div>
                <Button variant="outline" className="flex gap-1">
                  <Key className="h-4 w-4" />
                  Enable 2FA
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Connected Devices</h3>
              <ul className="space-y-2 mt-2">
                <li className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">iPhone 13 Pro</p>
                      <p className="text-xs text-muted-foreground">Last active: {new Date().toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">New York, USA (192.168.1.1)</p>
                    </div>
                    <Badge>Current Device</Badge>
                  </div>
                </li>
                <li className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">MacBook Pro</p>
                      <p className="text-xs text-muted-foreground">Last active: Yesterday, 3:24 PM</p>
                      <p className="text-xs text-muted-foreground">San Francisco, USA (192.168.0.2)</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">Revoke</Button>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <Button variant="destructive" className="flex gap-1">
                <AlertCircle className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Biologic Chain Subscription</CardTitle>
          <CardDescription>Manage your Biologic Chain subscription and payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{currentUser?.plan || 'Premium'} Plan</h3>
                  <p className="text-sm text-muted-foreground">Billed monthly</p>
                </div>
                <Button variant="outline" onClick={() => setSubscriptionDialogOpen(true)}>
                  {currentUser?.plan ? 'Change Plan' : 'Subscribe'}
                </Button>
              </div>
              
              <div className="mt-4 grid gap-2">
                <div className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <span className="ml-2 inline-flex items-center text-green-600">
                    <Check className="h-3 w-3 mr-1" /> Active
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Next billing date:</span> 
                  <span className="ml-2">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Payment Methods</h3>
              
              {/* Credit Card Payment Method */}
              <div className="mt-2 flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/24</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Update</Button>
              </div>
              
              {/* Wallet Payment Method */}
              <div className="mt-2 border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Blockchain Wallet</p>
                      <p className="text-xs text-muted-foreground">
                        {walletInfo.isConnected 
                          ? `${walletInfo.address.substring(0, 6)}...${walletInfo.address.substring(walletInfo.address.length - 4)}`
                          : "Not connected"}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={walletInfo.isConnected ? disconnectWalletForSubscription : connectWalletForSubscription}
                  >
                    {walletInfo.isConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
                
                {walletInfo.isConnected && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Network: {walletInfo.network}</p>
                    <p>Balance: {walletInfo.balance} ETH</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose Your Subscription Plan</DialogTitle>
            <DialogDescription>
              Select the Biologic Chain plan that best suits your needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.name ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedPlan(plan.name as 'Basic' | 'Premium' | 'Enterprise')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{plan.name}</h3>
                    <p className="text-sm font-bold">{plan.price}</p>
                  </div>
                  {selectedPlan === plan.name && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                
                <ul className="mt-3 space-y-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-start">
                      <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} className="gap-1">
              Subscribe <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
