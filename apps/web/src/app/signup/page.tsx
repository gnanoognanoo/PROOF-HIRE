"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Github, Mail, Lock, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth, AccountRole } from "@/context/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGithub, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("developer");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await signUpWithEmail(email, password, { full_name: fullName, role });
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setErrorMsg(null);
    try {
      if (provider === "github") {
        await signInWithGithub();
      } else {
        await signInWithGoogle();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to sign up with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-canvas">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 space-y-2">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-neutral-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white shadow-subtle">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">ProofHire</span>
        </Link>
        <p className="text-xs font-mono text-neutral-500 text-center">
          Cryptographic Skill-Verification & Engineering Network
        </p>
      </div>

      {/* Main Signup Card */}
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-5">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Create your account</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Join thousands of engineers proving skills through verifiable code artifacts.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth("github")}
            className="w-full h-9 px-3 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-subtle transition-colors flex items-center justify-center gap-2"
          >
            <Github className="h-4 w-4" />
            <span>Sign up with GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="w-full h-9 px-3 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-subtle transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border"></div>
          <span className="bg-surface px-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider relative">
            Or create with email
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-800">Account Primary Role</label>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              {[
                { id: "developer", label: "Developer" },
                { id: "student", label: "Student" },
                { id: "recruiter", label: "Recruiter" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as AccountRole)}
                  className={`py-1.5 px-2 rounded border text-center transition-colors ${
                    role === r.id
                      ? "border-brand-600 bg-brand-50 text-brand-900 font-bold"
                      : "border-border bg-canvas/70 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-800">Legal Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-800">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@organization.com"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-800">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-semibold shadow-subtle transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating profile...</span>
              </>
            ) : (
              <>
                <span>Continue to Onboarding</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-border/80 text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
