"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Github, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGithub, signInWithGoogle, profileCompletion } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        if (profileCompletion < 100) {
          router.push("/onboarding");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to sign in. Please try again.");
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
      setErrorMsg(err?.message || `Failed to sign in with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-canvas">
      {/* Brand header */}
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

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-5">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Sign in to your account</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Choose your preferred sign-in method to access verified dossiers.
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
            <span>Continue with GitHub</span>
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
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border"></div>
          <span className="bg-surface px-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider relative">
            Or email
          </span>
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-800">Work / Academic Email</label>
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-800">Password</label>
              <a href="#forgot" className="text-[11px] font-mono text-brand-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in with Email</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-border/80 text-center text-xs text-neutral-500">
          New to ProofHire?{" "}
          <Link href="/signup" className="text-brand-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
