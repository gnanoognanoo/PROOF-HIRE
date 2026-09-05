"use client";

import React, { useState } from "react";
import { BadgeItem } from "@/lib/types";
import { Award, ShieldCheck, CheckCircle2, Hash, ChevronDown, ChevronUp, Layers, Check } from "lucide-react";

interface BadgesSectionProps {
  badges: BadgeItem[];
}

const ALL_10_BADGES = [
  { name: "Frontend Developer", category: "Architecture", skill: "React", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Backend Developer", category: "Architecture", skill: "FastAPI", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Full Stack Developer", category: "Engineering", skill: "TypeScript", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "AI Developer", category: "Machine Learning", skill: "Gemini", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Python Developer", category: "Language Mastery", skill: "Python", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "React Developer", category: "Ecosystem Mastery", skill: "React", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Open Source Contributor", category: "Community", skill: "Git", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Team Collaborator", category: "Collaboration", skill: "Git", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Project Leader", category: "Leadership", skill: "TypeScript", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
  { name: "Consistent Builder", category: "Cadence", skill: "Git", bronze: "2 verified projects · Lvl 10", silver: "4 verified projects · Lvl 20 · Grade B", gold: "6 verified projects · Lvl 30 · Grade A" },
];

const PROBLEM_SOLVING_SMART_BADGES = [
  {
    name: "Problem Solver",
    category: "Problem Solving",
    skill: "Verified Solves",
    bronze: "50 verified problems · 10+ medium problems",
    silver: "150 verified problems · 50+ medium · 10+ hard · Score >= 60",
    gold: "300 verified problems · 100+ medium · 25+ hard · Score >= 80",
  },
  {
    name: "Algorithmic Thinking",
    category: "Problem Solving",
    skill: "Topic Breadth & Depth",
    bronze: "Verified activity across at least 4 algorithm categories",
    silver: "At least 6 categories · minimum topic score 60 in 4 categories",
    gold: "At least 8 categories · 4 advanced topics >= 75",
  },
  {
    name: "Competitive Programmer",
    category: "Problem Solving",
    skill: "Contest Performance",
    bronze: "5 verified contests",
    silver: "15 verified contests · at least one Top 25% finish",
    gold: "30 verified contests · at least one Top 10% finish",
  },
  {
    name: "Consistent Solver",
    category: "Problem Solving",
    skill: "Practice Cadence",
    bronze: "4 active weeks out of last 6",
    silver: "8 active weeks out of last 10",
    gold: "10 active weeks out of last 12",
  },
];

export function BadgesSection({ badges }: BadgesSectionProps) {
  const [showCriteriaMatrix, setShowCriteriaMatrix] = useState(false);
  const [matrixCategory, setMatrixCategory] = useState<"all" | "engineering" | "problem_solving">("problem_solving");

  const getTierBadgeStyle = (tier: "Gold" | "Silver" | "Bronze") => {
    switch (tier) {
      case "Gold":
        return {
          pill: "bg-amber-100 text-amber-900 border-amber-300",
          badgeCard: "border-amber-200 bg-amber-50/40",
          medal: "text-amber-700 bg-amber-100",
        };
      case "Silver":
        return {
          pill: "bg-slate-100 text-slate-800 border-slate-300",
          badgeCard: "border-slate-200 bg-slate-50/40",
          medal: "text-slate-700 bg-slate-100",
        };
      case "Bronze":
        return {
          pill: "bg-orange-100 text-orange-900 border-orange-300",
          badgeCard: "border-orange-200 bg-orange-50/40",
          medal: "text-orange-700 bg-orange-100",
        };
    }
  };

  const displayedMatrixBadges =
    matrixCategory === "engineering"
      ? ALL_10_BADGES
      : matrixCategory === "problem_solving"
      ? PROBLEM_SOLVING_SMART_BADGES
      : [...PROBLEM_SOLVING_SMART_BADGES, ...ALL_10_BADGES];

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-subtle space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Verified Professional Badges & Credentials
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCriteriaMatrix(!showCriteriaMatrix)}
            className="text-[11px] font-mono text-brand-700 hover:text-brand-900 flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 transition-colors"
          >
            <span>{showCriteriaMatrix ? "Hide Standards Matrix" : "View Credential Standards"}</span>
            {showCriteriaMatrix ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
            Deterministic Rule Engine
          </span>
        </div>
      </div>

      {/* Expandable Credential Rule Criteria Matrix */}
      {showCriteriaMatrix && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs font-mono space-y-2.5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-neutral-800 pb-1 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span>Deterministic Evaluation Standards</span>
              <div className="flex items-center gap-1 bg-neutral-200/80 p-0.5 rounded text-[10px]">
                <button
                  type="button"
                  onClick={() => setMatrixCategory("problem_solving")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    matrixCategory === "problem_solving" ? "bg-white text-neutral-900 font-bold shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Problem Solving (4)
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixCategory("engineering")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    matrixCategory === "engineering" ? "bg-white text-neutral-900 font-bold shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Engineering (10)
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixCategory("all")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    matrixCategory === "all" ? "bg-white text-neutral-900 font-bold shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  All (14)
                </button>
              </div>
            </div>
            <span className="text-neutral-500 font-normal">Bronze · Silver · Gold Tiers</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-1.5 pr-3 font-semibold">Credential Competency</th>
                  <th className="py-1.5 px-3 font-semibold text-amber-900">Bronze Criteria</th>
                  <th className="py-1.5 px-3 font-semibold text-slate-800">Silver Criteria</th>
                  <th className="py-1.5 pl-3 font-semibold text-amber-700">Gold Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {displayedMatrixBadges.map((b) => (
                  <tr key={b.name} className="hover:bg-white/60 transition-colors">
                    <td className="py-1.5 pr-3 font-bold text-neutral-900">
                      {b.name}
                      <span className="block text-[10px] font-normal text-neutral-500">{b.category}</span>
                    </td>
                    <td className="py-1.5 px-3 text-neutral-700">{b.bronze}</td>
                    <td className="py-1.5 px-3 text-neutral-700 font-medium">{b.silver}</td>
                    <td className="py-1.5 pl-3 text-neutral-800 font-semibold">{b.gold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {badges.map((badge) => {
          const style = getTierBadgeStyle(badge.tier);

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border shadow-subtle space-y-2.5 transition-colors ${style.badgeCard}`}
            >
              {/* Top Row: Title + Tier Capsule */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-md border border-neutral-200/80 shadow-subtle ${style.medal}`}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">
                      {badge.title}
                    </h3>
                    <div className="text-[10px] font-mono text-neutral-500">
                      {badge.category} Category
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs ${style.pill}`}>
                  {badge.tier}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                {badge.description}
              </p>

              {/* Credential ID and Date Stamp */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-neutral-400" />
                  <span>{badge.credentialId}</span>
                </span>
                <span>Issued {badge.issuedDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
