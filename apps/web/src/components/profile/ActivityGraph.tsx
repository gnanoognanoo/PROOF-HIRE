"use client";

import React, { useState } from "react";
import { GitCommit, GitPullRequest, Award, BookOpen, ShieldCheck } from "lucide-react";

interface ActivityItem {
  date: string;
  count: number;
  level: number; // 0 to 4
}

interface ActivityGraphProps {
  activityData: ActivityItem[];
}

export const ActivityGraph: React.FC<ActivityGraphProps> = ({ activityData }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    index: number;
    date: string;
    count: number;
  } | null>(null);

  const totalActions = activityData.reduce((acc, curr) => acc + curr.count, 0);

  // Group into columns of 7 days (weeks)
  const weeks: ActivityItem[][] = [];
  const chunkSize = 7;
  for (let i = 0; i < activityData.length; i += chunkSize) {
    weeks.push(activityData.slice(i, i + chunkSize));
  }

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-200 border-emerald-300";
      case 2:
        return "bg-emerald-400 border-emerald-500";
      case 3:
        return "bg-emerald-600 border-emerald-700";
      case 4:
        return "bg-emerald-800 border-emerald-900";
      default:
        return "bg-slate-100 border-slate-200";
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">Verified Technical Activity</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically attributed commits, peer reviews, benchmark evaluations, and credential achievements.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-900 font-semibold">{totalActions} verified events</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-medium">14-week window</span>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-100">
          <GitCommit className="w-3.5 h-3.5 text-blue-600" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800">92</span>
            <span className="text-slate-500 ml-1">GPG Commits</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-100">
          <GitPullRequest className="w-3.5 h-3.5 text-purple-600" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800">28</span>
            <span className="text-slate-500 ml-1">Collab PRs</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-100">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800">16</span>
            <span className="text-slate-500 ml-1">Assessments</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-50 border border-slate-100">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <div className="text-xs">
            <span className="font-semibold text-slate-800">12</span>
            <span className="text-slate-500 ml-1">Badges Earned</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[560px]">
          {/* Day rows with week columns */}
          <div className="flex gap-1.5">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[10px] text-slate-400 font-mono pr-2 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Matrix of weeks */}
            <div className="flex gap-1.5 flex-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1.5 flex-1">
                  {week.map((day, dayIdx) => {
                    const globalIdx = weekIdx * 7 + dayIdx;
                    return (
                      <div
                        key={dayIdx}
                        onMouseEnter={() =>
                          setHoveredCell({
                            index: globalIdx,
                            date: day.date,
                            count: day.count,
                          })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-3.5 rounded-sm border cursor-pointer transition-all hover:scale-125 ${getCellColor(
                          day.level
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Footer of the activity graph */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div>
              {hoveredCell ? (
                <span className="font-mono text-slate-800">
                  <span className="font-semibold">{hoveredCell.count} verified events</span> on{" "}
                  {hoveredCell.date}
                </span>
              ) : (
                <span className="text-slate-400">Hover over any block for event telemetry</span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 border border-emerald-300" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-500" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600 border border-emerald-700" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800 border border-emerald-900" />
              <span className="text-[11px] text-slate-400">More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
