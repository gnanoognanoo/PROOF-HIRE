"use client";

import React, { useState } from "react";
import { 
  X, 
  GitBranch, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Terminal,
  Hash
} from "lucide-react";
import { GradeTier } from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";

interface RepoSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProject: any) => void;
}

export function RepoSubmitModal({ isOpen, onClose, onSuccess }: RepoSubmitModalProps) {
  const [repoUrl, setRepoUrl] = useState("https://github.com/alexchen/hyper-raft");
  const [branch, setBranch] = useState("main");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"idle" | "evaluating" | "anchoring" | "completed">("idle");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setIsSubmitting(true);
    setStep("evaluating");

    // Realistic evaluation sequence simulation
    setTimeout(() => {
      setStep("anchoring");
      setTimeout(() => {
        const result = {
          title: "HyperRaft — Raft Consensus Core Engine",
          grade: "O" as GradeTier,
          score: 96.4,
          xp_awarded: 1450,
          tx_hash: "0x04f128e02c918a284e311d445218d6e3c041b320019",
          block_height: 48192042,
          sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          note: "Formally verified AST execution flow with 0 unsafe memory segments across all state machine dispatchers."
        };
        setEvaluationResult(result);
        setStep("completed");
        setIsSubmitting(false);
        if (onSuccess) onSuccess(result);
      }, 1200);
    }, 1400);
  };

  const handleReset = () => {
    setStep("idle");
    setEvaluationResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-dropdown overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-canvas/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Submit Repo for AI Verification</h2>
              <p className="text-[11px] text-neutral-500 font-mono">Gemini 1.5 Pro AST & Polygon Ledger Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {step === "idle" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/organization/repository"
                    className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 font-mono placeholder:text-neutral-400 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Must contain public commit history and verifiable build/test definitions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 font-mono focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">
                    Verification Rigor
                  </label>
                  <select className="w-full h-9 px-2.5 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors">
                    <option value="rigor_full">Full AST & Concurrency Audit</option>
                    <option value="rigor_fast">Standard Security Scan</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-md border border-border bg-neutral-50 text-[11px] text-neutral-600 space-y-1 font-mono">
                <div className="font-semibold text-neutral-800">Deterministic Checks Performed:</div>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                  <li>Cyclomatic complexity & unsafe memory bounds</li>
                  <li>Multi-author line attribution & GPG key signatures</li>
                  <li>SHA-256 Merkle root commitment to Polygon PoS</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md border border-border bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle transition-colors"
                >
                  Start Automated Audit
                </button>
              </div>
            </form>
          )}

          {(step === "evaluating" || step === "anchoring") && (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-neutral-900">
                  {step === "evaluating" ? "Gemini 1.5 Pro Evaluating AST..." : "Anchoring Proof to Polygon Testnet..."}
                </div>
                <div className="text-xs font-mono text-neutral-500">
                  {step === "evaluating" ? "Checking linearizability & race invariants" : "Mining Merkle root into Block #48,192,042"}
                </div>
              </div>
            </div>
          )}

          {step === "completed" && evaluationResult && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-600 text-white mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-emerald-950">
                  Verification Complete & Attested
                </div>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                  {evaluationResult.note}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded border border-border bg-canvas">
                  <div className="text-[10px] text-neutral-500 uppercase">Awarded Grade</div>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    Grade {evaluationResult.grade} ({evaluationResult.score}%)
                  </div>
                </div>
                <div className="p-2.5 rounded border border-border bg-canvas">
                  <div className="text-[10px] text-neutral-500 uppercase">Earned XP</div>
                  <div className="text-base font-bold text-brand-700 mt-0.5">
                    +{evaluationResult.xp_awarded} XP
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded border border-border bg-canvas text-[11px] font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Polygon Block:</span>
                  <span className="font-semibold text-neutral-800">#{evaluationResult.block_height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tx Hash:</span>
                  <span className="text-brand-600 truncate max-w-[200px]">{evaluationResult.tx_hash}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
