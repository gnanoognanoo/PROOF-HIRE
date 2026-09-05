"use client";

import React from "react";
import Link from "next/link";
import { 
  GitBranch, 
  ExternalLink, 
  CheckCircle2, 
  Cpu, 
  FileText, 
  ShieldAlert, 
  Terminal, 
  Award,
  Hash,
  ArrowRight,
  GitCommit
} from "lucide-react";
import { Project } from "@/lib/types";
import { getGradeBadgeStyle, formatAddress } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const gradeStyle = getGradeBadgeStyle(project.grade);

  return (
    <div className="bg-surface rounded-lg border border-border p-5 shadow-subtle space-y-4 hover:border-neutral-300 transition-colors">
      {/* Card Header: Category, Title & Grade Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            <span className="font-semibold text-neutral-700">{project.category}</span>
            <span>•</span>
            <span>Evaluation Cycle {project.evaluation_cycle_id || "#881"}</span>
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            {project.title}
          </h3>
        </div>

        {/* Grade Pill */}
        <div className="shrink-0 flex items-center">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border shadow-subtle ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
            <span className={`h-2 w-2 rounded-full ${gradeStyle.dot}`}></span>
            <span>{gradeStyle.label}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-700 leading-relaxed">
        {project.description}
      </p>

      {/* 4 Quantitative Breakdown Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2.5 rounded border border-border/70 bg-canvas/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Architecture</div>
          <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
            {project.metrics.architecture}<span className="text-neutral-400 font-normal text-xs">/100</span>
          </div>
          <div className="w-full bg-neutral-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.metrics.architecture}%` }}></div>
          </div>
        </div>

        <div className="p-2.5 rounded border border-border/70 bg-canvas/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Test Coverage</div>
          <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
            {project.metrics.test_coverage}<span className="text-neutral-400 font-normal text-xs">%</span>
          </div>
          <div className="w-full bg-neutral-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${project.metrics.test_coverage}%` }}></div>
          </div>
        </div>

        <div className="p-2.5 rounded border border-border/70 bg-canvas/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Code Quality</div>
          <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
            {project.metrics.code_quality}<span className="text-neutral-400 font-normal text-xs">/100</span>
          </div>
          <div className="w-full bg-neutral-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${project.metrics.code_quality}%` }}></div>
          </div>
        </div>

        <div className="p-2.5 rounded border border-border/70 bg-canvas/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Doc Clarity</div>
          <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
            {project.metrics.doc_clarity}<span className="text-neutral-400 font-normal text-xs">/100</span>
          </div>
          <div className="w-full bg-neutral-200 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${project.metrics.doc_clarity}%` }}></div>
          </div>
        </div>
      </div>

      {/* Static Analysis & Code Review Summary */}
      <div className="p-3 rounded-md bg-neutral-50 border border-border text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-neutral-700">
            <Cpu className="h-3.5 w-3.5 text-neutral-500" />
            <span>STATIC CODE ANALYSIS & VERIFICATION</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
            AST Invariant Validated
          </span>
        </div>
        <p className="text-neutral-700 font-mono text-[11px] leading-relaxed">
          &ldquo;{project.gemini_review_note}&rdquo;
        </p>
      </div>

      {/* Proof Ledger Stamps Row */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-neutral-500 border-t border-border/60">
        <a
          href={project.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-neutral-700 hover:text-brand-600 transition-colors"
        >
          <Terminal className="h-3.5 w-3.5 text-neutral-400" />
          <span>GitHub Repo</span>
          <ExternalLink className="h-3 w-3 text-neutral-400" />
        </a>

        <div className="flex items-center gap-1">
          <Hash className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-neutral-400">SHA-256:</span>
          <span className="text-neutral-700">{formatAddress(project.sha256_hash, 3)}</span>
        </div>

        {project.polygon_tx_hash && (
          <a
            href={`https://amoy.polygonscan.com/tx/${project.polygon_tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand-600 hover:underline"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Polygon Tx: {formatAddress(project.polygon_tx_hash, 3)}</span>
          </a>
        )}
      </div>

      {/* Multi-Author Attribution Split */}
      {project.attributions && project.attributions.length > 0 && (
        <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-neutral-400 uppercase">Authorship Impact:</span>
            <div className="flex items-center gap-3">
              {project.attributions.map((attr) => (
                <div key={attr.github_handle} className="flex items-center gap-1 font-mono text-[11px]">
                  <span className="text-neutral-700 font-semibold">{attr.contributor_name}</span>
                  <span className="text-neutral-400">({attr.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/evaluator"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 font-mono group"
          >
            <span>View Source Diff Inspector</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
