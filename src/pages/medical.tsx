// pages/medical.tsx
import { useState } from "react";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";

export default function MedicalPage() {
  const { contract, account } = useMedicalRecords();
  const [patientId, setPatientId] = useState("");
  const [record, setRecord] = useState("");
  const [records, setRecords] = useState<string[]>([]);

  const addRecord = async () => {
    if (!contract) return alert("Contract not ready");
    try {
      const tx = await contract.addRecord(patientId, record);
      await tx.wait();
      alert("Record added successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecords = async () => {
    if (!contract) return alert("Contract not ready");
    try {
      const result = await contract.getRecords(patientId);
      setRecords(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Medical Records DApp</h1>
      <p>Connected Account: {account || "Not connected"}</p>

      <input
        placeholder="Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />
      <input
        placeholder="New Record"
        value={record}
        onChange={(e) => setRecord(e.target.value)}
      />
      <button onClick={addRecord}>Add Record</button>
      <button onClick={loadRecords}>Load Records</button>

      <h2>Records:</h2>
      <ul>
        {records.map((r, idx) => (
          <li key={idx}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
