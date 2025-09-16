// Export the deployed contract address and ABI that match Contracts/MedicalRecords.sol
export const CONTRACT_ADDRESS = "0xfF0c704F720D631dB7Cc70645fb9b596C2a093e7";

export const CONTRACT_ABI = [
  "event RecordAdded(address indexed patient, uint256 indexed index, string cid, address indexed addedBy)",
  "function addRecord(address patient, string cid, string fileType, string meta) external",
  "function grantAccess(address provider) external",
  "function revokeAccess(address provider) external",
  "function getRecordCount(address patient) external view returns (uint256)",
  "function getRecord(address patient, uint256 index) external view returns (string cid, string fileType, string meta, uint256 timestamp, address addedBy)",
  "function hasAccess(address patient, address provider) external view returns (bool)"
];
