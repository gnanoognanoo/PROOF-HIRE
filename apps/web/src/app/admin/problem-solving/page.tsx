"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Lock,
  Search,
  Code2,
  Trophy,
  Activity,
  Award,
  ChevronRight,
  FileText,
  Clock,
  Check,
  AlertTriangle,
  ExternalLink,
  Layers,
  Terminal,
  Cpu,
  User,
  SlidersHorizontal,
  Info,
  History,
  Copy,
  FileWarning
} from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { 
  getAdminVerificationQueue, 
  getAdminQueueItemDetails, 
  approveAdminVerificationItem, 
  rejectAdminVerificationItem, 
  markAdminVerificationDuplicate, 
  requestAdminVerificationEvidence, 
  retryAdminProviderSync, 
  getAdminAuditTrail 
} from "@/lib/api-client";
import { 
  AdminVerificationItem, 
  AdminQueueSection, 
  AdminQueueCounts, 
  AdminAuditLog 
} from "@/lib/types";

const ALL_SECTIONS: { id: AdminQueueSection | "audit_trail"; label: string; countKey?: keyof AdminQueueCounts }[] = [
  { id: "pending_imports", label: "Pending Imports", countKey: "pending_imports" },
  { id: "suspicious_activity", label: "Suspicious Activity", countKey: "suspicious_activity" },
  { id: "failed_verification", label: "Failed Verification", countKey: "failed_verification" },
  { id: "duplicate_detection", label: "Duplicate Detection", countKey: "duplicate_detection" },
  { id: "provider_sync_errors", label: "Provider Sync Errors", countKey: "provider_sync_errors" },
  { id: "audit_trail", label: "Audit Trail" }
];

export default function AdminProblemSolvingPage() {
  const [activeTab, setActiveTab] = useState<AdminQueueSection | "audit_trail">("pending_imports");
  const [items, setItems] = useState<AdminVerificationItem[]>([]);
  const [counts, setCounts] = useState<AdminQueueCounts>({
    all: 0,
    pending_imports: 0,
    suspicious_activity: 0,
    failed_verification: 0,
    duplicate_detection: 0,
    provider_sync_errors: 0,
    total_pending: 0,
    resolved: 0
  });
  const [audits, setAudits] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");

  // Selected item modal & action state
  const [selectedItem, setSelectedItem] = useState<AdminVerificationItem | null>(null);
  const [activeActionTab, setActiveActionTab] = useState<"approve" | "reject" | "duplicate" | "request_evidence" | "retry_sync">("approve");
  const [reasoningInput, setReasoningInput] = useState("");
  const [canonicalIdInput, setCanonicalIdInput] = useState("");
  const [requestedEvidenceChecks, setRequestedEvidenceChecks] = useState<string[]>([
    "Official University Transcript with Institutional Seal"
  ]);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Load Queue & Audit Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "audit_trail") {
        const auditRes = await getAdminAuditTrail({ limit: 100 });
        setAudits(auditRes.audits || []);
      } else {
        const queueRes = await getAdminVerificationQueue({
          section: activeTab,
          severity: severityFilter !== "all" ? severityFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          provider: providerFilter !== "all" ? providerFilter : undefined,
          search: searchQuery.trim() || undefined
        });
        setItems(queueRes.items || []);
        if (queueRes.section_counts) {
          setCounts(queueRes.section_counts);
        }
      }
    } catch (err: any) {
      console.error("Failed to load admin verification data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, severityFilter, statusFilter, providerFilter, searchQuery]);

  // Handle opening inspection modal
  const handleInspect = (item: AdminVerificationItem) => {
    setSelectedItem(item);
    setReasoningInput("");
    setCanonicalIdInput(item.duplicate_of_id || (item.evidence_json?.existing_verified_solve_id || "canon_two_sum_lc"));
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    if (item.section === "provider_sync_errors") {
      setActiveActionTab("retry_sync");
    } else if (item.section === "duplicate_detection") {
      setActiveActionTab("duplicate");
    } else {
      setActiveActionTab("approve");
    }
  };

  // Deterministic XP calculation helper
  const getDeterministicXp = (difficulty: string) => {
    const diff = difficulty?.toUpperCase() || "MEDIUM";
    const baseMap: Record<string, number> = { EASY: 6, MEDIUM: 18, HARD: 45, EXPERT: 70, UNKNOWN: 18 };
    const base = baseMap[diff] ?? 18;
    const adminModifier = 0.90;
    const skillXp = Math.round(base * adminModifier);
    const overallXp = Math.round(skillXp * 0.60);
    return { base, skillXp, overallXp, modifier: adminModifier };
  };

  // Submit Administrative Action
  const handleExecuteAction = async () => {
    if (!selectedItem) return;
    setIsSubmittingAction(true);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);

    try {
      if (activeActionTab === "approve") {
        if (!reasoningInput.trim() || reasoningInput.trim().length < 5) {
          throw new Error("Documented audit reasoning is required (minimum 5 characters).");
        }
        const res = await approveAdminVerificationItem({
          item_id: selectedItem.id,
          reasoning: reasoningInput.trim(),
          admin_name: "Gnaneshwar (Lead Security Auditor)"
        });
        setActionSuccessMessage(`Successfully approved! Awarded deterministic +${res.deterministic_skill_xp} Skill XP (+${res.deterministic_overall_xp} Overall XP). Manual XP entry was strictly bypassed.`);
      } else if (activeActionTab === "reject") {
        if (!reasoningInput.trim() || reasoningInput.trim().length < 5) {
          throw new Error("Documented audit reasoning is required (minimum 5 characters).");
        }
        await rejectAdminVerificationItem({
          item_id: selectedItem.id,
          reasoning: reasoningInput.trim(),
          admin_name: "Gnaneshwar (Lead Security Auditor)"
        });
        setActionSuccessMessage("Claim successfully rejected (0 XP awarded). Audit log updated.");
      } else if (activeActionTab === "duplicate") {
        if (!reasoningInput.trim()) {
          throw new Error("Documented audit reasoning is required.");
        }
        await markAdminVerificationDuplicate({
          item_id: selectedItem.id,
          canonical_id: canonicalIdInput.trim() || "canonical_duplicate_reference",
          reasoning: reasoningInput.trim(),
          admin_name: "Gnaneshwar (Lead Security Auditor)"
        });
        setActionSuccessMessage("Marked duplicate of canonical solve. Awarded 0 XP to prevent cross-platform XP farming.");
      } else if (activeActionTab === "request_evidence") {
        if (requestedEvidenceChecks.length === 0) {
          throw new Error("Select at least one required evidence item.");
        }
        await requestAdminVerificationEvidence({
          item_id: selectedItem.id,
          requested_items: requestedEvidenceChecks,
          notes: reasoningInput.trim() || "Please submit requested verification items within 5 business days.",
          admin_name: "Gnaneshwar (Lead Security Auditor)"
        });
        setActionSuccessMessage("Status updated to MORE EVIDENCE REQUESTED. Notification dispatched to candidate.");
      } else if (activeActionTab === "retry_sync") {
        await retryAdminProviderSync({
          error_id: selectedItem.id,
          admin_name: "Gnaneshwar (Lead Security Auditor)"
        });
        setActionSuccessMessage("Successfully triggered provider telemetry re-sync.");
      }

      // Refresh data
      setTimeout(() => {
        loadData();
      }, 800);
    } catch (err: any) {
      setActionErrorMessage(err.message || "Action failed.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 font-sans pb-20">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* ================================================== */}
        {/* BREADCRUMB & HEADER */}
        {/* ================================================== */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>Admin Console</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-700 font-semibold">Problem-Solving Verification</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-brand-600" />
                Problem-Solving Administrative Verification
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Review pending manual imports, audit suspicious activity, resolve duplicates, and inspect provider telemetry.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold shadow-subtle transition-colors disabled:opacity-60 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-neutral-600 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* TELEMETRY METRIC OVERVIEW CARDS (6 CARDS) */}
        {/* ================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-border bg-white p-3.5 shadow-subtle">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Pending Imports
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-neutral-900">{counts.pending_imports}</span>
              <span className="text-[11px] text-amber-700 font-medium">Awaiting Review</span>
            </div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 shadow-subtle">
            <div className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Suspicious Activity
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-rose-900">{counts.suspicious_activity}</span>
              <span className="text-[11px] text-rose-700 font-medium">Flagged Anomaly</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-3.5 shadow-subtle">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Failed Verifications
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-neutral-900">{counts.failed_verification}</span>
              <span className="text-[11px] text-neutral-500 font-medium">Profile Sync Errors</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-3.5 shadow-subtle">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Duplicate Clusters
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-neutral-900">{counts.duplicate_detection}</span>
              <span className="text-[11px] text-neutral-500 font-medium">Multi-Platform Solves</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-3.5 shadow-subtle">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Provider Sync Drops
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-neutral-900">{counts.provider_sync_errors}</span>
              <span className="text-[11px] text-neutral-500 font-medium">Rate Limits / 504s</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-3.5 shadow-subtle">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Audited Decisions
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-800">{counts.resolved + 3}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Immutable Trail</span>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* SECTION NAVIGATION TABS */}
        {/* ================================================== */}
        <div className="border-b border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
          {ALL_SECTIONS.map((sec) => {
            const count = sec.countKey ? counts[sec.countKey] : null;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`pb-3 pt-1 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "border-brand-600 text-brand-600 font-semibold"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <span>{sec.label}</span>
                {count !== null && count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    sec.id === "suspicious_activity"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-neutral-200 text-neutral-700"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================================================== */}
        {/* TAB CONTENT: 5 QUEUE SECTIONS */}
        {/* ================================================== */}
        {activeTab !== "audit_trail" ? (
          <div className="space-y-4">
            {/* Filters Toolbar */}
            <div className="rounded-xl border border-border bg-white p-3.5 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search candidate or problem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-neutral-300 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-brand-600"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-xs text-neutral-700 focus:outline-none"
                >
                  <option value="all">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-xs text-neutral-700 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DUPLICATE">Duplicate</option>
                  <option value="MORE_EVIDENCE_REQUESTED">Evidence Requested</option>
                  <option value="RESOLVED">Resolved</option>
                </select>

                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-neutral-300 bg-white text-xs text-neutral-700 focus:outline-none"
                >
                  <option value="all">All Providers</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="hackerrank">HackerRank</option>
                  <option value="codechef">CodeChef</option>
                  <option value="geeksforgeeks">GeeksforGeeks</option>
                  <option value="skillrack">SkillRack</option>
                  <option value="proofhire">ProofHire</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="rounded-xl border border-border bg-white shadow-subtle overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-neutral-400" />
                  <span>Loading queue items...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-neutral-800">Queue is clear</p>
                  <p className="text-neutral-400">No items match the selected section and filter parameters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-neutral-50/80 font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Problem & Platform</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Flag / Import Type</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item) => {
                        const sevColor = 
                          item.severity === "CRITICAL" ? "bg-rose-100 text-rose-800 border-rose-200" :
                          item.severity === "HIGH" ? "bg-amber-100 text-amber-800 border-amber-200" :
                          item.severity === "MEDIUM" ? "bg-blue-100 text-blue-800 border-blue-200" :
                          "bg-neutral-100 text-neutral-700 border-neutral-200";

                        const statColor = 
                          item.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                          item.status === "REJECTED" ? "bg-neutral-100 text-neutral-700 border-neutral-200 line-through" :
                          item.status === "DUPLICATE" ? "bg-purple-100 text-purple-800 border-purple-200" :
                          item.status === "MORE_EVIDENCE_REQUESTED" ? "bg-blue-100 text-blue-800 border-blue-200" :
                          "bg-amber-50 text-amber-800 border-amber-200";

                        return (
                          <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                              @{item.candidate_username}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-neutral-900 max-w-xs truncate">
                                {item.problem_title}
                              </div>
                              <div className="text-[11px] font-mono text-neutral-500 capitalize">
                                {item.provider}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase">
                                {item.difficulty}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600">
                              {item.evidence_json?.flag_reason || item.evidence_json?.import_type || item.evidence_json?.failure_type || "Telemetry Check"}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sevColor}`}>
                                {item.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${statColor}`}>
                                {item.status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleInspect(item)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-subtle transition-colors"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================================================== */
          /* TAB CONTENT: IMMUTABLE AUDIT TRAIL */
          /* ================================================== */
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-white shadow-subtle overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-neutral-50/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-700">
                    Regulatory & Compliance Audit Ledger
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Immutable log of all administrative reviews, evidence inspections, and deterministic XP awards.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {audits.length} Records Preserved
                </span>
              </div>

              {audits.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-400">
                  No audit records logged yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-neutral-50/50 font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Auditor</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Reasoning</th>
                        <th className="py-3 px-4 text-right">Deterministic XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {audits.map((a) => {
                        const actColor = 
                          a.action === "APPROVE" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          a.action === "REJECT" ? "bg-rose-100 text-rose-800 border-rose-300" :
                          a.action === "MARK_DUPLICATE" ? "bg-purple-100 text-purple-800 border-purple-300" :
                          a.action === "REQUEST_EVIDENCE" ? "bg-blue-100 text-blue-800 border-blue-300" :
                          "bg-neutral-100 text-neutral-800 border-neutral-300";

                        return (
                          <tr key={a.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                              {new Date(a.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-semibold text-neutral-900">
                              {a.admin_name}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${actColor}`}>
                                {a.action}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-neutral-800">
                              @{a.candidate_username}
                            </td>
                            <td className="py-3 px-4 max-w-md text-neutral-600 leading-relaxed text-[11px]">
                              {a.reasoning}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                              {a.deterministic_skill_xp > 0 ? (
                                <span className="text-emerald-700">+{a.deterministic_skill_xp} Skill XP (+{a.deterministic_overall_xp} Overall)</span>
                              ) : (
                                <span className="text-neutral-400">0 XP</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ================================================== */}
      {/* EVIDENCE INSPECTION & ACTION MODAL */}
      {/* ================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] rounded-xl border border-border bg-white shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-neutral-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                      {selectedItem.problem_title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 uppercase border border-neutral-200">
                      {selectedItem.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-700 uppercase border border-neutral-200">
                      {selectedItem.provider}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Candidate: @{selectedItem.candidate_username} | Queue ID: {selectedItem.id} | Severity: {selectedItem.severity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 text-xs">
              
              {/* Left Column: Evidence & Metadata (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <h4 className="font-mono uppercase tracking-wider text-[11px] font-bold text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Submitted Telemetry & Evidence Payload
                  </h4>
                  <div className="bg-neutral-900 text-neutral-100 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                    <pre>{JSON.stringify(selectedItem.evidence_json, null, 2)}</pre>
                  </div>
                </div>

                {/* Source Code Preview (if present) */}
                {selectedItem.source_code && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-mono uppercase tracking-wider text-[11px] font-bold text-neutral-500 flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5" />
                        Source Code Preview
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {selectedItem.source_code_hash}
                      </span>
                    </div>
                    <div className="bg-neutral-900 text-neutral-100 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                      <pre>{selectedItem.source_code}</pre>
                    </div>
                  </div>
                )}

                {/* Topics */}
                {selectedItem.topics && selectedItem.topics.length > 0 && (
                  <div>
                    <h4 className="font-mono uppercase tracking-wider text-[11px] font-bold text-neutral-500 mb-1">
                      Algorithmic Domains
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Deterministic XP Engine & Action Panel (6 cols) */}
              <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                <div>
                  {/* Action Tabs */}
                  <div className="flex border-b border-border mb-4">
                    <button
                      onClick={() => setActiveActionTab("approve")}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                        activeActionTab === "approve"
                          ? "border-emerald-600 text-emerald-700"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setActiveActionTab("reject")}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                        activeActionTab === "reject"
                          ? "border-rose-600 text-rose-700"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActiveActionTab("duplicate")}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                        activeActionTab === "duplicate"
                          ? "border-purple-600 text-purple-700"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Mark Duplicate
                    </button>
                    <button
                      onClick={() => setActiveActionTab("request_evidence")}
                      className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                        activeActionTab === "request_evidence"
                          ? "border-blue-600 text-blue-700"
                          : "border-transparent text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Request Evidence
                    </button>
                    {selectedItem.section === "provider_sync_errors" && (
                      <button
                        onClick={() => setActiveActionTab("retry_sync")}
                        className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                          activeActionTab === "retry_sync"
                            ? "border-brand-600 text-brand-700"
                            : "border-transparent text-neutral-500 hover:text-neutral-800"
                        }`}
                      >
                        Retry Sync
                      </button>
                    )}
                  </div>

                  {/* DETERMINISTIC XP PREVIEW BOX */}
                  {activeActionTab === "approve" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Deterministic XP Calculation
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          0.90x Admin Modifier
                        </span>
                      </div>
                      {(() => {
                        const calc = getDeterministicXp(selectedItem.difficulty);
                        return (
                          <div className="text-[11px] text-emerald-900 font-mono space-y-1">
                            <div>Base XP ({selectedItem.difficulty}): <span className="font-bold">{calc.base} XP</span></div>
                            <div>Formula: {calc.base} × 0.90 = <span className="font-bold">{calc.skillXp} Skill XP</span></div>
                            <div>Overall Professional XP (60% ratio): <span className="font-bold">+{calc.overallXp} Overall XP</span></div>
                          </div>
                        );
                      })()}
                      <p className="text-[10px] text-emerald-800 pt-1 border-t border-emerald-200/70 font-sans italic">
                        ProofHire Policy Invariant: Administrators cannot manually type or inject arbitrary XP amounts.
                      </p>
                    </div>
                  )}

                  {/* Reject Disclaimer */}
                  {activeActionTab === "reject" && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3.5 space-y-1 mb-4 text-[11px] text-rose-900">
                      <div className="font-bold flex items-center gap-1.5 text-rose-950">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        Reject Claim Confirmation
                      </div>
                      <p>
                        Rejecting will mark the problem solve as fraudulent or unverified, award strictly 0 XP, and log an immutable audit entry.
                      </p>
                    </div>
                  )}

                  {/* Mark Duplicate Panel */}
                  {activeActionTab === "duplicate" && (
                    <div className="space-y-3 mb-4">
                      <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-3 text-[11px] text-purple-900">
                        <span className="font-bold">Deduplication Invariant: </span>
                        <span>Awarded strictly 0 XP to prevent cross-platform double counting. Links to canonical reference.</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                          Canonical Problem / Solve Reference
                        </label>
                        <input
                          type="text"
                          value={canonicalIdInput}
                          onChange={(e) => setCanonicalIdInput(e.target.value)}
                          placeholder="e.g. lc_two_sum_canon_01"
                          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 font-mono focus:border-brand-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Request Evidence Checklist */}
                  {activeActionTab === "request_evidence" && (
                    <div className="space-y-2 mb-4">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-semibold">
                        Required Evidence Items Checklist
                      </label>
                      <div className="space-y-1.5 bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
                        {[
                          "Official University Transcript with Institutional Seal",
                          "Live Screen Recording of Problem Submission",
                          "Institutional (.edu) Domain Email Verification",
                          "Raw JSON/CSV Platform Export with Timestamp Headers"
                        ].map((item) => {
                          const isChecked = requestedEvidenceChecks.includes(item);
                          return (
                            <label key={item} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setRequestedEvidenceChecks(prev => prev.filter(x => x !== item));
                                  } else {
                                    setRequestedEvidenceChecks(prev => [...prev, item]);
                                  }
                                }}
                                className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                              />
                              <span className="text-neutral-800 text-[11px]">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Reasoning Input */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1 font-semibold">
                      Documented Administrative Rationale (Required)
                    </label>
                    <textarea
                      rows={3}
                      value={reasoningInput}
                      onChange={(e) => setReasoningInput(e.target.value)}
                      placeholder="Document detailed verification findings and audit reasoning..."
                      className="w-full rounded-md border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-brand-600 focus:outline-none placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Feedback Alerts */}
                  {actionSuccessMessage && (
                    <div className="mt-3 p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{actionSuccessMessage}</span>
                    </div>
                  )}

                  {actionErrorMessage && (
                    <div className="mt-3 p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{actionErrorMessage}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-3.5 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteAction}
                    disabled={isSubmittingAction}
                    className={`px-4 py-2 rounded-md text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                      activeActionTab === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : activeActionTab === "reject"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : activeActionTab === "duplicate"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-brand-600 hover:bg-brand-700"
                    }`}
                  >
                    {isSubmittingAction && <RefreshCw className="h-3 w-3 animate-spin" />}
                    <span>
                      {activeActionTab === "approve" ? "Confirm Deterministic Approval" :
                       activeActionTab === "reject" ? "Reject Claim (0 XP)" :
                       activeActionTab === "duplicate" ? "Mark as Duplicate (0 XP)" :
                       activeActionTab === "request_evidence" ? "Submit Evidence Request" :
                       "Retry Provider Sync"}
                    </span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
