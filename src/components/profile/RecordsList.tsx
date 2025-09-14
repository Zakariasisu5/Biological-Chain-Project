import React, { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RecordsListProps {
  contract: Contract;
}

const RecordsList: React.FC<RecordsListProps> = ({ contract }) => {
  const [records, setRecords] = useState<any[]>([]);

  const loadRecords = async () => {
    if (!contract) return;
    try {
      const allRecords = await contract.getAllRecords();
      setRecords(allRecords);
    } catch (err) {
      console.error("Failed to load records", err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [contract]);

  if (!records.length) return <p>No records found</p>;

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
        {records.map((rec: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{rec.name}</TableCell>
            <TableCell>{rec.record}</TableCell>
            <TableCell>{rec.owner}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecordsList;
