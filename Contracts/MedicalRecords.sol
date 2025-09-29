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
        bool isVerified;   // Whether the record is verified
        string hash;       // Record hash for verification
    }

    struct Permission {
        address provider;
        uint256 permissionType; // 1: read, 2: write, 3: emergency
        uint256 expiresAt;
        bool isActive;
    }

    // patient => records
    mapping(address => Record[]) private records;
    // patient => provider => permission
    mapping(address => mapping(address => Permission)) private permissions;
    // patient => providers list
    mapping(address => address[]) private patientProviders;
    // Record hash => exists (for verification)
    mapping(string => bool) private recordHashes;
    // Record hash => record info
    mapping(string => address) private hashToPatient;

    address public owner;
    uint256 public totalRecords;
    uint256 public totalPatients;

    event RecordAdded(address indexed patient, uint256 indexed index, string cid, address indexed addedBy, string hash);
    event RecordVerified(address indexed patient, uint256 indexed index, string hash);
    event AccessGranted(address indexed patient, address indexed provider, uint256 permissionType, uint256 expiresAt);
    event AccessRevoked(address indexed patient, address indexed provider);
    event PatientRegistered(address indexed patient);
    event RecordUpdated(address indexed patient, uint256 indexed index, string newMeta);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyPatientOrAuthorized(address patient) {
        require(
            msg.sender == patient || 
            (permissions[patient][msg.sender].isActive && 
             permissions[patient][msg.sender].expiresAt > block.timestamp),
            "No access to patient records"
        );
        _;
    }

    /// @notice Register a new patient
    function registerPatient() external {
        require(records[msg.sender].length == 0, "Patient already registered");
        totalPatients++;
        emit PatientRegistered(msg.sender);
    }

    /// @notice Add a record for `patient`. Caller must be the patient or have write access.
    function addRecord(
        address patient, 
        string calldata cid, 
        string calldata fileType, 
        string calldata meta,
        string calldata recordHash
    ) external {
        require(bytes(cid).length > 0, "Invalid cid");
        require(bytes(recordHash).length > 0, "Invalid record hash");
        require(!recordHashes[recordHash], "Record hash already exists");
        
        if (msg.sender != patient) {
            require(
                permissions[patient][msg.sender].isActive && 
                permissions[patient][msg.sender].permissionType >= 2 &&
                permissions[patient][msg.sender].expiresAt > block.timestamp,
                "No write access to patient records"
            );
        }

        records[patient].push(Record(
            cid, 
            fileType, 
            meta, 
            block.timestamp, 
            msg.sender,
            false, // isVerified
            recordHash
        ));
        
        recordHashes[recordHash] = true;
        hashToPatient[recordHash] = patient;
        totalRecords++;
        
        emit RecordAdded(patient, records[patient].length - 1, cid, msg.sender, recordHash);
    }

    /// @notice Verify a record by hash
    function verifyRecord(string calldata recordHash) external onlyOwner {
        require(recordHashes[recordHash], "Record hash does not exist");
        address patient = hashToPatient[recordHash];
        
        // Find the record and mark as verified
        for (uint256 i = 0; i < records[patient].length; i++) {
            if (keccak256(bytes(records[patient][i].hash)) == keccak256(bytes(recordHash))) {
                records[patient][i].isVerified = true;
                emit RecordVerified(patient, i, recordHash);
                break;
            }
        }
    }

    /// @notice Patient grants access to provider
    function grantAccess(
        address provider, 
        uint256 permissionType, 
        uint256 durationInDays
    ) external {
        require(permissionType >= 1 && permissionType <= 3, "Invalid permission type");
        require(durationInDays > 0, "Invalid duration");
        
        permissions[msg.sender][provider] = Permission(
            provider,
            permissionType,
            block.timestamp + (durationInDays * 1 days),
            true
        );
        
        // Add to providers list if not already there
        bool exists = false;
        for (uint256 i = 0; i < patientProviders[msg.sender].length; i++) {
            if (patientProviders[msg.sender][i] == provider) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            patientProviders[msg.sender].push(provider);
        }
        
        emit AccessGranted(msg.sender, provider, permissionType, block.timestamp + (durationInDays * 1 days));
    }

    /// @notice Patient revokes access from provider
    function revokeAccess(address provider) external {
        permissions[msg.sender][provider].isActive = false;
        emit AccessRevoked(msg.sender, provider);
    }

    /// @notice Get all records for a patient
    function getAllRecords(address patient) external view onlyPatientOrAuthorized(patient) returns (
        string[] memory cids,
        string[] memory fileTypes,
        string[] memory metas,
        uint256[] memory timestamps,
        address[] memory addedBys,
        bool[] memory isVerifieds,
        string[] memory hashes
    ) {
        uint256 length = records[patient].length;
        cids = new string[](length);
        fileTypes = new string[](length);
        metas = new string[](length);
        timestamps = new uint256[](length);
        addedBys = new address[](length);
        isVerifieds = new bool[](length);
        hashes = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            Record storage r = records[patient][i];
            cids[i] = r.cid;
            fileTypes[i] = r.fileType;
            metas[i] = r.meta;
            timestamps[i] = r.timestamp;
            addedBys[i] = r.addedBy;
            isVerifieds[i] = r.isVerified;
            hashes[i] = r.hash;
        }
    }

    /// @notice Get number of records for patient
    function getRecordCount(address patient) external view returns (uint256) {
        return records[patient].length;
    }

    /// @notice Read a single record by index
    function getRecord(address patient, uint256 index) external view onlyPatientOrAuthorized(patient) returns (
        string memory cid,
        string memory fileType,
        string memory meta,
        uint256 timestamp,
        address addedBy,
        bool isVerified,
        string memory hash
    ) {
        require(index < records[patient].length, "Index out of bounds");
        Record storage r = records[patient][index];
        return (r.cid, r.fileType, r.meta, r.timestamp, r.addedBy, r.isVerified, r.hash);
    }

    /// @notice Check whether provider has access for patient
    function hasAccess(address patient, address provider) external view returns (bool) {
        return patient == provider || 
               (permissions[patient][provider].isActive && 
                permissions[patient][provider].expiresAt > block.timestamp);
    }

    /// @notice Get permission details for a provider
    function getPermission(address patient, address provider) external view returns (
        uint256 permissionType,
        uint256 expiresAt,
        bool isActive
    ) {
        Permission storage p = permissions[patient][provider];
        return (p.permissionType, p.expiresAt, p.isActive);
    }

    /// @notice Get all providers for a patient
    function getPatientProviders(address patient) external view returns (address[] memory) {
        return patientProviders[patient];
    }

    /// @notice Verify if a record hash exists
    function verifyRecordHash(string calldata recordHash) external view returns (bool) {
        return recordHashes[recordHash];
    }

    /// @notice Get contract statistics
    function getStats() external view returns (uint256, uint256) {
        return (totalRecords, totalPatients);
    }

    /// @notice Update record metadata (only by record creator or patient)
    function updateRecordMeta(address patient, uint256 index, string calldata newMeta) external {
        require(index < records[patient].length, "Index out of bounds");
        require(
            msg.sender == patient || 
            records[patient][index].addedBy == msg.sender,
            "No permission to update record"
        );
        
        records[patient][index].meta = newMeta;
        emit RecordUpdated(patient, index, newMeta);
    }
}
// ...new file...