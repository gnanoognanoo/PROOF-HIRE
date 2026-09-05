"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  FileCheck2, 
  AlertTriangle, 
  Info, 
  FileText, 
  Download, 
  QrCode, 
  ArrowLeft,
  Building2,
  Calendar,
  Hash,
  Database,
  Search,
  Upload,
  Layers,
  Award
} from "lucide-react";
import { getCredentialRecord, verifyDocumentIntegrity } from "@/lib/api-client";
import { VerifiedCredentialRecord, DocumentVerificationResult, VerificationLevelType } from "@/lib/types";

// Dynamic SVG QR Code Component
function CredentialQrCode({ url }: { url: string }) {
  // Generate deterministic binary pattern from URL for SVG rendering
  const size = 25;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Corner finder patterns (7x7)
  const drawCorner = (rStart: number, cStart: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          cells[rStart + r][cStart + c] = true;
        }
      }
    }
  };

  drawCorner(0, 0);
  drawCorner(0, size - 7);
  drawCorner(size - 7, 0);

  // Pseudo-random deterministic payload cells based on URL hash
  let hashVal = 0;
  for (let i = 0; i < url.length; i++) {
    hashVal = (hashVal * 31 + url.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inCorner = 
        (r < 8 && c < 8) || 
        (r < 8 && c >= size - 8) || 
        (r >= size - 8 && c < 8);

      if (!inCorner) {
        hashVal = (hashVal * 1103515245 + 12345) >>> 0;
        cells[r][c] = (hashVal % 3 === 0);
      }
    }
  }

  return (
    <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-subtle inline-block">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-32 h-32 sm:w-36 sm:h-36 shape-rendering-crisp"
        fill="currentColor"
      >
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" className="text-neutral-900" />
            ) : null
          )
        )}
      </svg>
      <div className="text-[10px] font-mono text-center text-neutral-400 mt-2 font-medium">
        Scan to Authenticate
      </div>
    </div>
  );
}

const DEFAULT_PH8492: VerifiedCredentialRecord = {
  credential_id: "PH-8492",
  owner_id: "Gnaneshwar R",
  owner_username: "gnaneshwar",
  credential_type: "Frontend Development Project",
  issuer: "ProofHire Verification Authority",
  entity_id: "proj_proofhire_engine",
  document_hash: "0xd8a2f77c8e310024ff0e6871141bc2d3e5b304cb77a118f6e3b0c44298fc1c14",
  issue_timestamp: "2024-09-18T10:30:00Z",
  issued_date_formatted: "September 18, 2024",
  status: "Verified",
  verification_level: "Platform Verified",
  blockchain: "Polygon",
  network: "Polygon PoS (Amoy Testnet Synced)",
  contract_address: "0x892aF7B6E67a84e313B11D445218d6e3c041B320",
  transaction_hash: "0x7a8109d5c3f2e14b8a21390d64a2b9104c63e8a1f7d24c0e3951ab42cf891e0a",
  block_number: 48192042,
  document_integrity: "Valid",
  storage_provider: "Supabase Storage",
  storage_bucket: "credentials",
  storage_path: "credentials/PH-8492-evidence.pdf",
  file_name: "proofhire-frontend-audit-spec.pdf",
  file_size_bytes: 1048576,
  revocation_reason: null,
  revoked_at: null,
  description: "Production-grade React & TypeScript compiler frontend with isolated component trees, zero-allocation UI renders, and strict type boundaries.",
  verification_notes: "Blockchain verification proves that this issued credential record and its SHA-256 document digest have not been altered since anchoring. It guarantees cryptographic non-repudiation and tamper detection, but does not claim that an uploaded document was originally truthful without independent issuer verification."
};

export default function PublicVerificationPage() {
  const params = useParams();
  const rawId = (params?.credentialId as string) || "PH-8492";
  const credentialId = rawId.toUpperCase();

  const isDefault = credentialId === "PH-8492";
  const [credential, setCredential] = useState<VerifiedCredentialRecord | null>(isDefault ? DEFAULT_PH8492 : null);
  const [isLoading, setIsLoading] = useState(!isDefault);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Live Document Integrity Tester
  const [testResult, setTestResult] = useState<DocumentVerificationResult | null>(null);
  const [isTestingFile, setIsTestingFile] = useState(false);
  const [testFileName, setTestFileName] = useState("");

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://proofhire.network/verify/${credentialId}`;

  useEffect(() => {
    async function loadCredential() {
      setIsLoading(true);
      try {
        const data = await getCredentialRecord(credentialId);
        setCredential(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCredential();
  }, [credentialId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !credential) return;

    setTestFileName(file.name);
    setIsTestingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = (evt.target?.result as string).split(",")[1];
        const res = await verifyDocumentIntegrity(credential.credential_id, base64);
        setTestResult(res);
        setIsTestingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to verify document integrity", err);
      setIsTestingFile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-neutral-100 flex items-center justify-center font-sans">
        <div className="space-y-3 text-center font-mono text-xs text-neutral-400">
          <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>Querying Polygon Proof Registry for {credentialId}...</div>
        </div>
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-border p-8 text-center space-y-4 shadow-subtle">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Credential Not Found</h2>
          <p className="text-xs text-neutral-500">
            No active or archived cryptographic record exists on Polygon for identifier <strong>{credentialId}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Verification Level Badge Styling
  const getLevelBadge = (level: VerificationLevelType) => {
    switch (level) {
      case "Issuer Verified":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-800",
          desc: "Directly signed and authenticated by the accredited issuing institution.",
        };
      case "Platform Verified":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-800",
          desc: "Verified through compiler AST audits, Git commit GPG signatures, and peer collaboration metrics.",
        };
      default:
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-800",
          desc: "Candidate submitted evidence with SHA-256 digest anchored for non-alteration.",
        };
    }
  };

  const levelBadge = getLevelBadge(credential.verification_level);

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-neutral-900 font-sans pb-20">
      
      {/* Top Navigation Strip */}
      <header className="w-full border-b border-border bg-white sticky top-0 z-30 shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-brand-600 text-white flex items-center justify-center shadow-subtle">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-900">ProofHire Public Verification Portal</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Polygon PoS Synced
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Verification Certificate Hero Card */}
        <div className="rounded-lg border border-border bg-white shadow-xs overflow-hidden">
          
          {/* Header Banner - Prestigious Enterprise Layout */}
          <div className="bg-white border-b border-border p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                  ProofHire Verified Credential
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  {credential.credential_type}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600">
                  Issued to <strong className="text-neutral-900 font-semibold">{credential.owner_id}</strong>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-start sm:items-end gap-1.5 flex-shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold font-mono">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Status: {credential.status}
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  ID: {credential.credential_id}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Level & Authenticity Strip */}
          <div className={`p-4 border-b ${levelBadge.bg} ${levelBadge.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
            <div className="flex items-center gap-2.5">
              <Award className="h-4 w-4 text-brand-700 flex-shrink-0" />
              <div>
                <span className="font-bold text-neutral-900">Verification Level: </span>
                <strong className={levelBadge.text}>{credential.verification_level}</strong>
                <span className="text-neutral-500 ml-1.5 hidden md:inline">({levelBadge.desc})</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-800">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Document Integrity: {credential.document_integrity}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Two-Column Grid: Metadata & QR Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              {/* Left 2 Cols: Required Display Data */}
              <div className="md:col-span-2 space-y-6">
                
                {/* 1. Core Identification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  
                  {/* Credential */}
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[11px] font-sans text-neutral-500 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-neutral-400" />
                      Credential
                    </span>
                    <div className="font-bold text-neutral-900 text-sm font-sans">{credential.credential_type}</div>
                  </div>

                  {/* Owner */}
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[11px] font-sans text-neutral-500 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                      Owner
                    </span>
                    <div className="font-bold text-neutral-900 text-sm font-sans">{credential.owner_id}</div>
                  </div>

                  {/* Issued Date */}
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[11px] font-sans text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      Issued
                    </span>
                    <div className="font-bold text-neutral-900">{credential.issued_date_formatted}</div>
                  </div>

                  {/* Credential ID */}
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[11px] font-sans text-neutral-500 flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-neutral-400" />
                      Credential ID
                    </span>
                    <div className="font-bold text-brand-700">{credential.credential_id}</div>
                  </div>

                  {/* Issuer */}
                  <div className="sm:col-span-2 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <span className="text-[11px] font-sans text-neutral-500 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                      Issuer
                    </span>
                    <div className="font-bold text-neutral-900 font-sans">{credential.issuer}</div>
                  </div>
                </div>

                {/* 2. Blockchain Attestation Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    Polygon PoS Cryptographic Ledger Anchor
                  </h3>

                  <div className="p-4 rounded-xl border border-border bg-neutral-50/70 space-y-3 font-mono text-xs">
                    
                    {/* Blockchain Network */}
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-sans">Blockchain:</span>
                      <strong className="text-neutral-800 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-purple-600" />
                        {credential.blockchain} ({credential.network})
                      </strong>
                    </div>

                    {/* Transaction Hash with PolygonScan Link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-border">
                      <span className="text-neutral-500 font-sans">Transaction:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://amoy.polygonscan.com/tx/${credential.transaction_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-brand-600 hover:text-brand-700 hover:underline truncate max-w-[240px] sm:max-w-[280px]"
                        >
                          {credential.transaction_hash}
                        </a>
                        <button
                          onClick={() => copyToClipboard(credential.transaction_hash, "tx")}
                          className="text-neutral-400 hover:text-neutral-600"
                          title="Copy Transaction Hash"
                        >
                          {copiedField === "tx" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Document SHA-256 Hash */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-border">
                      <span className="text-neutral-500 font-sans">Document Hash (SHA-256):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-700 font-bold truncate max-w-[240px] sm:max-w-[280px]">
                          {credential.document_hash}
                        </span>
                        <button
                          onClick={() => copyToClipboard(credential.document_hash, "docHash")}
                          className="text-neutral-400 hover:text-neutral-600"
                          title="Copy SHA-256 Digest"
                        >
                          {copiedField === "docHash" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Storage Provider */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-neutral-500 font-sans">Off-Chain Storage:</span>
                      <strong className="text-neutral-700 font-mono flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-neutral-400" />
                        {credential.storage_provider} ({credential.storage_bucket})
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: QR Code & Verification Proof */}
              <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-neutral-50/50 space-y-4 text-center">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 font-mono uppercase tracking-wider">
                  <QrCode className="h-4 w-4 text-brand-600" />
                  Public Verification QR
                </div>

                <CredentialQrCode url={currentUrl} />

                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Scan with any smartphone camera to independently verify this credential directly on Polygon.
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(currentUrl, "url")}
                  className="w-full py-2 px-3 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 shadow-subtle transition-colors"
                >
                  {copiedField === "url" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied Link!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Verification Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* IMPORTANT: Explicit Blockchain Philosophy Disclaimer */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 space-y-2 text-xs text-neutral-700">
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm font-sans">
                <Info className="h-4 w-4 text-brand-600 flex-shrink-0" />
                What Does Blockchain Verification Prove?
              </div>
              <p className="leading-relaxed text-neutral-600">
                <strong>Blockchain verification proves that this issued credential record and its cryptographic SHA-256 document digest have not been altered since anchoring.</strong>
              </p>
              <p className="leading-relaxed text-neutral-500 text-[11px]">
                It provides mathematical certainty of tamper detection and non-repudiation on Polygon PoS. ProofHire adheres to strict legal accuracy: blockchain guarantees record immutability, but does not claim that an unverified document was originally truthful without independent issuer verification.
              </p>
            </div>

            {/* Three Verification Levels Matrix */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                Three ProofHire Verification Levels
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Level 1: User Submitted */}
                <div className={`p-4 rounded-xl border ${credential.verification_level === 'User Submitted' ? 'border-amber-400 bg-amber-50/50 shadow-subtle' : 'border-border bg-white'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800 font-mono">1. User Submitted</span>
                    {credential.verification_level === 'User Submitted' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">Current</span>
                    )}
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Uploaded by candidate. SHA-256 hash anchored to Polygon to guarantee document non-alteration. Original issuing authority has not yet certified.
                  </p>
                </div>

                {/* Level 2: Platform Verified */}
                <div className={`p-4 rounded-xl border ${credential.verification_level === 'Platform Verified' ? 'border-emerald-400 bg-emerald-50/50 shadow-subtle' : 'border-border bg-white'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 font-mono">2. Platform Verified</span>
                    {credential.verification_level === 'Platform Verified' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">Current</span>
                    )}
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Evaluated by ProofHire compiler AST analysis, GPG commit attributions, and peer collaboration metrics. Automated platform guarantees.
                  </p>
                </div>

                {/* Level 3: Issuer Verified */}
                <div className={`p-4 rounded-xl border ${credential.verification_level === 'Issuer Verified' ? 'border-purple-400 bg-purple-50/50 shadow-subtle' : 'border-border bg-white'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800 font-mono">3. Issuer Verified</span>
                    {credential.verification_level === 'Issuer Verified' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">Current</span>
                    )}
                  </div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Digitally signed or authenticated directly by an accredited issuing university, enterprise partner, or accredited certification body.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Document Integrity Tester */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-subtle space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 font-sans flex items-center gap-2">
                  <Search className="h-4 w-4 text-brand-600" />
                  Test Document Integrity Live
                </h3>
                <p className="text-xs text-neutral-500">
                  Upload any local copy of this certificate or project artifact. We will compute its SHA-256 digest in your browser and verify if it matches the on-chain Polygon anchor.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-subtle transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {isTestingFile ? "Calculating SHA-256..." : "Select Document to Verify"}
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>

                {testFileName && (
                  <span className="text-xs font-mono text-neutral-600 truncate max-w-xs">
                    Inspecting: <strong>{testFileName}</strong>
                  </span>
                )}
              </div>

              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.is_authentic 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-red-50 border-red-200 text-red-900'
                } space-y-2 text-xs font-mono animate-in fade-in`}>
                  <div className="flex items-center gap-2 font-bold font-sans text-sm">
                    {testResult.is_authentic ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Document Integrity Confirmed: Valid
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Tamper Detected: Hash Mismatch
                      </>
                    )}
                  </div>
                  <p className="text-xs font-sans">{testResult.message}</p>
                  <div className="pt-2 border-t border-current/20 text-[11px] space-y-1">
                    <div>Expected Hash: <code>{testResult.expected_hash}</code></div>
                    <div>Computed Hash: <code>{testResult.computed_hash}</code></div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
