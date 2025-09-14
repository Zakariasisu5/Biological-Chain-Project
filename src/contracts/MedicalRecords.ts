import { InterfaceAbi } from "ethers";

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7";

export const CONTRACT_ABI: InterfaceAbi = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_record", "type": "string" }
    ],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "getRecord",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "record", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllRecords",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "record", "type": "string" },
          { "internalType": "address", "name": "owner", "type": "address" }
        ],
        "internalType": "struct MedicalRecords.Record[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
