import React, { useState } from "react";
import { Contract } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MedicalFormProps {
  contract: Contract;
  account: string;
  onRecordAdded: () => void;
}

const MedicalForm: React.FC<MedicalFormProps> = ({ contract, account, onRecordAdded }) => {
  const { toast } = useToast();
  const [patient, setPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddRecord = async () => {
    if (!contract) return;
    if (!patient || !diagnosis || !treatment) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.addRecord(patient, diagnosis, treatment);
      await tx.wait();
      toast({ title: "Record Added", description: "Successfully stored on blockchain" });
      setPatient(""); setDiagnosis(""); setTreatment("");
      onRecordAdded(); // refresh parent records
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input placeholder="Patient Name" value={patient} onChange={e => setPatient(e.target.value)} />
      <Input placeholder="Diagnosis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
      <Input placeholder="Treatment" value={treatment} onChange={e => setTreatment(e.target.value)} />
      <div className="flex justify-end">
        <Button onClick={handleAddRecord} disabled={loading || !account}>
          {loading ? "Submitting..." : "Submit to Blockchain"}
        </Button>
      </div>
    </div>
  );
};

export default MedicalForm;
