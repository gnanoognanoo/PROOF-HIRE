"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Terminal } from "lucide-react";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  statusBadge?: string;
}

export function Breadcrumb({ items, statusBadge }: BreadcrumbProps) {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 lg:px-6 border-b border-border bg-surface text-xs">
      <div className="flex items-center gap-1.5 text-neutral-500 font-mono">
        <Terminal className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-neutral-400">proofhire</span>
        <span className="text-neutral-300">/</span>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-neutral-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-neutral-900" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-neutral-300">/</span>}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>{statusBadge || "Verified State"}</span>
        </span>
      </div>
    </div>
  );
}
