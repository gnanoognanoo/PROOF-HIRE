"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MOCK_VERIFICATION_FEED } from "@/lib/mock-data";
import { getGradeBadgeStyle, formatAddress } from "@/lib/utils";
import { 
  Radio, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Cpu, 
  Award, 
  Layers, 
  Terminal,
  Activity,
  Lock,
  ArrowUpRight
} from "lucide-react";

export default function FeedPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const activities = MOCK_VERIFICATION_FEED;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-neutral-900">
      <TopNav />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col pb-12">
          <Breadcrumb
            items={[
              { label: "network", href: "/feed" },
              { label: "verification-feed" }
            ]}
            statusBadge="Realtime SSE Connected"
          />

          <div className="p-4 lg:p-6 space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Polygon PoS Live Feed</span>
                </div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
                  Cryptographic Verification Ledger
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Chronological, immutable record of static code audits, AST invariants verified by Gemini 1.5, and smart contract blocks mined.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-md border border-border bg-white shadow-subtle">
                  <span className="text-neutral-400 text-[10px] uppercase block">24h Proofs</span>
                  <span className="font-bold text-neutral-900">1,492 Mined</span>
                </div>
                <div className="px-3 py-1.5 rounded-md border border-border bg-white shadow-subtle">
                  <span className="text-neutral-400 text-[10px] uppercase block">Mean Finality</span>
                  <span className="font-bold text-emerald-700">2.1s</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 border-b border-border pb-2 text-xs font-mono">
              {["ALL", "ONCHAIN_ANCHOR", "EVALUATION_COMPLETED", "BADGE_AWARDED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filter === f
                      ? "bg-neutral-900 text-white font-semibold"
                      : "bg-white text-neutral-600 hover:bg-neutral-100 border border-border"
                  }`}
                >
                  {f === "ALL" ? "All Activity" : f.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Stream List */}
            <div className="space-y-3">
              {activities
                .filter((item) => filter === "ALL" || item.type === filter)
                .map((item) => {
                  const gradeStyle = getGradeBadgeStyle(item.grade);
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-white p-4 shadow-subtle space-y-3 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden border border-border bg-neutral-100 shrink-0">
                            <img
                              src={item.developer_avatar}
                              alt={item.developer_name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-neutral-900">{item.developer_name}</span>
                              <span className="text-neutral-400 font-mono text-[11px]">•</span>
                              <span className="text-neutral-500 font-mono text-[11px]">{item.timestamp}</span>
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1 mt-0.5">
                              <span>Repository:</span>
                              <strong className="text-neutral-800">{item.repo_name}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Grade Pill */}
                        <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                          Grade {item.grade} ({item.score}%)
                        </div>
                      </div>

                      <p className="text-xs text-neutral-700 leading-relaxed font-mono bg-canvas/60 p-2.5 rounded border border-border/70">
                        {item.details}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1 text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Gemini 1.5 AST Proof Verified</span>
                        </div>

                        {item.polygon_tx && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${item.polygon_tx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline flex items-center gap-1"
                          >
                            <span>Polygon Tx: {formatAddress(item.polygon_tx, 4)}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
