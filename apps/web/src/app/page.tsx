"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightRail } from "@/components/layout/RightRail";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProfileHeader } from "@/components/candidate/ProfileHeader";
import { ProjectCard } from "@/components/candidate/ProjectCard";
import { RepoSubmitModal } from "@/components/candidate/RepoSubmitModal";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { 
  GitBranch, 
  Layers, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  ExternalLink,
  Plus, 
  FileCode,
  Terminal,
  CheckCircle2,
  TrendingUp,
  Share2,
  X,
} from "lucide-react";

export default function CandidateWorkstationPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "evaluations" | "commits">("projects");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [candidate, setCandidate] = useState(MOCK_CURRENT_USER);
  const [notification, setNotification] = useState<string | null>(null);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setNotification("Cryptographic dossier link copied to clipboard!");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    setNotification("Compiling tamper-proof cryptographic PDF dossier...");
    setTimeout(() => {
      setNotification("Dossier compiled with Polygon Merkle verification root!");
      setTimeout(() => setNotification(null), 3000);
    }, 1200);
  };

  const handleRepoSuccess = (newResult: any) => {
    setNotification(`Successfully anchored ${newResult.title} onto Polygon!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-neutral-900">
      <TopNav onOpenSubmitModal={() => setIsSubmitModalOpen(true)} />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col pb-12">
          <Breadcrumb
            items={[
              { label: "candidate-workstation", href: "/" },
              { label: "main" }
            ]}
            statusBadge="Cryptographically Signed"
          />

          {/* Polygon Blockchain Connectivity Banner */}
          <div className="px-4 lg:px-6 py-2 bg-canvas border-b border-border/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Live On-Chain Proof</span>
              </span>
              <span>Network: <strong className="text-neutral-800">Polygon PoS Mainnet</strong></span>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <span className="hidden sm:inline">Contract: <code className="text-brand-600 font-semibold">0x892a...c041</code></span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span>Consensus Time: 18ms ago</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Synced Block #48,192,042</span>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {notification && (
            <div className="mx-4 lg:mx-6 mt-3 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800 flex items-center justify-between shadow-subtle animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 p-0.5">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Workspace Body */}
          <div className="p-4 lg:p-6 space-y-6 max-w-6xl">
            {/* Candidate Header Dossier */}
            <ProfileHeader
              candidate={candidate}
              onShare={handleShare}
              onExport={handleExport}
            />

            {/* Navigation Tabs */}
            <div className="border-b border-border">
              <div className="flex items-center gap-1 -mb-px">
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "projects"
                      ? "border-brand-600 text-brand-600 bg-surface"
                      : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Verified Projects & Artifacts</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
                    {candidate.projects.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("evaluations")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "evaluations"
                      ? "border-brand-600 text-brand-600 bg-surface"
                      : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>AST Evaluation Breakdown</span>
                </button>

                <button
                  onClick={() => setActiveTab("commits")}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "commits"
                      ? "border-brand-600 text-brand-600 bg-surface"
                      : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>Commit & PR Evidence</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Drawer Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-white shadow-subtle">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-50 text-brand-700 border border-brand-200">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    Submit Repo or PR for Verification Audit
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Executes sandbox linter, AST invariants, memory leakage audits, and gas metrics.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://github.com/alexchen/hyper-raft"
                  className="h-8 px-2.5 text-xs font-mono bg-canvas border border-border rounded text-neutral-600 w-52 hidden md:block"
                />
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="h-8 px-3 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Analyze Repo</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Verified Projects */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                {candidate.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}

                {/* Algorithmic Consistency & Commit Velocity Graph Capsule */}
                <div className="rounded-lg border border-border bg-white p-4 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-neutral-900">
                        Algorithmic Consistency & Commit Velocity
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Continuous deterministic lint runs over last 120 days
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      99.2% Green Builds
                    </span>
                  </div>

                  <div className="h-20 w-full flex items-end gap-1 pt-4 px-2">
                    {/* SVG Sparkline without unnecessary gradients */}
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 60">
                      <path
                        d="M0,50 Q40,40 80,45 T160,20 T240,30 T320,15 T400,10"
                        fill="none"
                        stroke="#0969DA"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 px-2">
                    <span>Dec 2024</span>
                    <span>Jan 2025</span>
                    <span>Feb 2025</span>
                    <span>Live (March 2025)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: AST Evaluation Breakdown */}
            {activeTab === "evaluations" && (
              <div className="rounded-lg border border-border bg-white p-5 shadow-subtle space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Formal AST Invariant Audit Engine Specifications
                  </h3>
                  <span className="text-xs font-mono text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                    Compiler-Grade Sandbox
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded border border-border bg-neutral-50/70 font-mono space-y-1">
                    <div className="font-bold text-neutral-800">1. Linearizability Invariant Verification</div>
                    <p className="text-neutral-600">
                      Evaluates Raft state log consistency across chaotic partitions. Asserts that committed indices are monotonically increasing without retroactive overwrites.
                    </p>
                  </div>

                  <div className="p-3 rounded border border-border bg-neutral-50/70 font-mono space-y-1">
                    <div className="font-bold text-neutral-800">2. Zero-Unsafe Memory Enforcer</div>
                    <p className="text-neutral-600">
                      Scans Rust AST for raw pointer dereferences, unverified transmutations, and non-atomic shared mutable state across thread boundaries.
                    </p>
                  </div>

                  <div className="p-3 rounded border border-border bg-neutral-50/70 font-mono space-y-1">
                    <div className="font-bold text-neutral-800">3. Non-Blocking I/O Concurrency Audit</div>
                    <p className="text-neutral-600">
                      Audits Linux io_uring completion queues to ensure zero worker thread starvation under 100k+ concurrent TCP streams.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Commits & PR Evidence */}
            {activeTab === "commits" && (
              <div className="rounded-lg border border-border bg-white p-5 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Verified Pull Requests & GPG Signatures
                  </h3>
                  <span className="text-xs font-mono text-emerald-700">100% GPG Verified</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded border border-border bg-canvas/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800">PR #88:</span> Lock-free io_uring ring buffer allocation for Raft snapshotting
                      <div className="text-[11px] text-neutral-500 mt-0.5">Authored by @alexchen · +1,420 / -180 LOC · Merged by @sarahlin</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      GPG: 4A7F 9B12 EC09
                    </span>
                  </div>

                  <div className="p-3 rounded border border-border bg-canvas/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-800">PR #74:</span> Tiered SSTable compaction with vectorized bloom filter checks
                      <div className="text-[11px] text-neutral-500 mt-0.5">Authored by @alexchen · +2,890 / -410 LOC · Merged by CI Runner</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                      GPG: 4A7F 9B12 EC09
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Rail */}
        <RightRail />
      </div>

      {/* Repo Submission Modal */}
      <RepoSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleRepoSuccess}
      />
    </div>
  );
}
