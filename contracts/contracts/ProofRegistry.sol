// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofRegistry
 * @dev Anchors AI-evaluated project grades and developer skill credentials onto Polygon.
 */
contract ProofRegistry {
    enum GradeTier { O, A, B, C, D, E }

    struct ProofRecord {
        address developer;
        string projectId;
        bytes32 sha256MerkleRoot;
        GradeTier grade;
        uint32 score; // multiplied by 100 (e.g., 9640 = 96.40%)
        uint32 xpEarned;
        uint256 timestamp;
        bool exists;
    }

    address public immutable owner;
    mapping(bytes32 => ProofRecord) public proofs;
    mapping(address => bytes32[]) public developerProofs;

    event ProofAnchored(
        bytes32 indexed proofHash,
        address indexed developer,
        string projectId,
        GradeTier grade,
        uint32 score,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "ProofRegistry: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Registers an evaluated proof anchor for a project.
     * @param developer The address of the candidate.
     * @param projectId Unique slug or ID of the project.
     * @param sha256MerkleRoot SHA-256 hash of the Git tree and AI audit report.
     * @param grade GradeTier (0=O, 1=A, 2=B, 3=C, 4=D, 5=E).
     * @param score Granular evaluation score (0-10000).
     * @param xpEarned Verifiable XP granted.
     */
    function anchorProof(
        address developer,
        string calldata projectId,
        bytes32 sha256MerkleRoot,
        GradeTier grade,
        uint32 score,
        uint32 xpEarned
    ) external onlyOwner returns (bytes32) {
        bytes32 proofHash = keccak256(
            abi.encodePacked(developer, projectId, sha256MerkleRoot, block.timestamp)
        );

        require(!proofs[proofHash].exists, "ProofRegistry: proof already anchored");

        proofs[proofHash] = ProofRecord({
            developer: developer,
            projectId: projectId,
            sha256MerkleRoot: sha256MerkleRoot,
            grade: grade,
            score: score,
            xpEarned: xpEarned,
            timestamp: block.timestamp,
            exists: true
        });

        developerProofs[developer].push(proofHash);

        emit ProofAnchored(proofHash, developer, projectId, grade, score, block.timestamp);

        return proofHash;
    }

    /**
     * @notice Returns total number of proofs anchored by a developer.
     */
    function getDeveloperProofCount(address developer) external view returns (uint256) {
        return developerProofs[developer].length;
    }

    /**
     * @notice Checks if a proof hash is valid and returns the record.
     */
    function verifyProof(bytes32 proofHash) external view returns (ProofRecord memory) {
        require(proofs[proofHash].exists, "ProofRegistry: proof does not exist");
        return proofs[proofHash];
    }
}
