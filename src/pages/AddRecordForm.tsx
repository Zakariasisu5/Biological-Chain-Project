import { useState } from "react";
import { useBlockchain } from "@/hooks/blockchain";

export default function AddRecordForm() {
  const { contract, account } = useBlockchain(); // ✅ updated hook
  const [patient, setPatient] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !description) {
      setMessage("⚠ Please fill all fields");
      return;
    }

    if (!contract) {
      setMessage("⚠ Contract not connected");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // contract.addRecord(patientAddress, cidOrText, fileType, meta)
      const tx = await contract.addRecord(account || patient, description, "text", "web-form");
      await tx.wait(); // wait for confirmation
      setMessage(`✅ Record added! Tx Hash: ${tx.hash}`);
      setPatient("");
      setDescription("");
    } catch (error: any) {
      setMessage("❌ Transaction failed: " + (error.message || error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Medical Record</h2>
      <p className="text-sm mb-2 text-gray-500">Connected as: {account || "Not Connected"}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Patient Address</label>
          <input
            type="text"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="0x123..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter medical record details"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !contract}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Add Record"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
