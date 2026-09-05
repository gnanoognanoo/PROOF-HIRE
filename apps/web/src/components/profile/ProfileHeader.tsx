"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  GraduationCap, 
  Github, 
  Globe, 
  UserPlus, 
  MessageSquare, 
  Users, 
  MoreHorizontal, 
  Bookmark, 
  CheckSquare, 
  Video, 
  Share2, 
  Check,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { ProfessionalProfile } from "@/lib/types";

interface ProfileHeaderProps {
  profile: ProfessionalProfile;
  isRecruiterView?: boolean;
  onInviteInterview?: () => void;
  onInviteAssessment?: () => void;
}

export function ProfileHeader({
  profile,
  isRecruiterView = false,
  onInviteInterview,
  onInviteAssessment
}: ProfileHeaderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 sm:p-6 shadow-subtle space-y-5">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg overflow-hidden border border-border bg-neutral-100 shadow-subtle">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            </div>
            {profile.isVerified && (
              <div 
                className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1 rounded-full ring-2 ring-white"
                title="Cryptographically Verified Identity"
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {profile.fullName}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  <CheckCircle2 className="h-3 w-3 text-brand-600" />
                  <span>Verified Identity</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-800 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded shadow-xs" title="Deterministic Professional Reputation Grade">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                <span>Professional Reputation Grade: <strong className="font-bold text-brand-700">Tier {profile.overallGrade}</strong> (Lvl {profile.level})</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-snug">
              {profile.headline}
            </p>

            {/* Metadata row: Location, University, GitHub, Website */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-neutral-500 pt-0.5 font-mono">
              <span className="flex items-center gap-1 text-neutral-600">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                <span>{profile.location}</span>
              </span>

              <span className="flex items-center gap-1 text-neutral-600">
                <GraduationCap className="h-3.5 w-3.5 text-neutral-400" />
                <span>{profile.university}</span>
              </span>

              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-neutral-600 hover:text-brand-600 transition-colors"
              >
                <Github className="h-3.5 w-3.5 text-neutral-400" />
                <span>github.com/{profile.githubUsername}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>

              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-brand-600 hover:underline"
              >
                <Globe className="h-3.5 w-3.5 text-neutral-400" />
                <span>{profile.portfolioUrl.replace("https://", "")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/80">
        {/* Standard Professional Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`h-8 px-3.5 rounded-md text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5 ${
              isConnected
                ? "bg-neutral-100 text-neutral-800 border border-border hover:bg-neutral-200"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {isConnected ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
            <span>{isConnected ? "Connected" : "Connect"}</span>
          </button>

          <button className="h-8 px-3 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-neutral-500" />
            <span>Message</span>
          </button>

          <button className="h-8 px-3 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-neutral-500" />
            <span>Collaborate</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="h-8 w-8 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-500 flex items-center justify-center transition-colors"
              title="More Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 mt-1 w-44 rounded-md border border-border bg-surface shadow-dropdown p-1 z-30 text-xs font-mono">
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Copy Profile Link</span>
                </button>
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5"
                >
                  <Github className="h-3.5 w-3.5 text-neutral-400" />
                  <span>View GitHub</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Recruiter Priority Actions (Show if recruiter view is enabled or as recruiter toolbar) */}
        {isRecruiterView && (
          <div className="flex flex-wrap items-center gap-2 pl-2 border-l border-border/80">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`h-8 px-2.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isSaved
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : "bg-white text-neutral-700 border-border hover:bg-neutral-50"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-amber-600 text-amber-600" : "text-neutral-400"}`} />
              <span>{isSaved ? "Saved" : "Save Candidate"}</span>
            </button>

            <button
              onClick={onInviteAssessment}
              className="h-8 px-3 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="h-3.5 w-3.5 text-brand-600" />
              <span>Invite to Assessment</span>
            </button>

            <button
              onClick={onInviteInterview}
              className="h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Invite to Interview</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
