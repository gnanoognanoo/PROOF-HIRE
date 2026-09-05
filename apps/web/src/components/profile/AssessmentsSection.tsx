import React from "react";
import { AssessmentRecord } from "@/lib/types";
import { ShieldCheck, Award, Calendar, ChevronRight, BarChart2 } from "lucide-react";

interface AssessmentsSectionProps {
  assessments: AssessmentRecord[];
}

export const AssessmentsSection: React.FC<AssessmentsSectionProps> = ({ assessments }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-900">Standardized Skill Assessments</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600 font-medium">
            {assessments.length}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          AI & AST Proctored
        </span>
      </div>

      <div className="space-y-3">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="group p-4 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left: Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {assessment.assessmentName}
                </span>
                {assessment.status && (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {assessment.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                  {assessment.company}
                </span>

                <span className="flex items-center gap-1 text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {assessment.date}
                </span>

                {assessment.percentile && (
                  <span className="flex items-center gap-1 text-blue-700 bg-blue-50 font-medium px-1.5 py-0.5 rounded text-[11px]">
                    <BarChart2 className="w-3 h-3 text-blue-600" />
                    {assessment.percentile}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Score Meter & Badge */}
            <div className="flex items-center gap-4 self-start sm:self-center shrink-0">
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {assessment.score.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ 100</span>
                </div>
                <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, assessment.score)}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="View verified assessment scorecard"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
