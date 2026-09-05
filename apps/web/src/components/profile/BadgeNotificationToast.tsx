"use client";

import React, { useState, useEffect } from "react";
import { Award, ShieldCheck, X, CheckCircle2 } from "lucide-react";

export interface BadgeNotification {
  id?: string;
  title: string;
  badge_name: string;
  tier: "Gold" | "Silver" | "Bronze" | string;
  message: string;
  timestamp?: string;
}

interface BadgeNotificationToastProps {
  notification: BadgeNotification | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function BadgeNotificationToast({
  notification,
  onDismiss,
  autoDismissMs = 6000,
}: BadgeNotificationToastProps) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [notification, autoDismissMs, onDismiss]);

  if (!notification) return null;

  const getTierAccents = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "gold":
        return {
          border: "border-amber-300",
          bg: "bg-white",
          iconBg: "bg-amber-100 text-amber-800 border-amber-300",
          tag: "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "silver":
        return {
          border: "border-slate-300",
          bg: "bg-white",
          iconBg: "bg-slate-100 text-slate-800 border-slate-300",
          tag: "bg-slate-100 text-slate-900 border-slate-300",
        };
      case "bronze":
      default:
        return {
          border: "border-orange-300",
          bg: "bg-white",
          iconBg: "bg-orange-100 text-orange-900 border-orange-300",
          tag: "bg-orange-100 text-orange-900 border-orange-300",
        };
    }
  };

  const accents = getTierAccents(notification.tier);

  return (
    <aside 
      aria-label="Certification unlocked notification"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div
        className={`rounded-lg border shadow-elevation p-4 ${accents.bg} ${accents.border} relative flex items-start gap-3.5 backdrop-blur-sm`}
      >
        {/* Certification Medal Icon */}
        <div
          className={`h-9 w-9 rounded-md flex items-center justify-center shrink-0 border ${accents.iconBg}`}
        >
          <Award className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-900 tracking-tight">
              {notification.title}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${accents.tag}`}
            >
              {notification.tier}
            </span>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 pt-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Cryptographically Verified Credential Standard</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
          title="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
