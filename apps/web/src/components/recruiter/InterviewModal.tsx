"use client";

import React, { useState } from "react";
import { X, Video, Calendar, User, Clock, ExternalLink, CheckCircle2, MessageSquare, Briefcase } from "lucide-react";
import { inviteCandidateToInterview } from "@/lib/api-client";

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateUsername: string;
  candidateName: string;
  defaultRoleTitle?: string;
  candidateAvatar?: string;
  onSuccess?: () => void;
}

export function InterviewModal({
  isOpen,
  onClose,
  candidateUsername,
  candidateName,
  defaultRoleTitle = "Staff Frontend & Compiler Architect",
  candidateAvatar,
  onSuccess,
}: InterviewModalProps) {
  const [jobTitle, setJobTitle] = useState(defaultRoleTitle);
  const [date, setDate] = useState("2024-11-25");
  const [time, setTime] = useState("2:00 PM PST");
  const [duration, setDuration] = useState("45 minutes");
  const [message, setMessage] = useState(
    "We were deeply impressed by your verified compiler benchmarks and repository evaluations. We would like to invite you for a 45-minute technical architecture huddle."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledRoom, setScheduledRoom] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await inviteCandidateToInterview({
        candidate_username: candidateUsername,
        candidate_name: candidateName,
        job_title: jobTitle,
        date,
        time,
        duration,
        message,
        candidate_avatar: candidateAvatar,
        company: "Acme Technologies",
      });
      setScheduledRoom(res?.interview?.jitsi_url || "https://meet.jit.si/proofhire-acme-interview");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Interview invite failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-sm flex justify-center items-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-surface border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">Invite to Interview</h3>
              <p className="text-xs text-neutral-400 font-mono">Dispatches Jitsi room & Acme Technologies invite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scheduledRoom ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-100">Interview Invitation Dispatched!</h4>
              <p className="text-xs text-neutral-300">
                A notification <span className="font-semibold text-neutral-100">“Interview invitation from Acme Technologies”</span> has been sent to @{candidateUsername}.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-canvas border border-border font-mono text-xs space-y-1.5">
              <div className="text-neutral-400 text-[11px]">Generated Jitsi Meet Video Room:</div>
              <a
                href={scheduledRoom}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:text-brand-300 break-all flex items-center gap-1.5 font-semibold"
              >
                <span>{scheduledRoom}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
              <a
                href={scheduledRoom}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Launch Jitsi Room Now</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Candidate Field */}
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" />
                Candidate
              </label>
              <div className="p-2.5 rounded-lg bg-canvas border border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-xs">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-200">{candidateName}</span>
                    <span className="text-[11px] font-mono text-neutral-500 ml-1.5">@{candidateUsername}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Targeted Candidate
                </span>
              </div>
            </div>

            {/* Job Field */}
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                Job
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-neutral-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Date and Time Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-neutral-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  placeholder="e.g. 2:00 PM PST"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-neutral-200 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Duration Field */}
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-canvas border border-border text-neutral-200 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="30 minutes">30 minutes (Screening)</option>
                <option value="45 minutes">45 minutes (Technical Architecture)</option>
                <option value="60 minutes">60 minutes (Deep Dive & Systems Evaluation)</option>
                <option value="90 minutes">90 minutes (Comprehensive Pair Programming)</option>
              </select>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-canvas border border-border text-neutral-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-canvas border border-border hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Generating Room..." : "Dispatch Invitation"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
