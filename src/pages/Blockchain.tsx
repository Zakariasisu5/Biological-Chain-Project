
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBlockchainData } from '@/lib/mockData';
import { Search, Shield, Check, ExternalLink, RefreshCw, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WalletConnect from '@/components/blockchain/WalletConnect';
import { WalletInfo, defaultWalletInfo, setupWalletEventListeners } from '@/utils/walletUtils';
import { useActivityTracker } from '@/utils/activityTracker';
import { useToast } from '@/hooks/use-toast';

const Blockchain = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(defaultWalletInfo);
  const { trackActivity } = useActivityTracker();
  const { toast } = useToast();

  // Extended blockchain data for this page
  const extendedBlockchainData = [
    ...mockBlockchainData,
    {
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      timestamp: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
      dataHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: 13000005,
      verified: true
    },
    {
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      timestamp: new Date(Date.now() - (6 * 24 * 60 * 60 * 1000)).toISOString(),
      dataHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: 13000006,
      verified: true
    },
    {
      txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      timestamp: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
      dataHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: 13000007,
      verified: false
    }
  ];

  const filteredData = extendedBlockchainData.filter(record => 
    record.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.dataHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.blockNumber.toString().includes(searchQuery)
  );

  useEffect(() => {
    // Track page view
    trackActivity('view_blockchain');

    // Set up wallet event listeners
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setWalletInfo(defaultWalletInfo);
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
          variant: "default"
        });
      }
    };

    const handleChainChanged = (chainId: string) => {
      // Reload the page when chain changes
      window.location.reload();
    };

    const cleanup = setupWalletEventListeners(
      handleAccountsChanged,
      handleChainChanged
    );

    return cleanup;
  }, []);

  const handleWalletConnect = (info: WalletInfo) => {
    setWalletInfo(info);
  };

  const handleWalletDisconnect = () => {
    setWalletInfo(defaultWalletInfo);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Health Records</h1>
          <p className="text-muted-foreground">Securely store and verify your health data on blockchain</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WalletConnect
            className="md:col-span-2"
            walletInfo={walletInfo}
            onWalletConnect={handleWalletConnect}
            onWalletDisconnect={handleWalletDisconnect}
          />

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{extendedBlockchainData.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Records</p>
                  <p className="text-2xl font-bold">
                    {extendedBlockchainData.filter(record => record.verified).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network</p>
                  <p className="text-lg font-medium">
                    {walletInfo.isConnected ? walletInfo.network : "Not Connected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Health Records</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="permissions">Access Permissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Blockchain Health Records</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by hash or block..." 
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button size="icon" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction Hash</TableHead>
                        <TableHead>Block Number</TableHead>
                        <TableHead>Data Hash</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((record) => (
                        <TableRow key={record.txHash}>
                          <TableCell className="font-mono">
                            {record.txHash.substring(0, 10)}...{record.txHash.substring(record.txHash.length - 6)}
                          </TableCell>
                          <TableCell>{record.blockNumber}</TableCell>
                          <TableCell className="font-mono">
                            {record.dataHash.substring(0, 10)}...{record.dataHash.substring(record.dataHash.length - 6)}
                          </TableCell>
                          <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            {record.verified ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <Check className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">View</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Blockchain Record Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 font-medium">Transaction Hash:</div>
                                    <div className="col-span-2 font-mono break-all">{record.txHash}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 font-medium">Block Number:</div>
                                    <div className="col-span-2">{record.blockNumber}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 font-medium">Data Hash:</div>
                                    <div className="col-span-2 font-mono break-all">{record.dataHash}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 font-medium">Timestamp:</div>
                                    <div className="col-span-2">{new Date(record.timestamp).toLocaleString()}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1 font-medium">Status:</div>
                                    <div className="col-span-2">
                                      {record.verified ? (
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                          <Check className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="pt-4">
                                    <Button variant="outline" className="w-full sm:w-auto gap-1">
                                      <ExternalLink className="h-4 w-4" />
                                      View on Etherscan
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Add New Health Record</CardTitle>
                <CardDescription>Upload and secure new health data to the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="recordType" className="text-sm font-medium">Record Type</label>
                      <select id="recordType" className="rounded-md border border-input bg-background px-3 py-2">
                        <option value="bloodTest">Blood Test Results</option>
                        <option value="heartRate">Heart Rate Data</option>
                        <option value="bloodPressure">Blood Pressure Reading</option>
                        <option value="medicalReport">Medical Report</option>
                      </select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="recordData" className="text-sm font-medium">Data</label>
                      <textarea 
                        id="recordData" 
                        className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2" 
                        placeholder="Enter health record data or JSON..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Upload File</Button>
                    <Button disabled={!walletInfo.isConnected}>
                      {walletInfo.isConnected ? "Submit to Blockchain" : "Connect Wallet to Submit"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verify Health Record</CardTitle>
                <CardDescription>Verify the authenticity of a health record on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="hashToVerify" className="text-sm font-medium">Transaction Hash or Data Hash</label>
                      <Input 
                        id="hashToVerify" 
                        placeholder="Enter transaction or data hash..." 
                        className="font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Verify Record</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-muted/50">
                    <h4 className="text-sm font-medium mb-2">How Verification Works</h4>
                    <p className="text-sm text-muted-foreground">
                      Our blockchain verification system ensures that your health data remains tamper-proof and secure. 
                      When data is added to the blockchain, a unique cryptographic hash is generated. This hash acts as a 
                      digital fingerprint that can be used to verify that the data has not been altered since it was recorded.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Access Permissions</CardTitle>
                <CardDescription>Manage who can access your blockchain health records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Authorized Medical Providers</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Dr. Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">Primary Care Physician</p>
                        </div>
                        <Button variant="outline" size="sm">Revoke Access</Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Metropolitan Hospital</p>
                          <p className="text-sm text-muted-foreground">Healthcare Provider</p>
                        </div>
                        <Button variant="outline" size="sm">Revoke Access</Button>
                      </div>
                    </div>
                    <Button className="mt-4" variant="outline">
                      Grant New Access
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Access History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Entity</TableHead>
                          <TableHead>Record Type</TableHead>
                          <TableHead>Access Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Dr. Sarah Johnson</TableCell>
                          <TableCell>Blood Test Results</TableCell>
                          <TableCell>{new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Authorized
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Metropolitan Hospital</TableCell>
                          <TableCell>Heart Rate Data</TableCell>
                          <TableCell>{new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Authorized
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Unknown Address (0x3F2...B1a4)</TableCell>
                          <TableCell>Medical Report</TableCell>
                          <TableCell>{new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Denied
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Blockchain;
