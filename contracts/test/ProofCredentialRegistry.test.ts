import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("ProofCredentialRegistry Smart Contract", function () {
  let registry: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const ProofCredentialRegistry = await ethers.getContractFactory("ProofCredentialRegistry");
    registry = await ProofCredentialRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("should deploy with deployer as owner", async function () {
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("should issue a credential and allow verification", async function () {
    const credId = "PH-8492";
    const ownerId = "Gnaneshwar R";
    const credType = "Frontend Development Project";
    const issuer = "ProofHire Verification Authority";
    const entityId = "proj_proofhire_engine";
    // Dummy 32-byte SHA-256 hash
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("proofhire-verified-evidence-bytes"));
    const verificationLevel = 1; // PLATFORM_VERIFIED

    await expect(
      registry.issueCredential(credId, ownerId, credType, issuer, entityId, docHash, verificationLevel)
    )
      .to.emit(registry, "CredentialIssued");

    const record = await registry.verifyCredential(credId);
    expect(record.credentialId).to.equal(credId);
    expect(record.ownerId).to.equal(ownerId);
    expect(record.credentialType).to.equal(credType);
    expect(record.issuer).to.equal(issuer);
    expect(record.documentHash).to.equal(docHash);
    expect(record.verificationLevel).to.equal(verificationLevel);
    expect(record.status).to.equal(0); // ACTIVE
  });

  it("should verify document integrity correctly", async function () {
    const credId = "PH-8492";
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("original-document-bytes"));
    const alteredDocHash = ethers.keccak256(ethers.toUtf8Bytes("tampered-document-bytes"));

    await registry.issueCredential(
      credId,
      "Gnaneshwar R",
      "Frontend Development Project",
      "ProofHire",
      "proj_1",
      docHash,
      1
    );

    // Matching hash
    const [isAuthenticValid, isActiveValid] = await registry.verifyDocumentIntegrity(credId, docHash);
    expect(isAuthenticValid).to.be.true;
    expect(isActiveValid).to.be.true;

    // Altered hash
    const [isAuthenticInvalid, isActiveInvalid] = await registry.verifyDocumentIntegrity(credId, alteredDocHash);
    expect(isAuthenticInvalid).to.be.false;
    expect(isActiveInvalid).to.be.true;
  });

  it("should allow issuer to revoke a credential", async function () {
    const credId = "PH-REVOKE-TEST";
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("sample-hash"));

    await registry.issueCredential(credId, "Alex Chen", "Test Cred", "ProofHire", "e1", docHash, 0);

    await registry.revokeCredential(credId, "Evidence superseded by newer audit version");

    const record = await registry.verifyCredential(credId);
    expect(record.status).to.equal(1); // REVOKED
    expect(record.revocationReason).to.equal("Evidence superseded by newer audit version");
    expect(record.revokedAt).to.be.greaterThan(0);
  });
});
