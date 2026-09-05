"use client";

import React from "react";
import { ProfessionalProfile } from "@/lib/types";
import { getGradeBadgeStyle, formatNumber } from "@/lib/utils";
import { Award, Zap, ShieldCheck, Info } from "lucide-react";

interface ReputationSummaryProps {
  profile: ProfessionalProfile;
}

export function ReputationSummary({ profile }: ReputationSummaryProps) {
  const gradeStyle = getGradeBadgeStyle(profile.overallGrade);
  const progressPercent = Math.min(
    100,
    Math.round((profile.totalXp / profile.targetLevelXp) * 100)
  );

  const getTierDescription = (lvl: number) => {
    if (lvl >= 51) return "Staff & Principal Systems Architect (Tier O)";
    if (lvl >= 41) return "Lead Systems & Core Infrastructure (Tier A)";
    if (lvl >= 31) return "Senior Engineering Production Core (Tier B)";
    if (lvl >= 21) return "Mid-Level Production Engineer (Tier C)";
    if (lvl >= 11) return "Associate Software Engineer (Tier D)";
    return "Foundational Contributor (Tier E)";
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-subtle space-y-3.5">
      {/* 1. Header Bar with Clear Reputation Title */}
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="text-xs font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-brand-600" />
          <span>Professional Reputation Engine</span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-brand-600" />
          <span>Deterministic Proof Metrics</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
        {/* Professional Reputation Grade - explicitly described as required */}
        <div className="p-2.5 rounded border border-border/80 bg-canvas/60 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              Professional Reputation Grade
            </span>
            <span title="Deterministic reputation tier based on cumulative verified engineering output, not an academic exam score." className="text-neutral-400 hover:text-neutral-600 cursor-help">
              <Info className="h-3 w-3" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
              Tier {profile.overallGrade}
            </span>
            <span className="text-[10px] text-neutral-500 font-sans">Verified</span>
          </div>
        </div>

        {/* Engineering Level */}
        <div className="p-2.5 rounded border border-border/80 bg-canvas/60 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Engineering Level</span>
          <div className="text-base font-bold text-neutral-900 mt-1">
            Lvl {profile.level}
          </div>
        </div>

        {/* Total Verifiable XP */}
        <div className="p-2.5 rounded border border-border/80 bg-canvas/60 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Cumulative XP</span>
          <div className="text-base font-bold text-brand-700 mt-1">
            {formatNumber(profile.totalXp)} <span className="text-xs font-normal text-neutral-400">XP</span>
          </div>
        </div>

        {/* Collaboration Score */}
        <div className="p-2.5 rounded border border-border/80 bg-canvas/60 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Collaboration Score</span>
          <div className="text-base font-bold text-emerald-700 mt-1">
            {profile.collaborationScore} <span className="text-xs font-normal text-neutral-400">/ 100</span>
          </div>
        </div>

        {/* Verified Projects */}
        <div className="p-2.5 rounded border border-border/80 bg-canvas/60 flex flex-col justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Verified Repos</span>
          <div className="text-base font-bold text-neutral-900 mt-1">
            {profile.verifiedProjectsCount} <span className="text-xs font-normal text-neutral-400">verified</span>
          </div>
        </div>
      </div>

      {/* 2. Level Progress Bar */}
      <div className="pt-2 border-t border-border/80 space-y-1.5 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-600 font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Level {profile.level} Progression</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-neutral-800 font-bold">
              {formatNumber(profile.totalXp)} / {formatNumber(profile.targetLevelXp)} XP
            </span>
            <span className="text-neutral-400">({progressPercent}%)</span>
          </div>
        </div>

        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
          <div 
            className="bg-brand-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
          <span>{getTierDescription(profile.level)}</span>
          <span className="text-brand-700 font-semibold">
            {formatNumber(profile.xpToNextLevel)} XP to Level {profile.level + 1}
          </span>
        </div>
      </div>
    </div>
  );
}
