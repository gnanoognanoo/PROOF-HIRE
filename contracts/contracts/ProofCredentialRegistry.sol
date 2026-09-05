// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofCredentialRegistry
 * @dev Cryptographic Skill & Credential Verification Registry on Polygon.
 * Anchors SHA-256 document digests, issuer attestations, and tamper-proof verification states.
 * 
 * IMPORTANT ARCHITECTURAL PRINCIPLE:
 * Files are NEVER stored directly on-chain. Only cryptographic digests (SHA-256)
 * and essential verification metadata are registered.
 * Blockchain verification guarantees that the credential record has not been altered since issuance.
 */
contract ProofCredentialRegistry {

    enum VerificationLevel {
        USER_SUBMITTED,    // Tier 1: Candidate uploaded; hash anchored for non-alteration.
        PLATFORM_VERIFIED, // Tier 2: Compiler AST, GPG commit attributions, and benchmark verified.
        ISSUER_VERIFIED    // Tier 3: Directly signed/attested by accredited institution or university.
    }

    enum CredentialStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }

    struct CredentialRecord {
        bytes32 credentialIdHash;
        string credentialId;         // e.g. "PH-8492"
        string ownerId;              // e.g. "Gnaneshwar R" or wallet address
        string credentialType;       // e.g. "Frontend Development Project"
        string issuer;               // e.g. "ProofHire Verification Authority"
        string entityId;             // Project or Certificate unique ID
        bytes32 documentHash;        // SHA-256 digest of certificate or project bundle
        uint256 issueTimestamp;      // Unix timestamp
        VerificationLevel verificationLevel;
        CredentialStatus status;
        uint256 revokedAt;
        string revocationReason;
        bool exists;
    }

    address public immutable owner;
    
    // Mapping from keccak256(credentialId) => CredentialRecord
    mapping(bytes32 => CredentialRecord) private credentials;
    
    // Owner to list of credential ID hashes
    mapping(bytes32 => bytes32[]) private ownerCredentials;

    event CredentialIssued(
        bytes32 indexed credentialIdHash,
        string credentialId,
        string ownerId,
        string credentialType,
        bytes32 documentHash,
        VerificationLevel verificationLevel,
        uint256 issueTimestamp
    );

    event CredentialRevoked(
        bytes32 indexed credentialIdHash,
        string credentialId,
        uint256 revokedAt,
        string reason
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "ProofCredentialRegistry: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Issues and anchors a new verified credential record to Polygon.
     * @param credentialId Human-readable credential identifier (e.g. "PH-8492").
     * @param ownerId Candidate name or identifier.
     * @param credentialType Type or title of the credential.
     * @param issuer Issuing authority name.
     * @param entityId Linked project or certificate ID.
     * @param documentHash SHA-256 digest of the uploaded file stored in Supabase.
     * @param verificationLevel One of USER_SUBMITTED (0), PLATFORM_VERIFIED (1), or ISSUER_VERIFIED (2).
     */
    function issueCredential(
        string calldata credentialId,
        string calldata ownerId,
        string calldata credentialType,
        string calldata issuer,
        string calldata entityId,
        bytes32 documentHash,
        VerificationLevel verificationLevel
    ) external onlyOwner returns (bytes32) {
        bytes32 idHash = keccak256(abi.encodePacked(credentialId));
        require(!credentials[idHash].exists, "ProofCredentialRegistry: credential already exists");
        require(documentHash != bytes32(0), "ProofCredentialRegistry: invalid document hash");

        credentials[idHash] = CredentialRecord({
            credentialIdHash: idHash,
            credentialId: credentialId,
            ownerId: ownerId,
            credentialType: credentialType,
            issuer: issuer,
            entityId: entityId,
            documentHash: documentHash,
            issueTimestamp: block.timestamp,
            verificationLevel: verificationLevel,
            status: CredentialStatus.ACTIVE,
            revokedAt: 0,
            revocationReason: "",
            exists: true
        });

        bytes32 ownerHash = keccak256(abi.encodePacked(ownerId));
        ownerCredentials[ownerHash].push(idHash);

        emit CredentialIssued(
            idHash,
            credentialId,
            ownerId,
            credentialType,
            documentHash,
            verificationLevel,
            block.timestamp
        );

        return idHash;
    }

    /**
     * @notice Verifies and returns an issued credential record.
     * @param credentialId Human-readable identifier.
     */
    function verifyCredential(string calldata credentialId) external view returns (CredentialRecord memory) {
        bytes32 idHash = keccak256(abi.encodePacked(credentialId));
        require(credentials[idHash].exists, "ProofCredentialRegistry: credential not found");
        return credentials[idHash];
    }

    /**
     * @notice Cryptographically verifies if an uploaded document matches the on-chain digest.
     * @param credentialId Human-readable identifier.
     * @param testDocumentHash SHA-256 hash of the document to inspect.
     */
    function verifyDocumentIntegrity(
        string calldata credentialId,
        bytes32 testDocumentHash
    ) external view returns (bool isAuthentic, bool isActive) {
        bytes32 idHash = keccak256(abi.encodePacked(credentialId));
        if (!credentials[idHash].exists) {
            return (false, false);
        }

        CredentialRecord memory record = credentials[idHash];
        bool hashMatches = (record.documentHash == testDocumentHash);
        bool statusActive = (record.status == CredentialStatus.ACTIVE);

        return (hashMatches, statusActive);
    }

    /**
     * @notice Revokes a credential with an explicit reason.
     * @param credentialId Human-readable identifier.
     * @param reason Explanation for revocation.
     */
    function revokeCredential(string calldata credentialId, string calldata reason) external onlyOwner {
        bytes32 idHash = keccak256(abi.encodePacked(credentialId));
        require(credentials[idHash].exists, "ProofCredentialRegistry: credential not found");
        require(credentials[idHash].status == CredentialStatus.ACTIVE, "ProofCredentialRegistry: credential not active");

        credentials[idHash].status = CredentialStatus.REVOKED;
        credentials[idHash].revokedAt = block.timestamp;
        credentials[idHash].revocationReason = reason;

        emit CredentialRevoked(idHash, credentialId, block.timestamp, reason);
    }
}
