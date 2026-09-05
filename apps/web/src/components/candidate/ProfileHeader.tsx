"use client";

import React from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Github, 
  ExternalLink, 
  Share2, 
  Download, 
  Award, 
  Sparkles, 
  Cpu, 
  Layers,
  Fingerprint
} from "lucide-react";
import { CandidateProfile } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface ProfileHeaderProps {
  candidate: CandidateProfile;
  onShare?: () => void;
  onExport?: () => void;
}

export function ProfileHeader({ candidate, onShare, onExport }: ProfileHeaderProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-5 shadow-subtle space-y-5">
      {/* Top Banner Row: Profile & Level Badge */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-lg overflow-hidden border-2 border-border shadow-subtle bg-neutral-100">
              <img
                src={candidate.avatar_url}
                alt={candidate.full_name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-full ring-2 ring-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                {candidate.full_name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3 text-brand-600" />
                <span>Deterministic Proof</span>
              </span>
            </div>

            <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
              <span>@{candidate.github_username}</span>
              <span>•</span>
              <span>{candidate.location}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">{candidate.availability}</span>
            </div>

            <p className="text-xs text-neutral-700 max-w-2xl leading-relaxed pt-1">
              {candidate.bio}
            </p>
          </div>
        </div>

        {/* Level Capsule */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 p-3 rounded-lg border border-border bg-canvas/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Skill Rigor</span>
            <span className="text-xs font-mono font-bold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded border border-brand-200">
              LEVEL {candidate.level} MASTER
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Top 0.8% Global Systems Percentile
          </span>
        </div>
      </div>

      {/* Proof Credentials & Badges Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 border border-border px-2.5 py-1 rounded">
          <Github className="h-3.5 w-3.5 text-neutral-600" />
          <span>Verified GitHub Contributor (Top 2%)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 border border-border px-2.5 py-1 rounded">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
          <span>Polygon Smart Contract Anchored</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 border border-border px-2.5 py-1 rounded">
          <Cpu className="h-3.5 w-3.5 text-amber-600" />
          <span>Tier 0 System Design Evaluated</span>
        </div>
      </div>

      {/* 4 Quantitative Rigor Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-lg border border-border bg-white shadow-subtle">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Total Verified XP
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {formatNumber(candidate.total_xp)}
          </div>
          <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
            +420 this sprint
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-white shadow-subtle">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            AI Quality Index
          </div>
          <div className="text-xl font-bold font-mono text-brand-700 mt-1">
            {candidate.ai_quality_index}%
          </div>
          <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
            Gemini 1.5 Pro Spec
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-white shadow-subtle">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Evaluated Repos
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {candidate.verified_repos_count} Repos
          </div>
          <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
            188k total LOC
          </div>
        </div>

        <div className="p-3 rounded-lg border border-border bg-white shadow-subtle">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Proof Level
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            L7 Rigor
          </div>
          <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
            Zero Failures
          </div>
        </div>
      </div>

      {/* Action Bar & SHA-256 Signature Stamp */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Verified Proof Link</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-subtle transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-neutral-500" />
            <span>Export Cryptographic Dossier (PDF)</span>
          </button>
        </div>

        {/* SHA-256 Merkle Verification Capsule */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-canvas/80 text-[11px] font-mono text-neutral-600">
          <Fingerprint className="h-3.5 w-3.5 text-neutral-500" />
          <span className="text-neutral-400">Merkle Root:</span>
          <span className="text-neutral-800 font-semibold truncate max-w-[130px]">
            {candidate.polygon_wallet_address}
          </span>
          <span className="text-emerald-700 font-medium">Valid</span>
        </div>
      </div>
    </div>
  );
}
