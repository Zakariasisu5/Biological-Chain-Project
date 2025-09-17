import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/contracts/MedicalRecords";

export function useMedicalRecords() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      if ((window as any).ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await ethProvider.send("eth_requestAccounts", []);
          const ethSigner = await ethProvider.getSigner();
          const medicalContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, ethSigner);

          setProvider(ethProvider);
          setSigner(ethSigner);
          setContract(medicalContract);
          setAccount(accounts[0]);
        } catch (err) {
          console.error("Blockchain init error:", err);
        }
      } else {
        console.error("MetaMask not detected");
      }
    };
    init();
  }, []);

  // Add record
  // Add record
  // Old UI passed (name, record). The contract now expects (patientAddress, cid, fileType, meta).
  // We keep the old signature but map `name` -> meta and `record` -> content, using the connected account
  // as the patient address (grouping per-address on-chain).
  const addRecord = async (name: string, record: string) => {
    if (!contract || !account) return;
    // Use connected account as patient address
    const patientAddress = account;
    const cidOrText = record;
    const fileType = "text";
    const meta = name || "";
    const tx = await contract.addRecord(patientAddress, cidOrText, fileType, meta);
    await tx.wait();
    console.log("Record added:", tx.hash);
  };

  // Get record by index for the connected account
  const getRecord = async (index: number) => {
    if (!contract || !account) return null;
    return await contract.getRecord(account, index);
  };

  // Get all records for the connected account
  const getAllRecords = async () => {
    if (!contract || !account) return [];
    const countBN = await contract.getRecordCount(account);
    const count = Number(countBN);
    const out: any[] = [];
    for (let i = 0; i < count; i++) {
      const rec = await contract.getRecord(account, i);
      out.push(rec);
    }
    return out;
  };

  return { provider, signer, contract, account, addRecord, getRecord, getAllRecords };
}
