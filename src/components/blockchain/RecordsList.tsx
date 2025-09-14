// src/components/blockchain/RecordsList.tsx
import React, { useEffect, useState } from "react";
import { useBlockchain } from "@/hooks/blockchain";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Record {
  patient: string;
  diagnosis: string;
  treatment: string;
}

const RecordsList: React.FC = () => {
  const { contract } = useBlockchain(); // ✅ Updated hook
  const [records, setRecords] = useState<Record[]>([]);
  const { toast } = useToast();

  const loadRecords = async () => {
    if (!contract) return;
    try {
      // If your contract uses getAllRecords:
      const fetchedRaw = await contract.getAllRecords();
      const fetched: Record[] = fetchedRaw.map((rec: any) => ({
        patient: rec.patient,
        diagnosis: rec.diagnosis,
        treatment: rec.treatment,
      }));

      setRecords(fetched);

      toast({
        title: "Records Loaded",
        description: `Found ${fetched.length} records`,
      });
    } catch (err) {
      console.error("Error loading records:", err);
      toast({
        title: "Error",
        description: "Failed to fetch records",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadRecords();
  }, [contract]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stored Health Records</h2>
        <Button onClick={loadRecords} disabled={!contract}>
          Reload Records
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No records found. Add some to see them here.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((rec, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{rec.patient}</TableCell>
                <TableCell>{rec.diagnosis}</TableCell>
                <TableCell>{rec.treatment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default RecordsList;
