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
  const addRecord = async (name: string, record: string) => {
    if (!contract) return;
    const tx = await contract.addRecord(name, record);
    await tx.wait();
    console.log("Record added:", tx.hash);
  };

  // Get record by ID
  const getRecord = async (id: number) => {
    if (!contract) return null;
    return await contract.getRecord(id);
  };

  // Get all records
  const getAllRecords = async () => {
    if (!contract) return [];
    return await contract.getAllRecords();
  };

  return { provider, signer, contract, account, addRecord, getRecord, getAllRecords };
}
