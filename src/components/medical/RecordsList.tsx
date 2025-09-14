// src/components/medical/RecordsList.tsx
import React, { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface RecordsListProps {
  contract: Contract;
}

const RecordsList: React.FC<RecordsListProps> = ({ contract }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);

  const loadRecords = async () => {
    if (!contract) return;
    try {
      const all = await contract.getAllRecords();
      setRecords(all.map((r: any) => ({
        patient: r.name,
        diagnosis: r.record, // change if your contract stores diagnosis separately
        treatment: r.record,
      })));
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load records", variant: "destructive" });
    }
  };

  useEffect(() => { loadRecords(); }, [contract]);

  if (records.length === 0) return <p className="text-muted-foreground">No records found.</p>;

  return (
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
        {records.map((r, i) => (
          <TableRow key={i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{r.patient}</TableCell>
            <TableCell>{r.diagnosis}</TableCell>
            <TableCell>{r.treatment}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecordsList;
