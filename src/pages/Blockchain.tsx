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
import WalletConnect from "@/components/blockchain/WalletConnect";
import {
  WalletInfo,
  defaultWalletInfo,
  setupWalletEventListeners,
} from "@/utils/walletUtils";
import { useActivityTracker } from "@/utils/activityTracker";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/hooks/blockchain";

const Blockchain: React.FC = () => {
  const [walletInfo, setWalletInfo] =
    useState<WalletInfo>(defaultWalletInfo);
  const { trackActivity } = useActivityTracker();
  const { toast } = useToast();
  const { contract, account } = useBlockchain();
  const [name, setName] = useState("");
  const [record, setRecord] = useState("");
  const [records, setRecords] = useState<any[]>([]);

  // Load records
  const loadRecords = async () => {
    if (!contract) return;
    try {
      const fetched = await contract.getAllRecords();
      setRecords(fetched);
      toast({
        title: "Records Loaded",
        description: `Found ${fetched.length} records`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch records",
        variant: "destructive",
      });
    }
  };

  // Add a new record
  const addRecord = async () => {
    if (!contract || !account) return;
    try {
      // contract.addRecord(patientAddress, cidOrText, fileType, meta)
      const tx = await contract.addRecord(account, record, "text", name);
      await tx.wait();
      toast({
        title: "Record Added",
        description: "Successfully stored on blockchain",
      });
      setName("");
      setRecord("");
      loadRecords();
    } catch (err: any) {
      console.error("Add record failed:", err);
      toast({
        title: "Error",
        description: err?.reason || err?.message || "Failed to add record",
        variant: "destructive",
      });
    }
  };

  // Wallet listeners + page analytics
  useEffect(() => {
    trackActivity("view_blockchain");

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
            <WalletConnect
              walletInfo={walletInfo}
              onWalletConnect={(info) => setWalletInfo(info)}
              onWalletDisconnect={() => setWalletInfo(defaultWalletInfo)}
            />
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
                    {account
                      ? walletInfo.network
                      : "Not Connected"}
                  </p>
                </div>
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
                    disabled={!contract}
                  >
                    Load Records
                  </Button>
                </div>

                {records.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No records found. Try adding some.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Record</TableHead>
                        <TableHead>Owner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((rec, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{rec.name}</TableCell>
                          <TableCell>{rec.record}</TableCell>
                          <TableCell>{rec.owner}</TableCell>
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
                blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Patient Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    placeholder="Medical Record / Notes"
                    value={record}
                    onChange={(e) => setRecord(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={addRecord}
                      disabled={!account}
                    >
                      {account
                        ? "Submit to Blockchain"
                        : "Connect Wallet First"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <p className="text-muted-foreground">
              Verification feature coming soon...
            </p>
          </TabsContent>

          <TabsContent value="permissions">
            <p className="text-muted-foreground">
              Access permissions feature coming soon...
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Blockchain;
