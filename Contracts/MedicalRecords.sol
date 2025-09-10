// ...new file...
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MedicalRecords {
    struct Record {
        string cid;        // IPFS CID or off-chain identifier
        string fileType;   // "image","video","pdf", etc.
        string meta;       // optional metadata (e.g. short note or encrypted pointer)
        uint256 timestamp;
        address addedBy;
    }

    // patient => records
    mapping(address => Record[]) private records;
    // patient => provider => allowed
    mapping(address => mapping(address => bool)) private accessAllowed;

    event RecordAdded(address indexed patient, uint256 indexed index, string cid, address indexed addedBy);
    event AccessGranted(address indexed patient, address indexed provider);
    event AccessRevoked(address indexed patient, address indexed provider);

    /// @notice Add a record for `patient`. Caller must be the patient or have access for that patient.
    function addRecord(address patient, string calldata cid, string calldata fileType, string calldata meta) external {
        require(bytes(cid).length > 0, "Invalid cid");
        if (msg.sender != patient) {
            require(accessAllowed[patient][msg.sender], "No access to add for patient");
        }
        records[patient].push(Record(cid, fileType, meta, block.timestamp, msg.sender));
        emit RecordAdded(patient, records[patient].length - 1, cid, msg.sender);
    }

    /// @notice Patient grants access to provider
    function grantAccess(address provider) external {
        accessAllowed[msg.sender][provider] = true;
        emit AccessGranted(msg.sender, provider);
    }

    /// @notice Patient revokes access from provider
    function revokeAccess(address provider) external {
        accessAllowed[msg.sender][provider] = false;
        emit AccessRevoked(msg.sender, provider);
    }

    /// @notice Get number of records for patient
    function getRecordCount(address patient) external view returns (uint256) {
        return records[patient].length;
    }

    /// @notice Read a single record by index
    function getRecord(address patient, uint256 index) external view returns (
        string memory cid,
        string memory fileType,
        string memory meta,
        uint256 timestamp,
        address addedBy
    ) {
        require(index < records[patient].length, "Index out of bounds");
        Record storage r = records[patient][index];
        return (r.cid, r.fileType, r.meta, r.timestamp, r.addedBy);
    }

    /// @notice Check whether provider has access for patient (or is the patient)
    function hasAccess(address patient, address provider) external view returns (bool) {
        return patient == provider || accessAllowed[patient][provider];
    }
}
// ...new file...