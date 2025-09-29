// src/components/medical/MedicalForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from '@/hooks/blockchain';

interface MedicalFormProps {
  account: string;
  onRecordAdded: () => void;
}

const MedicalForm: React.FC<MedicalFormProps> = ({ account, onRecordAdded }) => {
  const { addRecord: addRecordHelper, generateRecordHash } = useBlockchain();
  const { toast } = useToast();
  const [patient, setPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [loading, setLoading] = useState(false);

  const addRecord = async () => {
    if (!addRecordHelper) return;
    try {
      setLoading(true);
      const patientAddress = patient || account;
      const recordHash = generateRecordHash ? generateRecordHash(`${patientAddress}-${diagnosis}`) : undefined;
      if (!recordHash) throw new Error('Failed to generate record hash');
      await addRecordHelper(patientAddress, diagnosis, "text", treatment, recordHash);
      toast({ title: "Record added!", description: "Successfully stored on blockchain" });
      setPatient(""); setDiagnosis(""); setTreatment("");
      onRecordAdded();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to add record", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Patient Name"
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
      />
      <Input
        placeholder="Diagnosis"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
      />
      <Input
        placeholder="Treatment"
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={addRecord} disabled={!account || loading}>
          {loading ? "Submitting..." : "Submit to Blockchain"}
        </Button>
      </div>
    </div>
  );
};

export default MedicalForm;
