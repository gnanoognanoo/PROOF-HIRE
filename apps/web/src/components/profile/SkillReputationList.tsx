"use client";

import React from "react";
import { SkillReputation } from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";
import { Code2, ShieldCheck, CheckCircle2, ChevronRight, Layers } from "lucide-react";

interface SkillReputationListProps {
  skills: SkillReputation[];
}

export function SkillReputationList({ skills }: SkillReputationListProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Skill Reputation & Verifiable Strength
          </h2>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          AST & Git Attribution Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {skills.map((skill) => {
          const gradeStyle = getGradeBadgeStyle(skill.grade);

          return (
            <div
              key={skill.name}
              className="p-3.5 rounded-lg border border-border/90 bg-white hover:border-neutral-300 transition-colors space-y-2.5 shadow-subtle"
            >
              {/* Top Row: Skill Name + Level Badge */}
              <div className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-neutral-900">{skill.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                    Lvl {skill.level}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                    Grade {skill.grade}
                  </span>
                </div>
              </div>

              {/* Middle Row: Score and Evidence Count */}
              <div className="flex items-center justify-between text-neutral-600 text-[11px]">
                <span>
                  Score: <strong className="text-neutral-900 font-bold">{skill.score}</strong> / 100
                </span>
                <span className="text-neutral-500">
                  Verified from <strong className="text-neutral-800">{skill.projectsCount}</strong> projects
                </span>
              </div>

              {/* Verification Strength Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Verification Strength</span>
                  <span className="text-emerald-700 font-bold">{skill.verificationStrength}%</span>
                </div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden border border-neutral-200">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${skill.verificationStrength}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
