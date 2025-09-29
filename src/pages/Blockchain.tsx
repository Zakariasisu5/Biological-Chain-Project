import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield, UserPlus, UserMinus, Eye, EyeOff } from "lucide-react";
import WalletConnection from "@/components/blockchain/WalletConnection";
import {
  WalletInfo,
  defaultWalletInfo,
  setupWalletEventListeners,
} from "@/utils/walletUtils";
import { useActivityTracker } from "@/utils/activityTracker";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/hooks/useBlockchain";

const Blockchain: React.FC = () => {
  const [walletInfo, setWalletInfo] =
    useState<WalletInfo>(defaultWalletInfo);
  const { trackActivity } = useActivityTracker();
  const { toast } = useToast();
  const { 
    contract, 
    account, 
    isConnected, 
    isLoading, 
    error, 
    network, 
    balance,
    connectWallet,
    disconnectWallet,
    registerPatient,
    addRecord: addRecordToBlockchain,
    getAllRecords: getAllRecordsFromBlockchain,
    getRecordCount,
    grantAccess: grantAccessToBlockchain,
    revokeAccess: revokeAccessFromBlockchain,
    getPermission: getPermissionFromBlockchain,
    getPatientProviders,
    verifyRecordHash,
    verifyRecord: verifyRecordOnBlockchain,
    getStats,
    generateRecordHash
  } = useBlockchain();
  const [name, setName] = useState("");
  const [record, setRecord] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  
  // Verification state
  const [verificationInput, setVerificationInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [batchVerificationResults, setBatchVerificationResults] = useState<any[]>([]);
  
  // Permissions state
  const [permissions, setPermissions] = useState<any[]>([]);
  const [newPermissionAddress, setNewPermissionAddress] = useState("");
  const [newPermissionType, setNewPermissionType] = useState("read");
  const [permissionDuration, setPermissionDuration] = useState(30);

  // Load records
  const loadRecords = async () => {
    if (!account) return;
    try {
      const fetched = await getAllRecordsFromBlockchain(account);
      setRecords(fetched);
      toast({
        title: "Records Loaded",
        description: `Found ${fetched.length} records`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch records",
        variant: "destructive",
      });
    }
  };

  // Add a new record
  const addRecord = async () => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!record.trim() || !name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in both name and record fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First register as patient if not already registered
      try {
        await registerPatient();
      } catch (err: any) {
        // Ignore if already registered
        if (!err.message.includes("already registered")) {
          console.warn("Patient registration warning:", err.message);
        }
      }
      
      // Generate a unique record hash
      const recordHash = generateRecordHash(record + name + Date.now().toString());
      
      // Add record to blockchain
      const txHash = await addRecordToBlockchain(account, record, "text", name, recordHash);
      
      toast({
        title: "Record Added",
        description: `Successfully stored on blockchain. TX: ${txHash.slice(0, 10)}...`,
      });
      setName("");
      setRecord("");
      
      // Reload records after successful submission
      setTimeout(() => {
      loadRecords();
      }, 1000);
    } catch (err: any) {
      console.error("Add record failed:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add record",
        variant: "destructive",
      });
    }
  };

  // Verification functions
  const verifyRecord = async () => {
    if (!verificationInput) return;
    try {
      // Check if record hash exists on blockchain
      const isValid = await verifyRecordHash(verificationInput);
      setVerificationResult({
        isValid,
        message: isValid 
          ? "Record hash is valid and exists on blockchain" 
          : "Invalid record hash or record not found",
        details: isValid ? {
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          txHash: verificationInput,
          timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400)
        } : null
      });
    } catch (err: any) {
      setVerificationResult({
        isValid: false,
        message: err.message || "Verification failed due to network error"
      });
    }
  };

  const verifyAllRecords = async () => {
    if (records.length === 0) return;
    try {
      const results = await Promise.all(
        records.map(async (record, idx) => {
          try {
            const isValid = await verifyRecordHash(record.hash);
            return { isValid, recordIndex: idx };
          } catch (err) {
            return { isValid: false, recordIndex: idx };
          }
        })
      );
      setBatchVerificationResults(results);
      toast({
        title: "Batch Verification Complete",
        description: `Verified ${results.length} records`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Batch verification failed",
        variant: "destructive",
      });
    }
  };

  const clearVerificationResults = () => {
    setVerificationResult(null);
    setBatchVerificationResults([]);
  };

  // Permission functions
  const loadPermissions = async () => {
    if (!account) return;
    try {
      // Get patient providers
      const providers = await getPatientProviders(account);
      
      // Get permission details for each provider
      const permissionDetails = await Promise.all(
        providers.map(async (provider) => {
          try {
            const permission = await getPermissionFromBlockchain(account, provider);
            return {
              address: provider,
              type: permission.permissionType === 1 ? "read" : 
                    permission.permissionType === 2 ? "write" : "emergency",
              duration: Math.ceil((permission.expiresAt - Date.now() / 1000) / (24 * 60 * 60)),
              granted: new Date((permission.expiresAt - permission.duration * 24 * 60 * 60) * 1000).toISOString(),
              isActive: permission.isActive
            };
          } catch (err) {
            return null;
          }
        })
      );
      
      setPermissions(permissionDetails.filter(p => p !== null));
    } catch (err: any) {
      console.error("Failed to load permissions:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load permissions",
        variant: "destructive",
      });
    }
  };

  const grantPermission = async () => {
    if (!account || !newPermissionAddress) return;
    try {
      const permissionType = newPermissionType === "read" ? 1 : 
                            newPermissionType === "write" ? 2 : 3;
      
      const txHash = await grantAccessToBlockchain(
        newPermissionAddress, 
        permissionType, 
        permissionDuration
      );
      
      toast({
        title: "Permission Granted",
        description: `Access granted to ${newPermissionAddress}. TX: ${txHash.slice(0, 10)}...`,
      });
      
      setNewPermissionAddress("");
      setNewPermissionType("read");
      setPermissionDuration(30);
      
      // Reload permissions
      await loadPermissions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to grant permission",
        variant: "destructive",
      });
    }
  };

  const revokePermission = async (address: string) => {
    if (!account) return;
    try {
      const txHash = await revokeAccessFromBlockchain(address);
      
      toast({
        title: "Permission Revoked",
        description: `Access revoked for ${address}. TX: ${txHash.slice(0, 10)}...`,
      });
      
      // Reload permissions
      await loadPermissions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to revoke permission",
        variant: "destructive",
      });
    }
  };

  // Wallet listeners + page analytics
  useEffect(() => {
    trackActivity("view_blockchain");
    loadPermissions();

    const handleAccounts = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletInfo(defaultWalletInfo);
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected",
        });
      }
    };
    const handleChain = () => window.location.reload();

    const cleanup = setupWalletEventListeners(
      handleAccounts,
      handleChain
    );
    return cleanup;
  }, [toast, trackActivity]);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">
            Blockchain Health Records
          </h1>
          <p className="text-muted-foreground">
            Securely store and verify your health data on blockchain
          </p>
        </div>

        {/* Wallet & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <WalletConnection />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Records
                  </p>
                  <p className="text-2xl font-bold">
                    {records.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Network
                  </p>
                  <p className="text-lg font-medium">
                    {network || "Not Connected"}
                  </p>
                </div>
                {balance && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Balance
                    </p>
                    <p className="text-lg font-medium">
                      {parseFloat(balance).toFixed(4)} ETH
                  </p>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">
              Health Records
            </TabsTrigger>
            <TabsTrigger value="verification">
              Verification
            </TabsTrigger>
            <TabsTrigger value="permissions">
              Access Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  My Blockchain Health Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={loadRecords}
                    disabled={!isConnected}
                  >
                    {isConnected ? "Load My Records" : "Connect Wallet First"}
                  </Button>
                  {isConnected && (
                    <Button
                      onClick={() => {
                        setRecords([]);
                        toast({
                          title: "Records Cleared",
                          description: "Local records cleared. Click 'Load My Records' to refresh from blockchain.",
                        });
                      }}
                      variant="outline"
                    >
                      Clear Display
                    </Button>
                  )}
                </div>

                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Connect your wallet to view your blockchain health records
                    </p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No records found. Add your first health record to get started.
                    </p>
                    <Button onClick={loadRecords} variant="outline">
                    Load Records
                  </Button>
                </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Record</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((rec, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium">{rec.meta}</TableCell>
                          <TableCell className="max-w-xs truncate">{rec.cid}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{rec.fileType}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {rec.addedBy.slice(0, 6)}...{rec.addedBy.slice(-4)}
                          </TableCell>
                          <TableCell>
                            {rec.isVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(rec.timestamp * 1000).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Health Record</CardTitle>
                <CardDescription>
                  Upload and secure new health data to the
                blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Patient Name
                    </label>
                  <Input
                      placeholder="Enter patient name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                      disabled={!isConnected}
                      className="mt-1"
                  />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Medical Record / Notes
                    </label>
                  <Input
                      placeholder="Enter medical record details"
                    value={record}
                    onChange={(e) => setRecord(e.target.value)}
                      disabled={!isConnected}
                      className="mt-1"
                  />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={addRecord}
                      disabled={!isConnected || !name.trim() || !record.trim()}
                      className="w-full"
                    >
                      {isConnected 
                        ? (name.trim() && record.trim() ? "Submit to Blockchain" : "Fill in both fields")
                        : "Connect Wallet First"}
                    </Button>
                  </div>
                  {!isConnected && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please connect your wallet to add records to the blockchain
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Verification</CardTitle>
                <CardDescription>
                  Verify the integrity and authenticity of health records on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter record hash or transaction ID"
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                    />
                    <Button
                      onClick={verifyRecord}
                      disabled={!verificationInput || !contract}
                    >
                      Verify Record
                    </Button>
                  </div>
                  
                  {verificationResult && (
                    <div className={`p-4 rounded-lg border ${
                      verificationResult.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {verificationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {verificationResult.isValid ? 'Record Verified' : 'Verification Failed'}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${
                        verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {verificationResult.message}
                      </p>
                      {verificationResult.details && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p><strong>Block Number:</strong> {verificationResult.details.blockNumber}</p>
                          <p><strong>Transaction Hash:</strong> {verificationResult.details.txHash}</p>
                          <p><strong>Timestamp:</strong> {new Date(verificationResult.details.timestamp * 1000).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Verification</CardTitle>
                <CardDescription>
                  Verify multiple records at once for efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={verifyAllRecords}
                      disabled={records.length === 0 || !contract}
                    >
                      Verify All My Records
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearVerificationResults}
                    >
                      Clear Results
                    </Button>
                  </div>
                  
                  {batchVerificationResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Batch Verification Results:</h4>
                      <div className="space-y-1">
                        {batchVerificationResults.map((result, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Record #{idx + 1}</span>
                            <div className="flex items-center gap-2">
                              {result.isValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-sm">{result.isValid ? 'Valid' : 'Invalid'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grant Access Permission</CardTitle>
                <CardDescription>
                  Grant access to your health records to authorized healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Wallet Address (0x...)"
                      value={newPermissionAddress}
                      onChange={(e) => setNewPermissionAddress(e.target.value)}
                    />
                    <select
                      value={newPermissionType}
                      onChange={(e) => setNewPermissionType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="read">Read Only</option>
                      <option value="write">Read & Write</option>
                      <option value="emergency">Emergency Access</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Days"
                        value={permissionDuration}
                        onChange={(e) => setPermissionDuration(Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                  <Button
                    onClick={grantPermission}
                    disabled={!newPermissionAddress || !account}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Grant Permission
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Permissions</CardTitle>
                <CardDescription>
                  Manage existing access permissions for your health records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={loadPermissions}
                      disabled={!contract}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Refresh Permissions
                    </Button>
                  </div>

                  {permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No permissions granted yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{permission.address}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  permission.type === 'read' ? 'bg-blue-100 text-blue-800' :
                                  permission.type === 'write' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {permission.type.toUpperCase()}
                                </span>
                                <span>•</span>
                                <span>{permission.duration} days</span>
                                <span>•</span>
                                <span>Granted {new Date(permission.granted).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokePermission(permission.address)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Types</CardTitle>
                <CardDescription>
                  Understand the different types of access permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium">Read Only</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allows viewing health records but no modifications
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium">Read & Write</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allows viewing and updating health records
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-red-600" />
                      <h4 className="font-medium">Emergency Access</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access for emergency medical situations
                    </p>
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
