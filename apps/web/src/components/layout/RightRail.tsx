"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ExternalLink, 
  ArrowUpRight, 
  GitPullRequest, 
  Clock, 
  Building2, 
  Hash, 
  Lock,
  Radar
} from "lucide-react";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import { getGradeBadgeStyle, formatAddress } from "@/lib/utils";

export function RightRail() {
  return (
    <aside className="w-80 shrink-0 border-l border-border bg-surface p-4 space-y-5 overflow-y-auto h-[calc(100vh-3.5rem)] sticky top-14 hidden 2xl:block">
      {/* 1. Skill Matrix Quick Tier */}
      <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
            <Radar className="h-3.5 w-3.5 text-brand-600" />
            <span>Verified Skill Matrix</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Score Tier</span>
        </div>

        <div className="space-y-2">
          {MOCK_CURRENT_USER.skills.map((skill) => {
            const gradeStyle = getGradeBadgeStyle(skill.grade);
            return (
              <div key={skill.skill_name} className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700 truncate max-w-[140px]">
                  {skill.skill_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${gradeStyle.bg} ${gradeStyle.text} border ${gradeStyle.border}`}>
                    Grade {skill.grade}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 w-10 text-right">
                    ({skill.score} XP)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-border/60 text-center">
          <Link
            href="/u/gnaneshwar"
            className="text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
          >
            View Complete Competency Breakdown
          </Link>
        </div>
      </div>

      {/* 2. Inbound Recruiter Pipeline */}
      <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
            <Building2 className="h-3.5 w-3.5 text-amber-600" />
            <span>Hiring Activity</span>
          </div>
          <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
            3 Inbound
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 mb-3">
          Candidate has active, verifiable zero-knowledge outreach enabled.
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-2 rounded border border-border/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">Datadog</span>
              <span className="text-[10px] font-mono px-1 rounded bg-brand-50 text-brand-700 border border-brand-200">
                Priority
              </span>
            </div>
            <div className="text-[11px] text-neutral-600 mt-0.5">
              Principal Infra Eng · $420k+
            </div>
          </div>

          <div className="p-2 rounded border border-border/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">Cloudflare</span>
              <ArrowUpRight className="h-3 w-3 text-neutral-400" />
            </div>
            <div className="text-[11px] text-neutral-600 mt-0.5">
              Workers Core Team · Remote
            </div>
          </div>

          <div className="p-2 rounded border border-border/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-900">Scale AI</span>
              <ArrowUpRight className="h-3 w-3 text-neutral-400" />
            </div>
            <div className="text-[11px] text-neutral-600 mt-0.5">
              Cluster Architect · SF
            </div>
          </div>
        </div>
      </div>

      {/* 3. Polygon On-Chain Ledger Status */}
      <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
            Polygon Testnet Stamp
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-500">Block Height</span>
            <span className="font-semibold text-neutral-800">#48,192,042</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Verification State</span>
            <span className="text-emerald-700 font-semibold">Finalized (128/128)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">ZK-SNARK Proof</span>
            <span className="text-neutral-700 truncate max-w-[120px]">0x89bc4bef11...</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-border/80 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-neutral-500">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>Cryptographically Sealed</span>
          </span>
          <a 
            href="https://amoy.polygonscan.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline inline-flex items-center gap-0.5"
          >
            View Ledger Log
          </a>
        </div>
      </div>

      {/* 4. Collaboration Graph Statistics */}
      <div className="rounded-lg border border-border bg-white p-3.5 shadow-subtle">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-border">
          <span className="text-xs font-semibold text-neutral-900">Collaboration Graph</span>
          <span className="text-[10px] font-mono text-emerald-600 font-medium">99.8% Approval</span>
        </div>
        <p className="text-[11px] text-neutral-500 mb-3">
          Cross-validated across 68 verified peer pull requests with cryptographic sign-off.
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-neutral-50 border border-border/60">
            <div className="text-sm font-bold text-neutral-900 font-mono">142</div>
            <div className="text-[10px] text-neutral-500 uppercase">Reviewed PRs</div>
          </div>
          <div className="p-2 rounded bg-neutral-50 border border-border/60">
            <div className="text-sm font-bold text-neutral-900 font-mono">0</div>
            <div className="text-[10px] text-neutral-500 uppercase">Reversions</div>
          </div>
          <div className="p-2 rounded bg-neutral-50 border border-border/60">
            <div className="text-sm font-bold text-neutral-900 font-mono">3.4h</div>
            <div className="text-[10px] text-neutral-500 uppercase">Avg Merge</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
