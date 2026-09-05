"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";

export type AccountRole = "developer" | "student" | "recruiter" | "institution";

export interface UserProfile {
  id: string;
  auth_user_id?: string;
  username: string;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  location: string;
  role: AccountRole;
  university?: string;
  graduation_year?: number;
  website_url?: string;
  github_username?: string;
  linkedin_url?: string;
  total_xp: number;
  level: number;
  overall_grade: string;
  collaboration_score: number;
  profile_completion: number;
  company_name?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  role: AccountRole;
  profileCompletion: number;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: MOCK_CURRENT_USER.id,
  username: MOCK_CURRENT_USER.username,
  full_name: MOCK_CURRENT_USER.full_name,
  headline: MOCK_CURRENT_USER.title,
  bio: MOCK_CURRENT_USER.bio,
  avatar_url: MOCK_CURRENT_USER.avatar_url,
  location: MOCK_CURRENT_USER.location,
  role: "developer",
  university: "Rajalakshmi Institute of Technology",
  graduation_year: 2025,
  github_username: MOCK_CURRENT_USER.github_username,
  total_xp: MOCK_CURRENT_USER.total_xp,
  level: MOCK_CURRENT_USER.level,
  overall_grade: "B",
  collaboration_score: 86,
  profile_completion: 100,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>({ email: "gnaneshwar@proofhire.network", id: "user_demo" });
  const [profile, setProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check localStorage for persisted demo session or active Supabase session
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("proofhire_profile");
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) {
          // fallback to default
        }
      }

      if (isSupabaseConfigured) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUser(session.user);
            fetchSupabaseProfile(session.user.id);
          }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(session.user);
            fetchSupabaseProfile(session.user.id);
          } else {
            setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      }
    }
  }, []);

  const fetchSupabaseProfile = async (authUserId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();
      if (data && !error) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching Supabase profile:", err);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) setUser(data.user);
      } else {
        // Local state authentication for seamless demo
        const mockUser = { id: `user_${Date.now()}`, email };
        setUser(mockUser);
        const existingProfile = {
          ...DEFAULT_PROFILE,
          auth_user_id: mockUser.id,
          full_name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
          username: email.split("@")[0].toLowerCase(),
          profile_completion: 100
        };
        setProfile(existingProfile);
        localStorage.setItem("proofhire_profile", JSON.stringify(existingProfile));
      }
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata: any = {}) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });
        if (error) return { error: error.message };
        if (data.user) setUser(data.user);
      } else {
        const newUser = { id: `user_${Date.now()}`, email };
        setUser(newUser);
        // New user starts with incomplete profile requiring onboarding
        const newProfile: UserProfile = {
          id: `profile_${Date.now()}`,
          auth_user_id: newUser.id,
          username: email.split("@")[0].toLowerCase(),
          full_name: metadata.full_name || email.split("@")[0],
          headline: "Software Engineer",
          bio: "",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
          location: "Remote",
          role: metadata.role || "developer",
          total_xp: 0,
          level: 1,
          overall_grade: "B",
          collaboration_score: 100.0,
          profile_completion: 20,
        };
        setProfile(newProfile);
        localStorage.setItem("proofhire_profile", JSON.stringify(newProfile));
      }
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } else {
      // Mock OAuth
      const oauthUser = { id: `user_google_${Date.now()}`, email: "alex.google@example.com" };
      setUser(oauthUser);
      const newProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        auth_user_id: oauthUser.id,
        full_name: "Alex Chen (Google)",
        profile_completion: 30, // Triggers onboarding
      };
      setProfile(newProfile);
      localStorage.setItem("proofhire_profile", JSON.stringify(newProfile));
      window.location.href = "/onboarding";
    }
  };

  const signInWithGithub = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } else {
      // Mock OAuth
      const oauthUser = { id: `user_github_${Date.now()}`, email: "alex.github@example.com" };
      setUser(oauthUser);
      const newProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        auth_user_id: oauthUser.id,
        full_name: "Alex Chen (GitHub)",
        github_username: "alexchen_dev",
        profile_completion: 30, // Triggers onboarding
      };
      setProfile(newProfile);
      localStorage.setItem("proofhire_profile", JSON.stringify(newProfile));
      window.location.href = "/onboarding";
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem("proofhire_profile");
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem("proofhire_profile", JSON.stringify(updated));

    if (isSupabaseConfigured && profile.auth_user_id) {
      try {
        await supabase
          .from("profiles")
          .update(data)
          .eq("auth_user_id", profile.auth_user_id);
      } catch (err) {
        console.error("Error updating Supabase profile:", err);
      }
    }
  };

  const completeOnboarding = async (data: any) => {
    const updated: UserProfile = {
      ...(profile || DEFAULT_PROFILE),
      role: data.role || profile?.role || "developer",
      full_name: data.full_name || profile?.full_name || "New Member",
      username: data.username || profile?.username || "new_member",
      headline: data.headline || profile?.headline || "Software Engineer",
      bio: data.bio || profile?.bio || "",
      location: data.location || profile?.location || "Remote",
      university: data.university,
      graduation_year: data.graduation_year ? Number(data.graduation_year) : undefined,
      company_name: data.company_name,
      github_username: data.github_username || profile?.github_username,
      total_xp: Math.max(1000, profile?.total_xp || 1000),
      profile_completion: 100, // 100% complete
    };
    setProfile(updated);
    localStorage.setItem("proofhire_profile", JSON.stringify(updated));

    if (isSupabaseConfigured && profile?.auth_user_id) {
      try {
        await supabase.from("profiles").upsert(updated);
      } catch (err) {
        console.error("Error saving completed profile to Supabase:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || "developer",
        profileCompletion: profile?.profile_completion ?? 100,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
