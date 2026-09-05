"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";
import { 
  FolderGit2, 
  ExternalLink, 
  Github, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Users, 
  Cpu,
  ArrowRight
} from "lucide-react";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Verified Engineering Projects ({projects.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          Evaluated via Gemini AST Engine
        </span>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const gradeStyle = getGradeBadgeStyle(project.grade);

          return (
            <div
              key={project.id}
              className="rounded-lg border border-border p-4 bg-white hover:border-neutral-300 transition-colors shadow-subtle space-y-3.5"
            >
              {/* Header: Title, Category & Proof Grade Capsule */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      {project.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-500">• {project.category}</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                    {project.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 font-mono">
                  <div className={`px-2.5 py-1 rounded text-xs font-bold border shadow-xs ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                    Grade {project.grade}
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-bold text-neutral-900">{project.score} / 100</div>
                    <div className="text-[10px] text-brand-700 font-semibold">+{project.xp_awarded || 620} XP</div>
                  </div>
                </div>
              </div>

              {/* Technologies Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {project.primary_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-canvas border border-border text-[11px] font-mono text-neutral-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Verification Badges Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>GitHub Verified</span>
                </span>
                <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  <ShieldCheck className="h-3 w-3 text-brand-600" />
                  <span>Blockchain Credential Available</span>
                </span>
              </div>

              {/* Footer: Links, Contributors & Date */}
              <div className="pt-2 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-neutral-500">
                <div className="flex items-center gap-3">
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neutral-700 hover:text-brand-600 transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>Repository</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>

                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-600 hover:underline"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  {project.attributions && (
                    <div className="flex items-center gap-1 text-neutral-600">
                      <Users className="h-3 w-3 text-neutral-400" />
                      <span>{project.attributions.length} Contributors</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Calendar className="h-3 w-3 text-neutral-400" />
                    <span>{new Date(project.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
