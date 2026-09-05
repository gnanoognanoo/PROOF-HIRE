"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  Share2, 
  Download, 
  ExternalLink, 
  Lock,
  Copy,
  Check
} from "lucide-react";

interface RightSidebarProps {
  profileStrength: number;
  topSkills: string[];
  availability: {
    status: string;
    openTo: string[];
  };
  currentInterests: string[];
  username: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  profileStrength,
  topSkills,
  availability,
  currentInterests,
  username,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className="space-y-4">
      {/* Profile Strength Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Profile Strength</h3>
          </div>
          <span className="text-sm font-mono font-bold text-slate-900">{profileStrength}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${profileStrength}%` }}
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-800">All-Star Tier</strong> — Repository telemetry, AST scoring, and peer validations verified.
          </span>
        </div>
      </div>

      {/* Availability Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-900">Availability</h3>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700 font-mono">
            {availability.status}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 font-medium block mb-2">Open to:</span>
          <div className="flex flex-wrap gap-1.5">
            {availability.openTo.map((item, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200/80"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Skills Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Top Skills</h3>
          <span className="text-[11px] font-mono text-slate-400">by AST XP</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded bg-slate-50 text-slate-800 border border-slate-200 font-mono font-medium hover:border-slate-300 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Current Interests Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Current Technical Focus</h3>
        <div className="flex flex-wrap gap-1.5">
          {currentInterests.map((interest, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded bg-blue-50/70 text-blue-800 border border-blue-100 font-medium"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Verifiable Credentials & Blockchain Anchor */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Cryptographic Proof
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Profile claims, code commits, and project scores are anchored to Polygon PoS contract{" "}
          <span className="font-mono text-slate-300">0x892a...c041</span>.
        </p>

        <div className="space-y-1 text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2.5">
          <div className="flex justify-between">
            <span>Identity Proof</span>
            <span className="text-emerald-400 font-semibold">Verified GPG</span>
          </div>
          <div className="flex justify-between">
            <span>Merkle Root</span>
            <span className="text-slate-300">0x7f4e...91b2</span>
          </div>
          <div className="flex justify-between">
            <span>Network</span>
            <span className="text-slate-300">Polygon Mainnet</span>
          </div>
        </div>
      </div>

      {/* Profile Actions / Export */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Verified Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export ProofHire Dossier (PDF)</span>
        </button>
      </div>
    </aside>
  );
};
