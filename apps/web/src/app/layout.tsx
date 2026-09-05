import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofHire — Cryptographic Skill Verification & Engineering Hiring Network",
  description: "ProofHire is a production-quality skill-verification network for developers, recruiters, and institutions. Proving engineering capability through AI-evaluated code, GitHub repos, and Polygon smart contracts.",
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F6F8FA]">
      <body className="min-h-full flex flex-col antialiased text-neutral-900 bg-[#F6F8FA]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
