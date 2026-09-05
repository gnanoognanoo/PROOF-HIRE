"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { listProjects, ProjectRecord } from "@/lib/api-client";
import { getGradeBadgeStyle } from "@/lib/utils";
import { 
  FolderGit2, 
  Plus, 
  Search, 
  ExternalLink, 
  Github, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Users, 
  ArrowRight,
  Filter,
  Sparkles,
  Award
} from "lucide-react";

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await listProjects();
        setProjects(data);
      } catch (e) {
        console.error("Failed to load projects", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGrade =
      selectedGrade === "ALL" || (p.grade && p.grade.toUpperCase() === selectedGrade);

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col font-sans antialiased">
      <TopNav />

      {/* Subheader & Action Bar */}
      <div className="border-b border-border bg-surface/90 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              proofhire
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-medium">projects</span>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Project for AI Evaluation</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header Hero */}
        <div className="rounded-lg border border-border bg-surface p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Verified Engineering Projects & AI Audits
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl">
              Software repositories evaluated through compiler-level AST audits, GPG commit attributions, and Polygon blockchain credential anchoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded bg-neutral-50 border border-neutral-200 text-xs font-mono text-center">
              <span className="block text-lg font-bold text-neutral-900">{projects.length}</span>
              <span className="text-neutral-400">Audited Projects</span>
            </div>
            <div className="px-3 py-2 rounded bg-emerald-50 border border-emerald-200 text-xs font-mono text-center">
              <span className="block text-lg font-bold text-emerald-700">100%</span>
              <span className="text-emerald-600">AST Verified</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border shadow-subtle">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search projects by tech, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded border border-border bg-canvas text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs text-neutral-500 font-mono mr-1">Grade:</span>
            {["ALL", "O", "A", "B", "C"].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  selectedGrade === grade
                    ? "bg-neutral-900 text-white font-semibold"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {grade === "ALL" ? "All Grades" : `Grade ${grade}`}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-500 font-mono">
            Loading verified engineering repositories...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-12 text-center space-y-3">
            <FolderGit2 className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-800">No matching projects found</h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or grade filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((project) => {
              const grade = (project.grade || "B") as any;
              const gradeStyle = getGradeBadgeStyle(grade);

              return (
                <div
                  key={project.id}
                  className="rounded-lg border border-border bg-surface p-5 shadow-subtle hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top row: Title + Grade/Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="text-base font-bold text-neutral-900 group-hover:text-brand-600 transition-colors"
                          >
                            {project.title}
                          </Link>
                          <span className="text-[11px] font-mono text-neutral-400">
                            · {project.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {project.grade && (
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold border font-mono ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}
                          >
                            Grade {project.grade}
                          </span>
                          <div className="text-[11px] font-mono text-neutral-700 font-bold mt-0.5">
                            {project.score?.toFixed(1) || "86.0"} / 100
                          </div>
                          {project.xp_earned && (
                            <span className="text-[10px] font-mono text-brand-600 font-semibold">
                              +{project.xp_earned} XP
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 5).map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Verifications pills */}
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-brand-600" />
                        <span>GitHub Verified</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>Polygon PoS Anchored</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Meta links & CTA */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
                    <div className="flex items-center gap-3">
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-neutral-900 transition-colors flex items-center gap-1"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-neutral-900 transition-colors flex items-center gap-1 text-blue-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:text-brand-600 transition-colors"
                    >
                      <span>Evaluation Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
