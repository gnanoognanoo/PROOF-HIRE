"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { 
  FileCode, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  GitBranch, 
  GitCommit, 
  Users, 
  Lock,
  Terminal,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";

export default function LiveCodeEvaluatorPage() {
  const [copiedHash, setCopiedHash] = useState(false);

  const copyMerkle = () => {
    navigator.clipboard?.writeText("0xd8a2f77c8e310024ff0e6871141bc2d3e5b304cb77a118f6");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-neutral-900">
      <TopNav />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col pb-12">
          <Breadcrumb
            items={[
              { label: "repositories", href: "/" },
              { label: "alexchen", href: "/" },
              { label: "hyper-raft", href: "/" },
              { label: "audit #EV-8992" }
            ]}
            statusBadge="Audit Immutable"
          />

          <div className="p-4 lg:p-6 space-y-6 max-w-6xl">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  <span>Engine: Rust 2021 (LLVM 17.0.6)</span>
                  <span>•</span>
                  <span>Commits: 384 Verified</span>
                  <span>•</span>
                  <span>Evaluated 28 mins ago</span>
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
                  Automated AI Codebase Audit & Grade Verification
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-subtle flex items-center gap-1.5 transition-colors">
                  <Download className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Export Audit JSON</span>
                </button>
                <a
                  href="https://amoy.polygonscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verify On-Chain</span>
                </a>
              </div>
            </div>

            {/* Main Grade Banner */}
            <div className="rounded-lg border border-border bg-white p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono shadow-subtle">
                  <span className="text-3xl font-black">O</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Tier 0</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-neutral-900">
                      GRADE O (OUTSTANDING)
                    </h2>
                    <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded">
                      Score: 96.2 / 100
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-500">
                    Top 1.5% Peer Cohort · Concurrency State Machine Verified
                  </div>
                  <p className="text-xs text-neutral-700 max-w-xl leading-relaxed pt-1">
                    HyperRaft implements a pipelined Raft distributed consensus protocol in safe Rust. The automated AST analysis by Gemini Code Audit confirms formal zero-cost abstractions, linearizable multi-raft state execution, and lock-free thread coordination.
                  </p>
                </div>
              </div>

              {/* Polygon Anchor Box */}
              <div className="shrink-0 p-3 rounded-lg border border-border bg-canvas/70 font-mono text-xs space-y-1.5 w-full md:w-64">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Polygon Testnet Amoy</span>
                  <span className="text-emerald-700 font-bold">#48,192,042</span>
                </div>
                <div className="text-[11px] text-neutral-700 truncate bg-white p-1.5 rounded border border-border">
                  d8a2f77c8...0b1c2d3e
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-border">
                  <span>Merkle Root: Validated</span>
                  <button onClick={copyMerkle} className="text-brand-600 hover:underline">
                    {copiedHash ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Quantitative Rigor Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-brand-600" />
                    <span>Architecture</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">98<span className="text-neutral-400 font-normal">/100</span></span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Actor model concurrency via <code className="text-neutral-800 bg-neutral-100 px-1 rounded font-mono">tokio</code> channels. Lock-free ring buffers with zero deadlock conditions detected.
                </p>
                <div className="text-[10px] font-mono text-emerald-700 pt-1">
                  Channel Contention: &lt; 0.12ms 99.8th %ile
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                  <div className="flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Idiomatic Rust</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">95<span className="text-neutral-400 font-normal">/100</span></span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Full Rust 2021 edition compliance. Clippy pedantic tier pass with <strong className="text-neutral-900 font-semibold">0 unsafe blocks</strong> across all consensus dispatchers.
                </p>
                <div className="text-[10px] font-mono text-emerald-700 pt-1">
                  Zero-Copy Parsing: Active (0 Warnings)
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Deterministic Tests</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">96.4<span className="text-neutral-400 font-normal">/100</span></span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  142 unit suites, 28 Jepsen-style chaos partitions, and automated cargo-fuzz integration tests running 4.2M mutations.
                </p>
                <div className="text-[10px] font-mono text-emerald-700 pt-1">
                  Branch Coverage: 94.8% (Chaos Resilient)
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Ergonomics & Docs</span>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">92<span className="text-neutral-400 font-normal">/100</span></span>
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Exhaustive docstrings with runnable doctests, 14 architecture decision records (ADRs), and criterion.rs automated regressions.
                </p>
                <div className="text-[10px] font-mono text-emerald-700 pt-1">
                  Doctests Passing: 31/31 (14 ADRs logged)
                </div>
              </div>
            </div>

            {/* Static Analysis Counters */}
            <div className="rounded-lg border border-border bg-white p-4 shadow-subtle grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-2 rounded bg-neutral-50 border border-border/60">
                <div className="text-[10px] uppercase text-neutral-500">Analyzed LOC</div>
                <div className="text-base font-bold text-neutral-900 mt-0.5">18,400</div>
              </div>
              <div className="p-2 rounded bg-neutral-50 border border-border/60">
                <div className="text-[10px] uppercase text-neutral-500">Avg Cyclomatic</div>
                <div className="text-base font-bold text-emerald-700 mt-0.5">2.4 <span className="text-xs font-normal text-neutral-500">(Low Risk)</span></div>
              </div>
              <div className="p-2 rounded bg-neutral-50 border border-border/60">
                <div className="text-[10px] uppercase text-neutral-500">Known Vulnerabilities</div>
                <div className="text-base font-bold text-emerald-700 mt-0.5">0 CVEs</div>
              </div>
              <div className="p-2 rounded bg-neutral-50 border border-border/60">
                <div className="text-[10px] uppercase text-neutral-500">Unsafe Code Usage</div>
                <div className="text-base font-bold text-emerald-700 mt-0.5">0.00% <span className="text-xs font-normal text-neutral-500">(Gemini AST)</span></div>
              </div>
            </div>

            {/* AST Code Diff Viewer with Semantic Proof Callouts */}
            <div className="rounded-lg border border-border bg-white overflow-hidden shadow-subtle space-y-0">
              <div className="px-4 py-2.5 bg-canvas/80 border-b border-border flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span className="text-neutral-700 font-semibold pl-2">src/consensus/raft_log.rs</span>
                </div>
                <span className="text-neutral-500 text-[11px]">Rust 2021 · 100% Clippy Pass</span>
              </div>

              <div className="p-4 bg-neutral-50/50 font-mono text-xs overflow-x-auto leading-relaxed divide-y divide-transparent">
                <div className="text-neutral-400 select-none">142  impl&lt;T: RaftPayload + Send + Sync&gt; ReplicatedLog&lt;T&gt; &#123;</div>
                <div className="text-neutral-800">143      <span className="text-brand-600 font-bold">pub fn</span> append_entries_zero_copy(&amp;<span className="text-amber-600 font-bold">mut self</span>, batch: LogBatch&lt;T&gt;) -&gt; Result&lt;LogIndex, Rafterror&gt; &#123;</div>
                <div className="text-neutral-800">144          let cursor = <span className="text-amber-600">self</span>.ring_buffer.cursor();</div>
                
                {/* Gemini AST Semantic Annotation 1 */}
                <div className="my-2 p-2.5 rounded border border-brand-200 bg-brand-50/70 text-[11px] text-brand-900 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-brand-700">
                      <Cpu className="h-3 w-3" />
                      <span>Gemini AST Tag: Lock-Free Dispatch</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-100 px-1 rounded text-[10px]">VERIFIED</span>
                  </div>
                  <p className="text-brand-800 text-[10px]">
                    Zero mutex overhead. Ring buffer operates over atomic sequence pointers with sequential memory consistency (<code className="bg-white/80 px-1 rounded">Ordering::SeqCst</code>).
                  </p>
                </div>

                <div className="text-neutral-800">145          <span className="text-brand-600 font-bold">if let</span> Some(last_term) = <span className="text-amber-600">self</span>.entries.last().map(|e| e.term) &#123;</div>
                <div className="text-neutral-800">146              <span className="text-brand-600 font-bold">if</span> batch.prev_log_term != last_term &#123;</div>
                <div className="text-neutral-800">147                  <span className="text-red-600 font-bold">return Err</span>(RaftError::TermConflict &#123; expected: last_term, got: batch.prev_log_term &#125;);</div>
                <div className="text-neutral-800">148              &#125;</div>
                <div className="text-neutral-800">149          &#125;</div>
                <div className="text-neutral-800">150          <span className="text-amber-600">self</span>.entries.extend(batch.entries.into_iter());</div>

                {/* Gemini AST Semantic Annotation 2 */}
                <div className="my-2 p-2.5 rounded border border-emerald-200 bg-emerald-50/70 text-[11px] text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Gemini AST Tag: O(1) Amortized Append</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-100 px-1 rounded text-[10px]">VERIFIED</span>
                  </div>
                  <p className="text-emerald-900 text-[10px]">
                    Pre-allocated memory pool prevents heap reallocation during fast-path quorum commitments. Zero memory copies verified by MIR compilation trace.
                  </p>
                </div>

                <div className="text-neutral-800">151          Ok(<span className="text-amber-600">self</span>.entries.len() <span className="text-brand-600 font-bold">as</span> LogIndex)</div>
                <div className="text-neutral-800">152      &#125;</div>
                <div className="text-neutral-400 select-none">153  &#125;</div>
              </div>

              <div className="px-4 py-2 bg-canvas border-t border-border flex items-center justify-between text-xs font-mono text-neutral-500">
                <span className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Memory Safety: Provably Safe · Thread Sanitizer Clean</span>
                </span>
                <span className="text-brand-600 hover:underline cursor-pointer">View full AST Graph →</span>
              </div>
            </div>

            {/* Split Row: Contributor Attribution Graph + Global Peer Benchmarks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contributor Attribution Graph */}
              <div className="rounded-lg border border-border bg-white p-4 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <Users className="h-3.5 w-3.5 text-brand-600" />
                    <span>Contributor Attribution Graph</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Git Tree Audited</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  ProofHire verifies individual authored delta weights to eliminate passive forks or borrowed codebase inflation.
                </p>

                {/* Attribution Bars */}
                <div className="space-y-2.5 pt-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-border">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="Alex Chen" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-neutral-900">Alex Chen</span>
                      <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-1 rounded">Candidate</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">78%</span>
                      <span className="text-[10px] text-neutral-400 ml-1">(14,352 LOC)</span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-600 h-full rounded-full" style={{ width: "78%" }}></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-border">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces" alt="Sarah Lin" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-neutral-900">Sarah Lin</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">14%</span>
                      <span className="text-[10px] text-neutral-400 ml-1">(2,576 LOC)</span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-neutral-500 h-full rounded-full" style={{ width: "14%" }}></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-border">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="Marcus Bell" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-neutral-900">Marcus Bell</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">8%</span>
                      <span className="text-[10px] text-neutral-400 ml-1">(1,472 LOC)</span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-neutral-400 h-full rounded-full" style={{ width: "8%" }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>100% Verified GPG Signatures</span>
                  </span>
                  <span>Key: 4A7F 9B12 EC09</span>
                </div>
              </div>

              {/* Global Peer Benchmark (L7 Rust) */}
              <div className="rounded-lg border border-border bg-white p-4 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                    <Activity className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Global Peer Benchmark (L7 Rust)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Percentile Rigor</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Calibrated against 1,240 verified Staff/Senior Systems Engineers on ProofHire.
                </p>

                <div className="space-y-3 pt-1 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-700">Throughput Handling</span>
                      <span className="font-bold text-brand-700">99th Percentile</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-600 h-full rounded-full" style={{ width: "99%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-700">Algorithmic Optimality (AST)</span>
                      <span className="font-bold text-brand-700">97th Percentile</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-600 h-full rounded-full" style={{ width: "97%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-700">Fault Tolerance Resilience</span>
                      <span className="font-bold text-brand-700">98th Percentile</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-600 h-full rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>Gemini Evaluation Hash: 0x44f9...aa18</span>
                  <a href="#audit-log" className="text-brand-600 hover:underline">View Audit Trail</a>
                </div>
              </div>
            </div>

            {/* Bottom Proof Commitment Callout */}
            <div className="rounded-lg border border-border bg-white p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    Certified Technical Assessment Stamp
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    This report is cryptographically sealed by ProofHire's Gemini Audit Engine and permanently recorded on Polygon Amoy Testnet. Tamper-resistant and directly exportable to enterprise HRIS platforms.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="h-8 px-3 rounded border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-subtle transition-colors">
                  Compare Peer Cohort
                </button>
                <button className="h-8 px-3 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle transition-colors">
                  Export Smart Contract Attestation
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
