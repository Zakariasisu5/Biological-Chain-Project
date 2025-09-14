import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/contracts/MedicalRecords";

interface BlockchainHook {
  contract: Contract | null;
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const useBlockchain = (): BlockchainHook => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        console.warn("MetaMask not detected");
        return;
      }

      // ✅ Cast to Eip1193Provider
      const ethProvider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(ethProvider);

      const signer = await ethProvider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const medicalContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(medicalContract);

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
          setContract(null);
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);

      // Cleanup listeners
      return () => {
        window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener?.("chainChanged", handleChainChanged);
      };
    };

    init();
  }, []);

  return { provider, contract, account };
};
