import unittest
from app.services.credential_service import (
    credential_service,
    VerificationLevel,
    CredentialStatus
)

class TestCredentialVerification(unittest.TestCase):

    def test_ph8492_prompt_example_credential(self):
        """
        Verify the prompt's exact credential example:
        Credential ID: PH-8492
        Status: Verified
        Credential: Frontend Development Project
        Owner: Gnaneshwar R
        Issued: September 18, 2024
        Blockchain: Polygon
        Transaction: 0x...
        Document Integrity: Valid
        Issuer: ProofHire / verified institution
        """
        cred = credential_service.get_credential("PH-8492")
        self.assertIsNotNone(cred)
        self.assertEqual(cred["credential_id"], "PH-8492")
        self.assertEqual(cred["status"], CredentialStatus.VERIFIED)
        self.assertEqual(cred["credential_type"], "Frontend Development Project")
        self.assertEqual(cred["owner_id"], "Gnaneshwar R")
        self.assertEqual(cred["issued_date_formatted"], "September 18, 2024")
        self.assertEqual(cred["blockchain"], "Polygon")
        self.assertTrue(cred["transaction_hash"].startswith("0x"))
        self.assertEqual(cred["document_integrity"], "Valid")
        self.assertEqual(cred["issuer"], "ProofHire Verification Authority")
        self.assertEqual(cred["verification_level"], VerificationLevel.PLATFORM_VERIFIED)

    def test_three_verification_levels_exist(self):
        """Verify the 3 distinct verification levels defined in the specification."""
        self.assertEqual(VerificationLevel.USER_SUBMITTED, "User Submitted")
        self.assertEqual(VerificationLevel.PLATFORM_VERIFIED, "Platform Verified")
        self.assertEqual(VerificationLevel.ISSUER_VERIFIED, "Issuer Verified")

    def test_sha256_hash_generation(self):
        """Verify SHA-256 calculation for file bytes."""
        sample_bytes = b"Hello ProofHire Verification Engine"
        digest = credential_service.calculate_file_sha256(sample_bytes)
        
        self.assertTrue(digest.startswith("0x"))
        self.assertEqual(len(digest), 66) # "0x" + 64 hex chars

    def test_document_integrity_matching_and_tampering(self):
        """Verify document integrity check matches identical file and flags altered file."""
        original_bytes = b"ProofHire Certified System Architecture"
        altered_bytes = b"ProofHire Certified System Architecture (Tampered)"

        # Issue credential
        cred = credential_service.issue_credential(
            owner_id="Elena Rostova",
            credential_type="Kernel eBPF Architecture",
            issuer="ProofHire Systems Authority",
            entity_id="proj_ebpf_1",
            file_bytes=original_bytes,
            file_name="ebpf-spec.pdf",
            verification_level=VerificationLevel.ISSUER_VERIFIED,
            custom_credential_id="PH-TEST-EBPF"
        )

        # 1. Matching original bytes
        match_res = credential_service.verify_document_integrity("PH-TEST-EBPF", original_bytes)
        self.assertTrue(match_res["is_authentic"])
        self.assertEqual(match_res["document_integrity"], "Valid")

        # 2. Altered bytes
        tamper_res = credential_service.verify_document_integrity("PH-TEST-EBPF", altered_bytes)
        self.assertFalse(tamper_res["is_authentic"])
        self.assertEqual(tamper_res["document_integrity"], "TAMPERED_OR_ALTERED")

    def test_credential_record_contains_required_fields(self):
        """
        Verify created credential record contains:
        credential identifier, owner ID, credential type, issuer,
        entity ID, document hash, issue timestamp.
        """
        file_bytes = b"Test Content"
        rec = credential_service.issue_credential(
            owner_id="Alex Chen",
            credential_type="Storage Systems",
            issuer="Stanford Lab",
            entity_id="proj_storage",
            file_bytes=file_bytes
        )

        self.assertIn("credential_id", rec)
        self.assertIn("owner_id", rec)
        self.assertIn("credential_type", rec)
        self.assertIn("issuer", rec)
        self.assertIn("entity_id", rec)
        self.assertIn("document_hash", rec)
        self.assertIn("issue_timestamp", rec)
        # Ensure files are not stored on blockchain
        self.assertIn("storage_provider", rec)
        self.assertEqual(rec["storage_provider"], "Supabase Storage")

    def test_credential_revocation(self):
        """Verify revocation flow."""
        file_bytes = b"Revocation Test Content"
        rec = credential_service.issue_credential(
            owner_id="Sarah Lin",
            credential_type="Network Engineering",
            issuer="ProofHire",
            entity_id="proj_net",
            file_bytes=file_bytes,
            custom_credential_id="PH-TEST-REVOKE"
        )

        revoked = credential_service.revoke_credential("PH-TEST-REVOKE", "Audited code was deprecated")
        self.assertEqual(revoked["status"], CredentialStatus.REVOKED)
        self.assertEqual(revoked["document_integrity"], "REVOKED")
        self.assertEqual(revoked["revocation_reason"], "Audited code was deprecated")

if __name__ == "__main__":
    unittest.main()
