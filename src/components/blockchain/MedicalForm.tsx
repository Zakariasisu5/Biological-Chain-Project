import { useState } from "react";
import { useBlockchain } from "@/hooks/blockchain";

export default function MedicalForm() {
  const { contract, account } = useBlockchain(); // Updated hook

  const [patient, setPatient] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient || !data) {
      setMessage("⚠️ Please fill in all fields");
      return;
    }

    if (!contract) {
      setMessage("❌ Contract not connected");
      return;
    }

    try {
      setLoading(true);
      setMessage("Submitting to blockchain... ⏳");

      const tx = await contract.addRecord(patient, data); // Call contract function
      await tx.wait(); // Wait for transaction confirmation

      setMessage("✅ Record successfully added!");
      setPatient("");
      setData("");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Failed to add record: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Add Medical Record</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Patient Address</label>
          <input
            type="text"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="0x123..."
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Medical Data</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="E.g., Blood type, diagnosis, etc."
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !account}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Record"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}

      {account && (
        <p className="mt-4 text-sm text-gray-600">
          Connected as: <span className="font-mono">{account}</span>
        </p>
      )}
    </div>
  );
}
