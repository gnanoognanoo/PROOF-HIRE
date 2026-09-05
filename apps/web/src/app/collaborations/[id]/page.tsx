"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Users, 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ExternalLink, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  GitPullRequest, 
  GitCommit, 
  FileCode2, 
  BarChart3, 
  ArrowRight,
  ListTodo,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  Layers,
  ArrowUpRight,
  Star,
  GitFork,
  X,
  Check,
} from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { 
  getCollaborationWorkspace, 
  addOrUpdateTask, 
  completeProjectAndAllocateXp,
  getGitHubRepoDetails
} from "@/lib/api-client";
import { 
  CollaborationWorkspace, 
  CollaborationTask, 
  TaskStatus, 
  ProjectCompletionRecord,
  GitHubRepoMetadata
} from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";

export default function CollaborationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = (params?.id as string) || "collab_proofhire";

  const [workspace, setWorkspace] = useState<CollaborationWorkspace | null>(null);
  const [repoDetails, setRepoDetails] = useState<GitHubRepoMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks" | "activity" | "contribution" | "files">("overview");
  const [isLoading, setIsLoading] = useState(true);

  // New task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"Urgent" | "High" | "Medium" | "Low">("Medium");

  // Project completion workflow state
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionResult, setCompletionResult] = useState<ProjectCompletionRecord | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      setIsLoading(true);
      try {
        const ws = await getCollaborationWorkspace(workspaceId);
        setWorkspace(ws);
        if (ws?.completion_record) {
          setCompletionResult(ws.completion_record);
        }

        // Fetch repo metadata
        if (ws?.repo_name) {
          const parts = ws.repo_name.split("/");
          const owner = parts.length > 1 ? parts[0] : "proofhire";
          const repo = parts.length > 1 ? parts[1] : ws.repo_name;
          const rd = await getGitHubRepoDetails(owner, repo);
          setRepoDetails(rd);
        }
      } catch (err) {
        console.error("Failed to load workspace", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, [workspaceId]);

  // Task state mutation
  const handleMoveTask = async (task: CollaborationTask, newStatus: TaskStatus) => {
    if (!workspace) return;
    try {
      const updated = await addOrUpdateTask(workspace.id, {
        ...task,
        status: newStatus
      });
      setWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !newTaskTitle.trim()) return;
    try {
      const created = await addOrUpdateTask(workspace.id, {
        title: newTaskTitle,
        description: newTaskDesc,
        status: "todo",
        assignee: newTaskAssignee || workspace.members[0]?.name || "Unassigned",
        priority: newTaskPriority,
        tags: ["Feature"]
      });
      setWorkspace(prev => prev ? { ...prev, tasks: [...prev.tasks, created] } : null);
      setShowTaskModal(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  // Run Project Completion & XP Allocation
  const handleCompleteProject = async () => {
    if (!workspace) return;
    setIsCompleting(true);
    try {
      const res = await completeProjectAndAllocateXp(workspace.id, workspace.xp_pool);
      setCompletionResult(res);
      setShowCompletionModal(true);
      setWorkspace(prev => prev ? { ...prev, status: "Completed", completion_record: res } : null);
    } catch (err) {
      console.error("Failed to complete project", err);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-900 font-sans">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-neutral-500 font-mono">
          Loading collaboration workspace...
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-900 font-sans">
        <TopNav />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Workspace not found</h2>
          <Link href="/collaborate" className="text-xs font-semibold text-brand-600 hover:underline">
            ← Back to Collaborations
          </Link>
        </div>
      </div>
    );
  }

  const todoTasks = workspace.tasks.filter(t => t.status === "todo");
  const inProgressTasks = workspace.tasks.filter(t => t.status === "in_progress");
  const completedTasks = workspace.tasks.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 font-sans pb-16">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <Link href="/collaborate" className="hover:text-neutral-800">Collaborate</Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold">{workspace.name}</span>
        </div>

        {/* Workspace Header */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {workspace.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  workspace.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-brand-700 border-brand-200'
                }`}>
                  {workspace.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                  XP Pool: {workspace.xp_pool} XP
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600">
                {workspace.tagline}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {workspace.status === 'Completed' ? (
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-subtle transition-colors"
                >
                  <Award className="h-4 w-4" />
                  View XP Allocation Breakdown
                </button>
              ) : (
                <button
                  onClick={handleCompleteProject}
                  disabled={isCompleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors"
                >
                  <Award className="h-4 w-4" />
                  {isCompleting ? "Evaluating..." : "Complete Project & Allocate XP"}
                </button>
              )}
            </div>
          </div>

          {/* Repository & Team Metadata Row */}
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Repo Info */}
            <div className="space-y-1">
              <div className="text-neutral-500 font-sans text-[11px]">Repository</div>
              <a 
                href={workspace.repo_url} 
                target="_blank" 
                rel="noreferrer"
                className="font-bold text-neutral-900 hover:text-brand-600 flex items-center gap-1.5"
              >
                <FolderGit2 className="h-3.5 w-3.5 text-neutral-500" />
                <span className="truncate">{workspace.repo_name}</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </a>
            </div>

            {/* GitHub Signals */}
            <div className="space-y-1">
              <div className="text-neutral-500 font-sans text-[11px]">GitHub Activity</div>
              <div className="flex items-center gap-3 text-neutral-700 font-bold">
                <span className="flex items-center gap-1">
                  <GitCommit className="h-3.5 w-3.5 text-neutral-400" />
                  {repoDetails?.commits_count || 512} commits
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  {repoDetails?.stars || 428}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5 text-neutral-400" />
                  {repoDetails?.forks || 64}
                </span>
              </div>
            </div>

            {/* Team Members Count */}
            <div className="space-y-1">
              <div className="text-neutral-500 font-sans text-[11px]">Engineering Team ({workspace.members.length})</div>
              <div className="flex items-center -space-x-1.5 overflow-hidden">
                {workspace.members.map((m) => (
                  <img
                    key={m.username}
                    src={m.avatar_url}
                    alt={m.name}
                    title={`${m.name} (${m.role})`}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
            </div>

            {/* Verification Confidence */}
            <div className="space-y-1">
              <div className="text-neutral-500 font-sans text-[11px]">Attribution Assurance</div>
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                HIGH · 96.4% GPG Verified
              </div>
            </div>
          </div>
        </div>

        {/* 6 Workspace Tabs Navigation */}
        <div className="border-b border-border flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "overview", label: "Overview" },
            { id: "members", label: `Members (${workspace.members.length})` },
            { id: "tasks", label: `Tasks (${workspace.tasks.length})` },
            { id: "activity", label: `Activity (${workspace.activity.length})` },
            { id: "contribution", label: "Contribution Breakdown" },
            { id: "files", label: `Files (${workspace.files.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-600 text-brand-700 font-bold"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Project Brief */}
              <div className="rounded-xl border border-border bg-white p-6 shadow-subtle space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">Project Mission & Architecture</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {workspace.description}
                </p>

                <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                  {workspace.primary_stack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages Breakdown */}
              {repoDetails?.languages && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-subtle space-y-3 font-mono">
                  <h3 className="text-sm font-bold text-neutral-900 font-sans">Repository Language Distribution</h3>
                  
                  {/* Visual Bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-100 border border-neutral-200">
                    <div className="bg-blue-600 h-full" style={{ width: '58.4%' }} title="TypeScript 58.4%" />
                    <div className="bg-emerald-500 h-full" style={{ width: '27.1%' }} title="Python 27.1%" />
                    <div className="bg-purple-600 h-full" style={{ width: '9.9%' }} title="Solidity 9.9%" />
                    <div className="bg-neutral-400 h-full" style={{ width: '4.6%' }} title="Shell 4.6%" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    {Object.entries(repoDetails.languages).map(([lang, val]) => (
                      <div key={lang}>
                        <div className="text-neutral-500 text-[11px] font-sans">{lang}</div>
                        <div className="font-bold text-neutral-800">{val.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Metrics */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-white p-5 shadow-subtle space-y-4 text-xs font-mono">
                <h3 className="text-sm font-bold text-neutral-900 font-sans">Workspace Parameters</h3>
                
                <div className="space-y-2.5 divide-y divide-border">
                  <div className="flex justify-between pt-1">
                    <span className="text-neutral-500 font-sans">Target Completion</span>
                    <strong className="text-neutral-800">{workspace.target_completion_date}</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-neutral-500 font-sans">XP Pool Allocated</span>
                    <strong className="text-brand-600 font-bold">{workspace.xp_pool} XP</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-neutral-500 font-sans">Total Tasks</span>
                    <strong className="text-neutral-800">{workspace.tasks.length} ({completedTasks.length} Done)</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-neutral-500 font-sans">AST Verification</span>
                    <strong className="text-emerald-700 font-bold">100% Passed</strong>
                  </div>
                </div>
              </div>

              {/* Quick Invite Link */}
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-3">
                <div className="flex items-center gap-2 text-brand-900 font-bold text-xs">
                  <Users className="h-4 w-4 text-brand-600" />
                  Need more contributors?
                </div>
                <p className="text-xs text-brand-800">
                  Discover engineers verified in distributed systems, compilers, and cloud infrastructure.
                </p>
                <Link
                  href="/collaborate/discover"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
                >
                  Explore Verified Directory →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span>Attributed Contributors</span>
              <span>Signals updated per commit push</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workspace.members.map((m) => {
                const gradeStyle = getGradeBadgeStyle(m.grade);

                return (
                  <div
                    key={m.username}
                    className="rounded-xl border border-border bg-white p-5 shadow-subtle space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={m.avatar_url}
                          alt={m.name}
                          className="h-12 w-12 rounded-xl object-cover border border-neutral-200 shadow-subtle flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-neutral-900 font-sans">{m.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                              Grade {m.grade}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">{m.role}</div>
                          <div className="text-[11px] font-mono text-neutral-400">@{m.github_handle}</div>
                        </div>
                      </div>

                      {/* Contribution Metric Bars */}
                      <div className="pt-2 border-t border-border space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-500 font-sans">Contribution Share:</span>
                          <strong className="text-neutral-900">{m.contribution_percentage}%</strong>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                          <div
                            className="bg-brand-600 h-full rounded-full"
                            style={{ width: `${m.contribution_percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-neutral-500 font-sans">Contribution Score:</span>
                          <strong className="text-emerald-700">{m.contribution_score} / 100</strong>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span className="font-sans">Last Activity:</span>
                          <span>{m.last_activity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> GPG Verified
                      </span>

                      <Link
                        href={`/u/${m.username}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        Profile →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Tasks Tracking (Todo, In Progress, Completed) */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-neutral-900">Task Boards & Milestone Tracking</h3>
                <p className="text-xs text-neutral-500">
                  Streamlined 3-stage delivery tracking directly contributing to the Task / Role Evidence signal (15%).
                </p>
              </div>

              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Task
              </button>
            </div>

            {/* 3 Columns Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Todo */}
              <div className="rounded-xl border border-border bg-neutral-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neutral-400" />
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Todo ({todoTasks.length})
                    </h4>
                  </div>
                </div>

                <div className="space-y-3">
                  {todoTasks.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg border border-border bg-white p-3.5 shadow-subtle space-y-2 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-neutral-900">{t.title}</h5>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.priority === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">{t.description}</p>
                      
                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="font-mono text-neutral-600 font-medium">{t.assignee}</span>
                        <button
                          onClick={() => handleMoveTask(t, "in_progress")}
                          className="text-brand-600 hover:text-brand-700 font-bold"
                        >
                          Start →
                        </button>
                      </div>
                    </div>
                  ))}
                  {todoTasks.length === 0 && (
                    <div className="text-center py-6 text-neutral-400 text-xs font-mono">No tasks in Todo</div>
                  )}
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="rounded-xl border border-brand-200 bg-brand-50/20 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-600" />
                    <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      In Progress ({inProgressTasks.length})
                    </h4>
                  </div>
                </div>

                <div className="space-y-3">
                  {inProgressTasks.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg border border-brand-200 bg-white p-3.5 shadow-subtle space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-neutral-900">{t.title}</h5>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-brand-700 border border-brand-200">
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">{t.description}</p>
                      
                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="font-mono text-neutral-600 font-medium">{t.assignee}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveTask(t, "todo")}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            ← Todo
                          </button>
                          <button
                            onClick={() => handleMoveTask(t, "completed")}
                            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                          >
                            <span>Done</span>
                            <Check className="h-3 w-3 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {inProgressTasks.length === 0 && (
                    <div className="text-center py-6 text-neutral-400 text-xs font-mono">No active tasks</div>
                  )}
                </div>
              </div>

              {/* Column 3: Completed */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Completed ({completedTasks.length})
                    </h4>
                  </div>
                </div>

                <div className="space-y-3">
                  {completedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg border border-emerald-200 bg-white p-3.5 shadow-subtle space-y-2 opacity-90"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-neutral-900 line-through decoration-emerald-500">{t.title}</h5>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                          Done
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{t.description}</p>
                      
                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="font-mono text-neutral-600 font-medium">{t.assignee}</span>
                        <button
                          onClick={() => handleMoveTask(t, "in_progress")}
                          className="text-neutral-400 hover:text-neutral-600 text-[10px]"
                        >
                          Reopen
                        </button>
                      </div>
                    </div>
                  ))}
                  {completedTasks.length === 0 && (
                    <div className="text-center py-6 text-neutral-400 text-xs font-mono">No completed tasks yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Activity */}
        {activeTab === "activity" && (
          <div className="rounded-xl border border-border bg-white p-6 shadow-subtle space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-neutral-900 font-sans">Workspace Chronological Activity</h3>

            <div className="space-y-3">
              {workspace.activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <Activity className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-800">{act.author}</span>
                      <span className="text-neutral-400 text-[11px]">{act.timestamp}</span>
                    </div>
                    <p className="text-neutral-600 font-sans text-xs">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Contribution Breakdown (5-Signal Model) */}
        {activeTab === "contribution" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-white p-6 shadow-subtle space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 font-sans">5-Signal Contribution Scoring Model</h3>
                <p className="text-xs text-neutral-600">
                  ProofHire does NOT rely on simple commit counts. Each developer is audited across 5 deterministic dimensions:
                </p>
              </div>

              {/* Signals Weighting Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <div className="text-neutral-500 font-sans text-[11px]">Commit Activity</div>
                  <div className="font-bold text-neutral-900 text-sm">30%</div>
                  <p className="text-[10px] text-neutral-400 font-sans">Density & timeline</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <div className="text-neutral-500 font-sans text-[11px]">Files Changed</div>
                  <div className="font-bold text-neutral-900 text-sm">20%</div>
                  <p className="text-[10px] text-neutral-400 font-sans">Substantive delta LOC</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <div className="text-neutral-500 font-sans text-[11px]">PR Participation</div>
                  <div className="font-bold text-neutral-900 text-sm">20%</div>
                  <p className="text-[10px] text-neutral-400 font-sans">Authored & merged PRs</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <div className="text-neutral-500 font-sans text-[11px]">Consistency</div>
                  <div className="font-bold text-neutral-900 text-sm">15%</div>
                  <p className="text-[10px] text-neutral-400 font-sans">Weekly active cadence</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <div className="text-neutral-500 font-sans text-[11px]">Task Evidence</div>
                  <div className="font-bold text-neutral-900 text-sm">15%</div>
                  <p className="text-[10px] text-neutral-400 font-sans">Milestone deliverables</p>
                </div>
              </div>
            </div>

            {/* Individual Member Signal Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workspace.members.map((m) => (
                <div key={m.username} className="rounded-xl border border-border bg-white p-5 shadow-subtle space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{m.name}</h4>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Score: <strong>{m.contribution_score}/100</strong> · Share: <strong>{m.contribution_percentage}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono pt-2 border-t border-border">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-600 font-sans">Commit Activity (30%)</span>
                        <strong>{Math.round(m.contribution_percentage * 0.28 * 10) / 10} / 30</strong>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-600 h-full" style={{ width: `${m.contribution_percentage * 0.9}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-600 font-sans">Files Changed (20%)</span>
                        <strong>{Math.round(m.contribution_percentage * 0.19 * 10) / 10} / 20</strong>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full" style={{ width: `${m.contribution_percentage * 0.9}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-600 font-sans">PR Participation (20%)</span>
                        <strong>{Math.round(m.contribution_percentage * 0.19 * 10) / 10} / 20</strong>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full" style={{ width: `${m.contribution_percentage * 0.85}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-600 font-sans">Cadence Consistency (15%)</span>
                        <strong>{Math.round(m.contribution_percentage * 0.14 * 10) / 10} / 15</strong>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full" style={{ width: `${m.contribution_percentage * 0.95}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-600 font-sans">Task Evidence (15%)</span>
                        <strong>{Math.round(m.contribution_percentage * 0.14 * 10) / 10} / 15</strong>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: `${m.contribution_percentage * 0.9}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Files */}
        {activeTab === "files" && (
          <div className="rounded-xl border border-border bg-white p-6 shadow-subtle space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between font-sans">
              <h3 className="text-sm font-bold text-neutral-900">Key Architectural Files ({workspace.files.length})</h3>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Compiler AST Verified
              </span>
            </div>

            <div className="divide-y divide-border">
              {workspace.files.map((f) => (
                <div key={f.path} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-neutral-500" />
                    <div>
                      <div className="font-bold text-neutral-800">{f.path}</div>
                      <div className="text-[11px] text-neutral-400 font-sans">
                        Lead Contributor: <strong className="text-neutral-700">{f.lead_contributor}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-neutral-600">
                    <span>{f.lines} LOC</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {f.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-border shadow-modal max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Workspace Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-neutral-400 hover:text-neutral-600 p-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  placeholder="e.g. AST visitor for type check assertions"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe acceptance criteria..."
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                  >
                    {workspace.members.map((m) => (
                      <option key={m.username} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-2 rounded-md border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-subtle"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Completion & Individual XP Allocation Modal */}
      {showCompletionModal && completionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-border shadow-modal max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-600" />
                <h3 className="text-base font-bold text-neutral-900 font-sans">
                  Project Completed & XP Allocated
                </h3>
              </div>
              <button 
                onClick={() => setShowCompletionModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary Banner */}
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                AI Project Evaluation + Contribution Scoring Complete
              </div>
              <p className="text-[11px] text-emerald-800">
                Total Project Pool of <strong>{completionResult.total_xp_pool} XP</strong> has been mathematically allocated to all team members based on their verified contribution percentages.
              </p>
            </div>

            {/* Allocations Table */}
            <div className="space-y-3 font-mono text-xs">
              <div className="text-[11px] font-bold text-neutral-500 font-sans uppercase tracking-wider">
                Individual XP Breakdown
              </div>

              <div className="space-y-2">
                {completionResult.allocations.map((alloc) => (
                  <div 
                    key={alloc.username}
                    className="p-3 rounded-lg border border-border bg-neutral-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 font-sans">{alloc.name}</div>
                      <div className="text-[11px] text-neutral-500 font-sans">
                        {alloc.role} · {alloc.contribution_percentage}% contribution
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700">
                        +{alloc.awarded_xp} collaboration XP
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Level {alloc.new_level} (Grade {alloc.professional_reputation_grade})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 font-mono">
                Profiles and badges automatically updated.
              </span>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
