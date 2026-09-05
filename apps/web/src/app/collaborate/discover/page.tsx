"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  MapPin, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  UserPlus, 
  ChevronRight,
  SlidersHorizontal,
  X,
  Send,
  Layers
} from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { discoverDevelopers, getCollaborations, inviteDeveloper } from "@/lib/api-client";
import { DeveloperDiscoveryItem, CollaborationWorkspace } from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";

export default function DiscoverDevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperDiscoveryItem[]>([]);
  const [workspaces, setWorkspaces] = useState<CollaborationWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [minLevel, setMinLevel] = useState<number | undefined>(undefined);
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");

  // Invite Modal State
  const [inviteDev, setInviteDev] = useState<DeveloperDiscoveryItem | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState("");
  const [inviteRole, setInviteRole] = useState("Full-Stack Collaborator");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState("");

  // Filter options
  const SKILL_OPTIONS = ["All Skills", "React", "TypeScript", "Rust", "Python", "Go", "FastAPI", "Next.js", "Solidity", "Linux eBPF", "PostgreSQL"];
  const LEVEL_TIERS = [
    { label: "All Levels", val: undefined },
    { label: "Level 10+ (Grade D)", val: 10 },
    { label: "Level 20+ (Grade C)", val: 20 },
    { label: "Level 30+ (Grade B)", val: 30 },
    { label: "Level 40+ (Grade A)", val: 40 },
    { label: "Level 50+ (Grade O)", val: 50 },
  ];
  const AVAILABILITY_OPTIONS = ["All Availability", "Immediate Hire", "Open to Collaborations", "Part-time Collaborations", "Exploring Opportunities"];
  const LOCATION_OPTIONS = ["All Locations", "San Francisco", "Berlin", "Bangalore", "London", "Austin", "Remote"];
  const BADGE_OPTIONS = [
    "All Badges", 
    "Frontend Developer", 
    "Backend Developer", 
    "Full Stack Developer", 
    "AI Developer", 
    "Python Developer", 
    "React Developer", 
    "Open Source Contributor", 
    "Team Collaborator", 
    "Project Leader", 
    "Consistent Builder"
  ];

  const fetchDevelopers = async () => {
    setIsLoading(true);
    try {
      const res = await discoverDevelopers({
        search: searchQuery || undefined,
        skill: selectedSkill && selectedSkill !== "All Skills" ? selectedSkill : undefined,
        min_level: minLevel,
        availability: selectedAvailability && selectedAvailability !== "All Availability" ? selectedAvailability : undefined,
        location: selectedLocation && selectedLocation !== "All Locations" ? selectedLocation : undefined,
        badge: selectedBadge && selectedBadge !== "All Badges" ? selectedBadge : undefined,
      });
      setDevelopers(res.developers);
    } catch (err) {
      console.error("Failed to load developers", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, [searchQuery, selectedSkill, minLevel, selectedAvailability, selectedLocation, selectedBadge]);

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const ws = await getCollaborations();
        setWorkspaces(ws);
        if (ws.length > 0) {
          setTargetWorkspaceId(ws[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadWorkspaces();
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteDev || !targetWorkspaceId) return;
    setIsSendingInvite(true);
    try {
      await inviteDeveloper(targetWorkspaceId, {
        username: inviteDev.username,
        name: inviteDev.name,
        role: inviteRole,
      });
      setInviteSuccessMsg(`Invitation successfully dispatched to ${inviteDev.name}!`);
      setTimeout(() => {
        setInviteSuccessMsg("");
        setInviteDev(null);
      }, 1800);
    } catch (err) {
      console.error("Failed to invite developer", err);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkill("");
    setMinLevel(undefined);
    setSelectedAvailability("");
    setSelectedLocation("");
    setSelectedBadge("");
  };

  const hasActiveFilters = searchQuery || (selectedSkill && selectedSkill !== "All Skills") || minLevel !== undefined || (selectedAvailability && selectedAvailability !== "All Availability") || (selectedLocation && selectedLocation !== "All Locations") || (selectedBadge && selectedBadge !== "All Badges");

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 font-sans pb-16">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <Link href="/collaborate" className="hover:text-neutral-800">Collaborate</Link>
              <span>/</span>
              <span className="text-neutral-900 font-bold">Discover Developers</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Discover & Invite Engineers
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Find proven engineering peers verified by AST inspection, commit delta records, and deterministic reputation grades.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/collaborate"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-subtle transition-colors"
            >
              <Layers className="h-4 w-4 text-neutral-500" />
              My Workspaces ({workspaces.length})
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-subtle space-y-3">
          {/* Omni Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by engineer name, headline, or technology (e.g. Raft, Rust, React, eBPF)..."
              className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {/* Skill */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-brand-500 focus:outline-none"
              >
                {SKILL_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Level Tier */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">Reputation Level</label>
              <select
                value={minLevel === undefined ? "" : minLevel}
                onChange={(e) => setMinLevel(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-brand-500 focus:outline-none"
              >
                {LEVEL_TIERS.map((t) => (
                  <option key={t.label} value={t.val === undefined ? "" : t.val}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">Availability</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-brand-500 focus:outline-none"
              >
                {AVAILABILITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-brand-500 focus:outline-none"
              >
                {LOCATION_OPTIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Badges */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">Badge Rule</label>
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-white focus:border-brand-500 focus:outline-none"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-neutral-500">
                Filtered: <strong className="text-neutral-800">{developers.length} engineers match criteria</strong>
              </span>
              <button
                onClick={clearFilters}
                className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 text-xs"
              >
                <X className="h-3.5 w-3.5" /> Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Developers Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>Verified Engineer Directory</span>
            <span>Total Candidates: {developers.length}</span>
          </div>

          {developers.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">No engineers match selected filters</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try widening your skill criteria or lowering the minimum reputation level requirements.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {developers.map((dev) => {
                const gradeStyle = getGradeBadgeStyle(dev.overall_grade);

                return (
                  <div
                    key={dev.id}
                    className="rounded-xl border border-border bg-white hover:border-neutral-300 transition-all p-5 shadow-subtle flex flex-col justify-between space-y-4"
                  >
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={dev.avatar_url}
                          alt={dev.name}
                          className="h-12 w-12 rounded-xl object-cover border border-neutral-200 shadow-subtle flex-shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-neutral-900 font-sans">
                              {dev.name}
                            </h3>
                            {/* Professional Reputation Grade Badge */}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                              Grade {dev.overall_grade} · Lvl {dev.level}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 font-sans line-clamp-1">
                            {dev.headline}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-neutral-400" />
                              {dev.location}
                            </span>
                            <span>·</span>
                            <span className="text-emerald-700 font-bold">
                              {dev.availability}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio / Scope */}
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {dev.bio}
                    </p>

                    {/* Skills Tags */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                        Verified Technical Skills
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.top_skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Badges Earned */}
                    <div className="space-y-1.5 pt-1 border-t border-border">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                        Earned Verification Badges
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.badges.slice(0, 3).map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            <Award className="h-3 w-3 text-amber-600" />
                            {badge}
                          </span>
                        ))}
                        {dev.badges.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-neutral-400 font-mono">
                            +{dev.badges.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions: View Profile and Invite to Collaborate */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                      <Link
                        href={`/u/${dev.username}`}
                        className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1 hover:underline"
                      >
                        View Profile
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      <button
                        onClick={() => setInviteDev(dev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Invite to Collaborate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Invite Modal */}
      {inviteDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-border shadow-modal max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Invite {inviteDev.name}</h3>
                  <p className="text-xs text-neutral-500">Add engineer to your collaboration workspace</p>
                </div>
              </div>
              <button 
                onClick={() => setInviteDev(null)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800">{inviteSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendInvitation} className="space-y-4">
                {/* Select Workspace */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Select Project Workspace</label>
                  <select
                    value={targetWorkspaceId}
                    onChange={(e) => setTargetWorkspaceId(e.target.value)}
                    required
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs bg-white focus:border-brand-500 focus:outline-none"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} ({ws.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role in Project */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700">Project Role Assignment</label>
                  <input
                    type="text"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    required
                    placeholder="e.g. Distributed Consensus Architect"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Candidate preview snippet */}
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center gap-3">
                  <img src={inviteDev.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  <div className="text-xs">
                    <div className="font-bold text-neutral-800">{inviteDev.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Level {inviteDev.level} · Grade {inviteDev.overall_grade} · {inviteDev.availability}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteDev(null)}
                    className="px-3 py-2 rounded-md border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingInvite}
                    className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white flex items-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSendingInvite ? "Dispatching..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
