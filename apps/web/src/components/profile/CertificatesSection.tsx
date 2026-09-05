"use client";

import React from "react";
import { CertificateItem } from "@/lib/types";
import { ShieldCheck, CheckCircle2, ExternalLink, Award, FileCheck } from "lucide-react";

interface CertificatesSectionProps {
  certificates: CertificateItem[];
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Verified Professional Certificates ({certificates.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          Cryptographically Anchored
        </span>
      </div>

      <div className="space-y-3">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-3.5 rounded-lg border border-border bg-white hover:border-neutral-300 transition-colors shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-brand-50 border border-brand-200 text-brand-700 shrink-0">
                <Award className="h-4 w-4" />
              </div>

              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-neutral-900 leading-snug">
                  {cert.title}
                </h3>
                <div className="text-[11px] text-neutral-600 font-mono flex flex-wrap items-center gap-2">
                  <span>{cert.issuer}</span>
                  <span>•</span>
                  <span>Issued {cert.issueDate}</span>
                  {cert.expiryDate && (
                    <>
                      <span>•</span>
                      <span>Expires {cert.expiryDate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>{cert.verificationStatus}</span>
              </span>

              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 px-2.5 rounded border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-subtle flex items-center gap-1 transition-colors"
              >
                <span>View Credential</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
