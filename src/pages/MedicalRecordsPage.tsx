import { useState } from "react";
import { useBlockchain } from "@/hooks/blockchain";

export default function MedicalRecordsPage() {
  const { account, addRecord: addRecordHelper, generateRecordHash, getAllRecords } = useBlockchain();

  const [patient, setPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Add new record
  const addRecord = async () => {
    if (!account) return alert("Please connect your wallet first");
    try {
      setLoading(true);
      const patientAddress = patient || account;
      const recordHash = generateRecordHash ? generateRecordHash(`${patientAddress}-${diagnosis}`) : undefined;
      if (!recordHash) throw new Error('Failed to generate record hash');
      await addRecordHelper(patientAddress, diagnosis, "text", treatment, recordHash);
      alert("Record added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding record");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all records
  const fetchRecords = async () => {
    if (!account) return alert("Please connect your wallet first");
    try {
      // use the hook service to fetch all records for the connected account
  const all = await getAllRecords(account as string);
  setRecords(all as any[]);
    } catch (err) {
      console.error(err);
      alert("Error fetching records");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Medical Records DApp</h1>
      <p className="text-gray-500">Connected account: {account || "Not connected"}</p>

      {/* Form */}
      <div className="space-y-3 border p-4 rounded">
        <input
          type="text"
          placeholder="Patient Name"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={addRecord}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Record"}
        </button>
      </div>

      {/* Fetch records */}
      <button
        onClick={fetchRecords}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Fetch Records
      </button>

      {/* Records List */}
      <div className="space-y-3">
        {records.map((r, idx) => (
          <div key={idx} className="p-3 border rounded">
            <p><strong>Patient:</strong> {r.patient}</p>
            <p><strong>Diagnosis:</strong> {r.diagnosis}</p>
            <p><strong>Treatment:</strong> {r.treatment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
