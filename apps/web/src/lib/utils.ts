import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GradeTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGradeBadgeStyle(grade: GradeTier): {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
  badge: string;
} {
  switch (grade) {
    case 'O':
      return {
        bg: "bg-[#ECFDF5]",
        border: "border-[#A7F3D0]",
        text: "text-[#065F46]",
        dot: "bg-[#10B981]",
        label: "Grade O (Outstanding)",
        badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      };
    case 'A':
      return {
        bg: "bg-[#F0F9FF]",
        border: "border-[#BAE6FD]",
        text: "text-[#0369A1]",
        dot: "bg-[#0284C7]",
        label: "Grade A (Distinction)",
        badge: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
      };
    case 'B':
      return {
        bg: "bg-[#EEF2FF]",
        border: "border-[#C7D2FE]",
        text: "text-[#3730A3]",
        dot: "bg-[#6366F1]",
        label: "Grade B (Proficient)",
        badge: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
      };
    case 'C':
      return {
        bg: "bg-[#FFFBEB]",
        border: "border-[#FDE68A]",
        text: "text-[#92400E]",
        dot: "bg-[#F59E0B]",
        label: "Grade C (Competent)",
        badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      };
    case 'D':
      return {
        bg: "bg-[#FEF2F2]",
        border: "border-[#FECACA]",
        text: "text-[#991B1B]",
        dot: "bg-[#EF4444]",
        label: "Grade D (Basic)",
        badge: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      };
    default:
      return {
        bg: "bg-[#F3F4F6]",
        border: "border-[#E5E7EB]",
        text: "text-[#4B5563]",
        dot: "bg-[#9CA3AF]",
        label: "Grade E (Unverified)",
        badge: "bg-neutral-800 text-neutral-400 border border-neutral-700",
      };
  }
}

export function formatAddress(address?: string, chars = 4): string {
  if (!address) return "—";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
