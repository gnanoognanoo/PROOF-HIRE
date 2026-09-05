"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FolderGit2, 
  Layers, 
  Activity, 
  Users, 
  Award, 
  FileCode, 
  CheckSquare, 
  ExternalLink,
  ShieldAlert,
  Binary,
  Radio,
  Search,
  FileText
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const workspaceNav = [
    { label: "Candidate Workstation", href: "/", icon: Layers },
    { label: "Public Profile", href: "/u/gnaneshwar", icon: Binary },
    { label: "Collaborate", href: "/collaborate", icon: Users },
    { label: "Live Code Evaluator", href: "/evaluator", icon: FileCode },
    { label: "Assessments", href: "/assessments", icon: CheckSquare },
    { label: "Activity Feed", href: "/feed", icon: Radio },
  ];

  const evaluationNav = [
    { label: "Recruiter Dashboard", href: "/recruiter", icon: Users },
    { label: "Talent Search", href: "/recruiter/talent", icon: Search },
    { label: "Assessments Hub", href: "/recruiter/assessments", icon: FileText },
    { label: "Verification Logs", href: "/feed", icon: Activity },
  ];

  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-surface flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Workspace section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-600" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Evaluation section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
            Evaluation
          </div>
          <nav className="space-y-0.5">
            {evaluationNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-600" : "text-neutral-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-border bg-canvas/60">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>TestNet Verified</span>
          </div>
          <span className="text-neutral-400">v2.4.1</span>
        </div>
      </div>
    </aside>
  );
}
