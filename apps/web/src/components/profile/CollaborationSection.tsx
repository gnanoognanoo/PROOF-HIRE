"use client";

import React from "react";
import { CollaborationItem } from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";
import { Users, GitPullRequest, Award, Clock, ArrowRight } from "lucide-react";

interface CollaborationSectionProps {
  collaborations: CollaborationItem[];
}

export function CollaborationSection({ collaborations }: CollaborationSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Multi-Developer Collaboration History ({collaborations.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          Git Signature & Peer Verified
        </span>
      </div>

      <div className="space-y-3 font-mono">
        {collaborations.map((collab) => {
          const gradeStyle = getGradeBadgeStyle(collab.projectGrade);

          return (
            <div
              key={collab.id}
              className="p-4 rounded-lg border border-border bg-white hover:border-neutral-300 transition-colors shadow-subtle space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 font-sans">
                    {collab.project}
                  </h3>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Role: <strong className="text-neutral-800">{collab.role}</strong> · Team of {collab.teamSize} engineers
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                    Grade {collab.projectGrade}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Duration: {collab.duration}
                  </span>
                </div>
              </div>

              {/* Progress & Contribution Score */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-medium">
                    Authored Delta Contribution: <strong className="text-neutral-900">{collab.contributionPercentage}%</strong>
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Peer Score: {collab.contributionScore} / 100
                  </span>
                </div>

                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${collab.contributionPercentage}%` }}
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
