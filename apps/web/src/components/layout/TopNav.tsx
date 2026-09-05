"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  Terminal,
  Cpu,
  LogOut,
  User,
  Sparkles,
  Sliders,
  Video,
  Clock,
  Calendar,
  X,
  Check,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getCandidateNotifications, respondToInterview } from "@/lib/api-client";
import type { CandidateInterviewNotification } from "@/lib/types";

interface TopNavProps {
  onOpenSubmitModal?: () => void;
}

export function TopNav({ onOpenSubmitModal }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, role } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CandidateInterviewNotification[]>([]);
  const [hasLoadedNotifs, setHasLoadedNotifs] = useState(false);

  const fetchNotifs = async () => {
    try {
      const username = profile?.username || "gnaneshwar";
      const res = await getCandidateNotifications(username);
      setNotifications(res.notifications);
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    }
  };

  React.useEffect(() => {
    fetchNotifs();
  }, [profile?.username]);

  const handleRespond = async (notif: CandidateInterviewNotification, action: "ACCEPT" | "DECLINE") => {
    try {
      const username = profile?.username || "gnaneshwar";
      await respondToInterview(notif.interview_id, username, action);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileHref = `/u/${profile?.username || "gnaneshwar"}`;

  const navLinks = [
    { label: "Candidate Workstation", href: "/" },
    { label: "Public Profile", href: profileHref },
    { label: "Collaborate", href: "/collaborate" },
    { label: "Assessments", href: "/assessments" },
    { label: "Recruiter Portal", href: "/recruiter" },
    { label: "Evaluator", href: "/evaluator" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const unreadCount = notifications.filter((n) => n.status === "PENDING").length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface shadow-subtle">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Brand & Omni-Search */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-neutral-900 hover:opacity-90 transition-opacity">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white shadow-subtle">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-neutral-900 tracking-tight">ProofHire</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                v2.4
              </span>
            </div>
          </Link>

          {/* Omni-search input */}
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search candidates, repos, AST benchmarks... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-canvas pl-8 pr-7 text-xs text-neutral-900 placeholder:text-neutral-500 focus:border-brand-600 focus:bg-surface focus:outline-none transition-colors"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-white px-1.5 text-[10px] font-mono text-neutral-400">
              /
            </kbd>
          </div>
        </div>

        {/* Center navigation links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-neutral-600">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-neutral-100 text-neutral-900 font-semibold"
                    : "hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Tools & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Submit Repo Button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-subtle transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Submit Repo for Evaluation</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* Notification bell & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              title="Notifications"
              aria-label="Candidate Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-surface shadow-dropdown p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">
                      Candidate Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-brand-600 text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500 font-mono">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-md border text-xs space-y-2 ${
                          notif.status === "PENDING"
                            ? "bg-brand-50/50 border-brand-200"
                            : "bg-canvas border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                            <Video className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span>{notif.title}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold uppercase ${
                              notif.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : notif.status === "DECLINED"
                                ? "bg-neutral-100 text-neutral-600"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {notif.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-600 leading-snug">
                          {notif.message}
                        </p>

                        <div className="p-2 rounded bg-white border border-border text-[11px] font-mono space-y-1 text-neutral-600">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Position:</span>
                            <span className="font-semibold text-neutral-800">{notif.job_title}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Schedule:</span>
                            <span className="text-neutral-800">{notif.date} at {notif.time} ({notif.duration})</span>
                          </div>
                        </div>

                        {notif.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleRespond(notif, "DECLINE")}
                              className="px-3 py-1 rounded bg-white border border-border hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleRespond(notif, "ACCEPT")}
                              className="px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                          </div>
                        ) : notif.status === "ACCEPTED" ? (
                          <div className="pt-1">
                            <a
                              href={notif.jitsi_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-subtle flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Launch Jitsi Room</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule or Sign In Links */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-90 transition-opacity"
              >
                <div className="relative h-7 w-7 rounded-full overflow-hidden border border-border bg-neutral-100">
                  <img
                    src={profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"}
                    alt={profile?.full_name || "Member"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-neutral-900 leading-tight">
                      {profile?.full_name || "Alex Chen"}
                    </span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 leading-tight">
                    Lvl {profile?.level || 7} · {(profile?.total_xp || 14850).toLocaleString()} XP
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown z-50 text-xs font-mono animate-in fade-in">
                  <div className="p-2 border-b border-border/80">
                    <div className="font-bold text-neutral-900">{profile?.full_name}</div>
                    <div className="text-[11px] text-neutral-500">@{profile?.username}</div>
                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] bg-brand-50 text-brand-700 border border-brand-200 uppercase font-semibold">
                      Role: {profile?.role}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/onboarding"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-neutral-50 text-neutral-700"
                    >
                      <Sliders className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Onboarding Wizard</span>
                    </Link>
                    <Link
                      href="/recruiter"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-neutral-50 text-neutral-700"
                    >
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Recruiter Portal</span>
                    </Link>
                    <Link
                      href={profileHref}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-neutral-50 text-neutral-700"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Public Profile</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-border/80">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 xl:hidden transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-surface px-4 py-3 space-y-2 shadow-dropdown">
          <nav className="flex flex-col space-y-1 text-xs font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
