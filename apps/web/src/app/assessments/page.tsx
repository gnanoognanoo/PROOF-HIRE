"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MOCK_ASSESSMENT_SCENARIO } from "@/lib/mock-data";
import { 
  Clock, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  AlertCircle, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Share2, 
  Play, 
  Code, 
  Cpu, 
  Lock,
  Terminal,
  Send,
  Sparkles
} from "lucide-react";

export default function AssessmentsPage() {
  const scenario = MOCK_ASSESSMENT_SCENARIO;
  const [selectedOption, setSelectedOption] = useState("opt_b");
  const [writtenRationale, setWrittenRationale] = useState(
    "Option B guarantees that partitioned followers cannot bump their local terms indefinitely without quorum contact, thereby preventing subsequent phantom leader invalidation upon rejoining."
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [testOutput, setTestOutput] = useState<{
    passed: number;
    total: number;
    failingTest?: string;
  }>({
    passed: 12,
    total: 14,
    failingTest: "test_asymmetric_lease_staleness_drop: assertion failed: 'votes >= quorum_threshold' with synthetic packet latency of 450ms."
  });
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRunTests = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setTestOutput({
        passed: 14,
        total: 14
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-neutral-900">
      <TopNav />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col pb-12">
          <Breadcrumb
            items={[
              { label: "assessments", href: "/assessments" },
              { label: "inbound-benchmark", href: "/assessments" },
              { label: "datadog-core-sre-evaluation" }
            ]}
            statusBadge="Proctored Session #PRO-8819"
          />

          <div className="p-4 lg:p-6 space-y-6 max-w-7xl">
            {/* Assessment Session Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-white shadow-subtle">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-brand-700">
                  <span>{scenario.tier}</span>
                  <span>•</span>
                  <span>Benchmark v4.1.9-rc</span>
                </div>
                <h1 className="text-lg font-bold text-neutral-900 tracking-tight mt-0.5">
                  {scenario.benchmark_name}
                </h1>
              </div>

              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-amber-200 bg-amber-50 text-amber-900">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-sm">42:11</span>
                  <span className="text-[10px] text-amber-700 uppercase">Remaining</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-neutral-50 text-neutral-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px]">Proctored Stream Nominal · Integrity Verified</span>
                </div>
              </div>
            </div>

            {/* Split Arena: Question & Code Critique vs Proctored Jitsi Live Stream */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left 8 Cols: Technical Scenario & Code Audit */}
              <div className="xl:col-span-8 space-y-6">
                {/* Scenario 1: Split Brain Raft Quorum */}
                <div className="rounded-lg border border-border bg-white p-5 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                      <h2 className="text-sm font-bold text-neutral-900">
                        {scenario.scenario_title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-neutral-500">
                      Weight: 35 Pts · Est. 18 min
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {scenario.scenario_description}
                  </p>

                  {/* Architecture Ascii Graph */}
                  <div className="rounded-md border border-border bg-canvas p-3 font-mono text-[11px] text-neutral-800 overflow-x-auto leading-relaxed">
                    <pre>{scenario.architecture_diagram}</pre>
                  </div>

                  {/* Question */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-neutral-900">
                      {scenario.question}
                    </div>

                    <div className="space-y-2">
                      {scenario.options.map((opt) => {
                        const isSelected = selectedOption === opt.id;
                        return (
                          <label
                            key={opt.id}
                            onClick={() => setSelectedOption(opt.id)}
                            className={`block p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? "border-brand-600 bg-brand-50/50 shadow-subtle"
                                : "border-border bg-white hover:bg-neutral-50"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="radio"
                                name="scenario_opt"
                                checked={isSelected}
                                onChange={() => setSelectedOption(opt.id)}
                                className="mt-0.5 text-brand-600 focus:ring-0"
                              />
                              <div className="space-y-0.5">
                                <div className="font-semibold text-neutral-900">{opt.text}</div>
                                <div className="text-[11px] text-neutral-500 font-mono">{opt.rationale}</div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Formal Invariant Justification Box */}
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-900">
                        Formal Justification & State Machine Invariant
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">Min. 60 words for peer score</span>
                    </div>
                    <textarea
                      rows={3}
                      value={writtenRationale}
                      onChange={(e) => setWrittenRationale(e.target.value)}
                      className="w-full p-2.5 text-xs font-mono rounded-md border border-border bg-canvas text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Scenario 2: Rust TOCTOU Code Critique */}
                <div className="rounded-lg border border-border bg-white p-5 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-amber-600" />
                      <h2 className="text-sm font-bold text-neutral-900">
                        Section 2: Code Critique — Race Invariant Detection
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-neutral-500">Rust Concurrency</span>
                  </div>

                  <p className="text-xs text-neutral-700">
                    Identify the memory safety or synchronization bug in this concurrent lease manager thread pool. State the line number and the precise interleaving scenario.
                  </p>

                  <div className="rounded-md border border-border bg-neutral-900 text-neutral-200 p-3.5 font-mono text-xs overflow-x-auto leading-relaxed">
                    <pre className="text-emerald-400 font-semibold mb-1">// {scenario.code_critique.file_name}</pre>
                    <pre>{scenario.code_critique.code_snippet}</pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1 text-xs">
                      <label className="font-semibold text-neutral-800">Vulnerable Line Offset</label>
                      <input
                        type="text"
                        defaultValue="Lines 05-07 (TOCTOU between drop(current) and write_guard)"
                        className="w-full h-8 px-2.5 rounded border border-border bg-canvas font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="font-semibold text-neutral-800">Prescribed Remediation</label>
                      <input
                        type="text"
                        defaultValue="Upgrade lock atomically or hold parking_lot UpgradableRwLock"
                        className="w-full h-8 px-2.5 rounded border border-border bg-canvas font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* WASM Test Harness Panel */}
                  <div className="p-3 rounded-lg border border-border bg-canvas space-y-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 uppercase text-[10px]">Test Harness:</span>
                        <span className="font-bold text-neutral-900">{testOutput.passed} / {testOutput.total} Test Cases Passing</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Heap: 4.2 MB · Exec Latency: 1.1ms</span>
                    </div>

                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          testOutput.passed === testOutput.total ? "bg-emerald-600" : "bg-amber-500"
                        }`}
                        style={{ width: `${(testOutput.passed / testOutput.total) * 100}%` }}
                      ></div>
                    </div>

                    {testOutput.failingTest && (
                      <div className="p-2 rounded bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>Failing: {testOutput.failingTest}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={handleRunTests}
                        disabled={isCompiling}
                        className="px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-subtle transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        <span>{isCompiling ? "Compiling Sandbox..." : "Run Test Suite"}</span>
                      </button>

                      <span className="text-[11px] text-neutral-500">
                        Rust 1.78.0 · Wasm Sandbox Isolated
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Live Proctored Stream Tile & Session Ledger */}
              <div className="xl:col-span-4 space-y-5">
                {/* Proctored Video Tile (Jitsi Meet Integration Preview) */}
                <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Live Collaborative Stream</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">P2P Encrypted · 18ms</span>
                  </div>

                  {/* Interviewer Stream */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-border">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop&crop=faces"
                      alt="Interviewer"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
                      <span>Dr. Sarah Vance (Staff Architect @ Datadog)</span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-emerald-400">
                      Host
                    </div>
                  </div>

                  {/* Candidate Stream Preview */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800 border border-border">
                    {camActive ? (
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=250&fit=crop&crop=faces"
                        alt="Candidate"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-neutral-500 text-xs font-mono">
                        Camera Feed Muted
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
                      <span>Alex Chen (You)</span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-mono">
                      Identity Confirmed
                    </div>
                  </div>

                  {/* Media Controls */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => setMicActive(!micActive)}
                      className={`p-2 rounded-md border text-xs transition-colors ${
                        micActive ? "border-border bg-white text-neutral-700 hover:bg-neutral-50" : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setCamActive(!camActive)}
                      className={`p-2 rounded-md border text-xs transition-colors ${
                        camActive ? "border-border bg-white text-neutral-700 hover:bg-neutral-50" : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {camActive ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </button>
                    <button className="px-3 py-1.5 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1">
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Shared Code Scratchpad */}
                <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-border text-xs font-semibold text-neutral-900">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Code className="h-3.5 w-3.5 text-brand-600" />
                      <span>consensus_guard.rs</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Live Sync</span>
                  </div>

                  <textarea
                    rows={6}
                    defaultValue={`// Implement verifiable state reconciliation under asymmetric lease revocation\nimpl DistributedLeaseEngine {\n    pub fn verify_pre_vote_quorum(&self, ballot: &Ballot) -> bool {\n        let total_nodes = self.peers.len() + 1;\n        let quorum_threshold = (total_nodes / 2) + 1;\n        ballot.affirmative_votes >= quorum_threshold\n    }\n}`}
                    className="w-full p-2 text-[11px] font-mono rounded border border-border bg-neutral-50 text-neutral-800 leading-tight focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Final Attestation Bar */}
            <div className="rounded-lg border border-border bg-white p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-neutral-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Ledger Attestation: Polygon PoS Commit <code className="text-neutral-900 font-bold">0x6b7b2f...8019</code> (Valid)</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-700 font-sans text-xs">
                  Save Draft
                </button>
                <button
                  onClick={() => setIsSubmitted(true)}
                  className="px-4 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-sans text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitted ? "Score Attested (98.5%)" : "Submit for Final Evaluation"}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
