-- ============================================================
-- ProofHire Phase 3 Database Migration
-- Migration: 20250103_problem_solving_schema.sql
-- Description: Problem-Solving Reputation Engine Schema
-- Tables: problem_solving_profiles, platform_accounts,
--         coding_submissions, coding_contests.
-- ============================================================

-- Table 1: problem_solving_profiles
CREATE TABLE IF NOT EXISTS public.problem_solving_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cumulative_ps_xp INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    problem_solving_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    grade grade_tier NOT NULL DEFAULT 'C',
    total_solved INT NOT NULL DEFAULT 0,
    easy_count INT NOT NULL DEFAULT 0,
    medium_count INT NOT NULL DEFAULT 0,
    hard_count INT NOT NULL DEFAULT 0,
    active_streak_weeks INT NOT NULL DEFAULT 0,
    contest_rating INT,
    global_rank VARCHAR(64),
    topic_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ps_profiles_user ON public.problem_solving_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ps_profiles_xp ON public.problem_solving_profiles(cumulative_ps_xp DESC);
CREATE INDEX IF NOT EXISTS idx_ps_profiles_score ON public.problem_solving_profiles(problem_solving_score DESC);

DROP TRIGGER IF EXISTS trigger_ps_profiles_updated_at ON public.problem_solving_profiles;
CREATE TRIGGER trigger_ps_profiles_updated_at
BEFORE UPDATE ON public.problem_solving_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Table 2: platform_accounts
CREATE TABLE IF NOT EXISTS public.platform_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform_name VARCHAR(64) NOT NULL,
    handle VARCHAR(128) NOT NULL,
    profile_url TEXT NOT NULL,
    solved_count INT NOT NULL DEFAULT 0,
    easy INT NOT NULL DEFAULT 0,
    medium INT NOT NULL DEFAULT 0,
    hard INT NOT NULL DEFAULT 0,
    rating INT,
    rank_title VARCHAR(64),
    verification_strength VARCHAR(64) NOT NULL DEFAULT 'PUBLIC_PROFILE_VERIFIED',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, platform_name)
);

CREATE INDEX IF NOT EXISTS idx_platform_accounts_profile ON public.platform_accounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_platform_accounts_platform ON public.platform_accounts(platform_name);

-- Table 3: coding_submissions
CREATE TABLE IF NOT EXISTS public.coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform VARCHAR(64) NOT NULL,
    problem_title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    topic VARCHAR(64) NOT NULL,
    language VARCHAR(64) NOT NULL DEFAULT 'TypeScript',
    time_complexity VARCHAR(64),
    space_complexity VARCHAR(64),
    source_code TEXT,
    quality_score NUMERIC(5,2) DEFAULT 0.00,
    awarded_xp INT NOT NULL DEFAULT 0,
    verification_strength VARCHAR(64) NOT NULL DEFAULT 'PUBLIC_PROFILE_VERIFIED',
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coding_submissions_user ON public.coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_platform ON public.coding_submissions(platform);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_topic ON public.coding_submissions(topic);

-- Table 4: coding_contests
CREATE TABLE IF NOT EXISTS public.coding_contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform VARCHAR(64) NOT NULL,
    contest_name VARCHAR(128) NOT NULL,
    rank INT,
    percentile NUMERIC(5,2),
    rating_change INT,
    final_rating INT,
    contest_date TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_coding_contests_user ON public.coding_contests(user_id);
CREATE INDEX IF NOT EXISTS idx_coding_contests_platform ON public.coding_contests(platform);

-- Row Level Security (RLS)
ALTER TABLE public.problem_solving_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_contests ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Problem solving profiles are viewable by everyone" ON public.problem_solving_profiles FOR SELECT USING (true);
CREATE POLICY "Platform accounts are viewable by everyone" ON public.platform_accounts FOR SELECT USING (true);
CREATE POLICY "Coding submissions are viewable by everyone" ON public.coding_submissions FOR SELECT USING (true);
CREATE POLICY "Coding contests are viewable by everyone" ON public.coding_contests FOR SELECT USING (true);

-- User Management Policies
CREATE POLICY "Users can manage their problem solving profile" ON public.problem_solving_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = problem_solving_profiles.user_id AND profiles.auth_user_id = auth.uid())
);

CREATE POLICY "Users can manage their platform accounts" ON public.platform_accounts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = platform_accounts.profile_id AND profiles.auth_user_id = auth.uid())
);

CREATE POLICY "Users can manage their coding submissions" ON public.coding_submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = coding_submissions.user_id AND profiles.auth_user_id = auth.uid())
);
