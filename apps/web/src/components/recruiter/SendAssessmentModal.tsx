"use client";

import React, { useState } from "react";
import { X, Send, Award, CheckCircle2, ShieldCheck } from "lucide-react";

interface SendAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateUsername: string;
  candidateName: string;
  onConfirm: (assessmentName: string) => Promise<any>;
}

export function SendAssessmentModal({
  isOpen,
  onClose,
  candidateUsername,
  candidateName,
  onConfirm,
}: SendAssessmentModalProps) {
  const [assessmentName, setAssessmentName] = useState(
    "Standardized Systems Engineering Benchmark"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const assessmentOptions = [
    "Standardized Systems Engineering Benchmark",
    "Frontend State Machine Concurrency Challenge",
    "Distributed Key-Value Consistency & Raft Simulation",
    "High-Performance Compiler AST Parsing & Linting Audit",
    "Full-Stack TypeScript & Contract Architecture Assessment",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(assessmentName);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-surface border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">Send Skill Assessment</h3>
              <p className="text-xs text-neutral-400 font-mono">Recipient: {candidateName} (@{candidateUsername})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-100">Assessment Dispatched!</h4>
              <p className="text-xs text-neutral-300">
                The proctored challenge <span className="font-semibold text-neutral-100">&ldquo;{assessmentName}&rdquo;</span> has been dispatched to @{candidateUsername}. Results will be anchored on-chain upon completion.
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
                Select Assessment Module
              </label>
              <div className="space-y-2">
                {assessmentOptions.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      assessmentName === opt
                        ? "bg-brand-500/10 border-brand-500/40 text-neutral-100"
                        : "bg-canvas border-border text-neutral-300 hover:bg-neutral-800/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="assessment"
                      value={opt}
                      checked={assessmentName === opt}
                      onChange={(e) => setAssessmentName(e.target.value)}
                      className="mt-0.5 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="text-xs font-semibold">{opt}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        Proctored • 45 min • Automated AST Scoring
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Assessment attempts are cryptographically attested and automatically feed into the candidate&apos;s deterministic Reputation Grade.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-canvas border border-border hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Dispatching..." : "Send Assessment"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
