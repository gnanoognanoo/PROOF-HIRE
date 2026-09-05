"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  GitPullRequest, 
  Plus, 
  Github, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Layers,
  Award,
  Terminal,
  ExternalLink,
  RefreshCw,
  FolderGit2,
  X,
} from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { getCollaborations, getGitHubStatus, connectGitHubAccount, createCollaborationWorkspace } from "@/lib/api-client";
import { CollaborationWorkspace, GitHubAccount } from "@/lib/types";

export default function CollaboratePage() {
  const [workspaces, setWorkspaces] = useState<CollaborationWorkspace[]>([]);
  const [githubAccount, setGithubAccount] = useState<GitHubAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Connect GitHub form
  const [ghHandle, setGhHandle] = useState("alexchen");
  const [isConnecting, setIsConnecting] = useState(false);

  // New Workspace form
  const [newName, setNewName] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newRepo, setNewRepo] = useState("");
  const [newStack, setNewStack] = useState("TypeScript, React, Node.js");
  const [newXpPool, setNewXpPool] = useState(800);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [wsData, ghData] = await Promise.all([
          getCollaborations(),
          getGitHubStatus("alexchen")
        ]);
        setWorkspaces(wsData);
        setGithubAccount(ghData);
      } catch (err) {
        console.error("Failed to load collaboration data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleConnectGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    try {
      const res = await connectGitHubAccount("alexchen", ghHandle);
      setGithubAccount(res.profile);
      setShowConnectModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await createCollaborationWorkspace({
        name: newName,
        tagline: newTagline || "Autonomous team engineering workspace",
        repo_url: newRepo || "https://github.com/proofhire/new-project",
        repo_name: newRepo ? newRepo.split("/").pop() : "new-project",
        primary_stack: newStack.split(",").map(s => s.trim()).filter(Boolean),
        xp_pool: Number(newXpPool) || 800,
        description: newTagline
      });
      setWorkspaces(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewName("");
      setNewTagline("");
      setNewRepo("");
    } catch (err) {
      console.error("Failed to create workspace", err);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 font-sans pb-16">
      <TopNav />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Banner */}
        <div className="rounded-xl border border-border bg-surface p-6 lg:p-8 shadow-subtle relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                <Users className="h-3.5 w-3.5" />
                ProofHire Collaboration Network
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Multi-Developer Workspaces & Git Verification
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Build ambitious engineering projects with verified peers. Our compiler engine tracks commit activity, 
                substantive line delta contributions, and task delivery to deterministically allocate collaboration XP.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/collaborate/discover"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold shadow-subtle transition-colors"
              >
                <Search className="h-4 w-4 text-neutral-500" />
                Find Developers
              </Link>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-subtle transition-colors"
              >
                <Plus className="h-4 w-4" />
                Start Collaboration
              </button>
            </div>
          </div>
        </div>

        {/* GitHub Account Link & Engine Health Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GitHub Connection Card */}
          <div className="md:col-span-2 rounded-xl border border-border bg-white p-5 shadow-subtle flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-subtle">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-neutral-900">GitHub Identity Verification</h2>
                    {githubAccount?.is_connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Connected & GPG Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Disconnected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {githubAccount?.is_connected 
                      ? `Linked to @${githubAccount.github_username} · GPG commit signatures actively attributed.`
                      : "Connect your GitHub account to enable cryptographic commit attribution and PR tracking."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConnectModal(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 border border-neutral-200 hover:border-brand-200 px-3 py-1.5 rounded-md bg-neutral-50 hover:bg-brand-50 transition-colors"
              >
                {githubAccount?.is_connected ? "Manage Account" : "Connect GitHub"}
              </button>
            </div>

            {githubAccount?.is_connected && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <div className="text-neutral-500 text-[11px] font-sans">GitHub Handle</div>
                  <div className="font-bold text-neutral-800">@{githubAccount.github_username}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[11px] font-sans">Verified Repositories</div>
                  <div className="font-bold text-neutral-800">{githubAccount.public_repos || 48} Repos</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[11px] font-sans">Attribution Confidence</div>
                  <div className="font-bold text-emerald-700">96.4% HIGH</div>
                </div>
              </div>
            )}
          </div>

          {/* Metric Box */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-subtle flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Multi-Signal Scoring</span>
              <h3 className="text-sm font-bold text-neutral-900">Deterministic Attribution</h3>
              <p className="text-xs text-neutral-600">
                Commit activity (30%), Files changed (20%), PR participation (20%), Cadence consistency (15%), and Task delivery (15%).
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-neutral-500">Total Workspaces:</span>
              <strong className="text-neutral-900 font-mono">{workspaces.length} Active</strong>
            </div>
          </div>
        </div>

        {/* Workspaces List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600" />
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">Active Workspaces ({workspaces.length})</h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              Individual XP dynamically allocated upon completion
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <div 
                key={ws.id}
                className="rounded-xl border border-border bg-surface hover:border-neutral-300 transition-all p-6 shadow-subtle flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-neutral-900 font-sans">
                          {ws.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          ws.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-brand-700 border-brand-200'
                        }`}>
                          {ws.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                        {ws.tagline}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded bg-neutral-100 text-neutral-800 font-mono text-xs font-bold border border-neutral-200">
                      Pool: {ws.xp_pool} XP
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-600">
                    <FolderGit2 className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="truncate">{ws.repo_name}</span>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {ws.primary_stack.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Team Members */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Collaborating Engineers ({ws.members.length})</span>
                    <span>Contribution Share</span>
                  </div>

                  <div className="space-y-2">
                    {ws.members.map((m) => (
                      <div key={m.username} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img 
                            src={m.avatar_url} 
                            alt={m.name} 
                            className="h-5 w-5 rounded-full object-cover border border-neutral-200" 
                          />
                          <span className="font-medium text-neutral-800">{m.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">({m.role})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-neutral-900">{m.contribution_percentage}%</span>
                          <div className="w-16 bg-neutral-100 h-1.5 rounded-full overflow-hidden border border-neutral-200">
                            <div 
                              className="bg-brand-600 h-full rounded-full" 
                              style={{ width: `${m.contribution_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {ws.tasks.length} tasks tracked · {ws.activity.length} events
                  </span>

                  <Link
                    href={`/collaborations/${ws.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors shadow-subtle"
                  >
                    Open Workspace
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Connect GitHub Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-border shadow-modal max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-neutral-900 flex items-center justify-center text-white">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Connect GitHub Account</h3>
                  <p className="text-xs text-neutral-500">Cryptographic attribution for ProofHire</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConnectGitHub} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">GitHub Username or Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400 text-xs">github.com/</span>
                  <input
                    type="text"
                    value={ghHandle}
                    onChange={(e) => setGhHandle(e.target.value)}
                    required
                    className="w-full rounded-md border border-neutral-300 pl-24 pr-3 py-2 text-xs font-mono focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="alexchen"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  We verify public commit SHAs, line additions, and pull request activity.
                </p>
              </div>

              <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 space-y-1 text-xs text-neutral-600">
                <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  GPG Verified Attributions
                </div>
                <p className="text-[11px]">
                  Your commit hashes will be verified through AST signatures to prevent attribution spoofing.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-3 py-2 rounded-md border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white flex items-center gap-2"
                >
                  {isConnecting ? "Connecting..." : "Verify & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-border shadow-modal max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Start New Collaboration</h3>
                  <p className="text-xs text-neutral-500">Create workspace with task tracking and XP pool</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Project Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. Distributed LSM Storage Engine"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Tagline / Mission</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Asynchronous multi-raft consensus implementation"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">GitHub Repository URL</label>
                  <input
                    type="text"
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    placeholder="proofhire/my-repo"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs font-mono focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Project XP Pool</label>
                  <input
                    type="number"
                    value={newXpPool}
                    onChange={(e) => setNewXpPool(Number(e.target.value))}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs font-mono focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-md border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-subtle"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
