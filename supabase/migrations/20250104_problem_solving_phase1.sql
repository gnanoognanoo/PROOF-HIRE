-- ============================================================
-- ProofHire Phase 1: Problem-Solving Reputation Engine
-- Migration: 20250104_problem_solving_phase1.sql
-- Description: Complete data model for platform connections,
--              problem catalog, solve events, contests,
--              topic performance, problem-solving profiles,
--              and the immutable idempotent XP ledger.
-- ============================================================

-- Ensure uuid & pgcrypto extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure trigger function exists for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. PLATFORM CONNECTIONS
-- ============================================================
-- Note: Never store coding-platform passwords.
-- Future OAuth tokens must be stored securely server-side
-- and never exposed to client-side code.

CREATE TABLE IF NOT EXISTS public.problem_solving_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (
        provider IN ('leetcode', 'skillrack', 'hackerrank', 'codechef', 'codeforces', 'geeksforgeeks', 'proofhire')
    ),
    external_user_id TEXT,
    username TEXT NOT NULL,
    profile_url TEXT,
    connection_method TEXT NOT NULL CHECK (
        connection_method IN ('oauth', 'public_api', 'profile_verification', 'manual_import', 'admin_verified')
    ),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'failed', 'revoked')
    ),
    last_sync_at TIMESTAMPTZ,
    sync_cursor TEXT,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_connection_user_provider_username UNIQUE (user_id, provider, username)
);

CREATE INDEX IF NOT EXISTS idx_ps_conn_user_id ON public.problem_solving_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_ps_conn_provider ON public.problem_solving_connections(provider);
CREATE INDEX IF NOT EXISTS idx_ps_conn_verification ON public.problem_solving_connections(verification_status);

DROP TRIGGER IF EXISTS trigger_ps_connections_updated_at ON public.problem_solving_connections;
CREATE TRIGGER trigger_ps_connections_updated_at
BEFORE UPDATE ON public.problem_solving_connections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 2. PROBLEM CATALOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.problem_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (
        provider IN ('leetcode', 'skillrack', 'hackerrank', 'codechef', 'codeforces', 'geeksforgeeks', 'proofhire')
    ),
    external_problem_id TEXT NOT NULL,
    slug TEXT,
    title TEXT NOT NULL,
    problem_url TEXT,
    difficulty_raw TEXT,
    difficulty_normalized TEXT NOT NULL CHECK (
        difficulty_normalized IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'UNKNOWN')
    ),
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    canonical_fingerprint TEXT,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_catalog_provider_external_id UNIQUE (provider, external_problem_id)
);

CREATE INDEX IF NOT EXISTS idx_problem_catalog_provider ON public.problem_catalog(provider);
CREATE INDEX IF NOT EXISTS idx_problem_catalog_external_id ON public.problem_catalog(external_problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_catalog_canonical ON public.problem_catalog(canonical_fingerprint);
CREATE INDEX IF NOT EXISTS idx_problem_catalog_difficulty ON public.problem_catalog(difficulty_normalized);

DROP TRIGGER IF EXISTS trigger_problem_catalog_updated_at ON public.problem_catalog;
CREATE TRIGGER trigger_problem_catalog_updated_at
BEFORE UPDATE ON public.problem_catalog
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 3. PROBLEM SOLVE EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.problem_solve_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES public.problem_solving_connections(id) ON DELETE SET NULL,
    problem_id UUID NOT NULL REFERENCES public.problem_catalog(id) ON DELETE CASCADE,
    submission_id TEXT,
    status TEXT NOT NULL CHECK (
        status IN ('accepted', 'failed', 'imported', 'pending_verification', 'rejected')
    ),
    language TEXT,
    solved_at TIMESTAMPTZ,
    runtime_ms DOUBLE PRECISION,
    memory_kb DOUBLE PRECISION,
    source_code_hash TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (
        verification_status IN ('provider_verified', 'profile_verified', 'admin_verified', 'user_reported', 'unverified')
    ),
    verification_confidence DOUBLE PRECISION NOT NULL DEFAULT 0.0 CHECK (
        verification_confidence >= 0.0 AND verification_confidence <= 1.0
    ),
    quality_score DOUBLE PRECISION CHECK (
        quality_score IS NULL OR (quality_score >= 0.0 AND quality_score <= 100.0)
    ),
    base_xp INTEGER NOT NULL DEFAULT 0,
    skill_xp INTEGER NOT NULL DEFAULT 0,
    overall_xp INTEGER NOT NULL DEFAULT 0,
    xp_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency Constraints:
-- 1. If submission_id exists, cannot have duplicate submission from the same connection
CREATE UNIQUE INDEX IF NOT EXISTS uq_solve_event_submission 
ON public.problem_solve_events(user_id, connection_id, submission_id) 
WHERE submission_id IS NOT NULL;

-- 2. An accepted solve cannot award XP multiple times for the same problem
CREATE UNIQUE INDEX IF NOT EXISTS uq_solve_event_accepted_xp 
ON public.problem_solve_events(user_id, problem_id) 
WHERE status = 'accepted' AND xp_awarded = TRUE;

CREATE INDEX IF NOT EXISTS idx_solve_events_user ON public.problem_solve_events(user_id);
CREATE INDEX IF NOT EXISTS idx_solve_events_problem ON public.problem_solve_events(problem_id);
CREATE INDEX IF NOT EXISTS idx_solve_events_connection ON public.problem_solve_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_solve_events_status ON public.problem_solve_events(status);
CREATE INDEX IF NOT EXISTS idx_solve_events_verification ON public.problem_solve_events(verification_status);

DROP TRIGGER IF EXISTS trigger_problem_solve_events_updated_at ON public.problem_solve_events;
CREATE TRIGGER trigger_problem_solve_events_updated_at
BEFORE UPDATE ON public.problem_solve_events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 4. CONTESTS & PARTICIPATIONS
-- ============================================================

-- Check if coding_contests table exists; alter or create cleanly without deleting existing tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coding_contests') THEN
        CREATE TABLE public.coding_contests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider TEXT NOT NULL CHECK (
                provider IN ('leetcode', 'skillrack', 'hackerrank', 'codechef', 'codeforces', 'geeksforgeeks', 'proofhire')
            ),
            external_contest_id TEXT NOT NULL,
            title TEXT NOT NULL,
            contest_url TEXT,
            started_at TIMESTAMPTZ,
            ended_at TIMESTAMPTZ,
            metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_contest_provider_external_id UNIQUE (provider, external_contest_id)
        );
    ELSE
        -- Non-destructively add any missing Phase 1 columns
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS provider TEXT;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS external_contest_id TEXT;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS title TEXT;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS contest_url TEXT;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;
        ALTER TABLE public.coding_contests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coding_contests_provider ON public.coding_contests(provider);
CREATE INDEX IF NOT EXISTS idx_coding_contests_ext_id ON public.coding_contests(external_contest_id);

CREATE TABLE IF NOT EXISTS public.contest_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES public.problem_solving_connections(id) ON DELETE SET NULL,
    contest_id UUID NOT NULL REFERENCES public.coding_contests(id) ON DELETE CASCADE,
    rank INTEGER,
    total_participants INTEGER,
    percentile DOUBLE PRECISION,
    rating_before INTEGER,
    rating_after INTEGER,
    rating_delta INTEGER,
    problems_attempted INTEGER NOT NULL DEFAULT 0,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    xp_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (
        verification_status IN ('provider_verified', 'profile_verified', 'admin_verified', 'user_reported', 'unverified')
    ),
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contest_user_participation UNIQUE (user_id, contest_id)
);

CREATE INDEX IF NOT EXISTS idx_contest_part_user ON public.contest_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_part_contest ON public.contest_participations(contest_id);


-- ============================================================
-- 5. TOPIC PERFORMANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_problem_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    verified_solved_count INTEGER NOT NULL DEFAULT 0,
    easy_count INTEGER NOT NULL DEFAULT 0,
    medium_count INTEGER NOT NULL DEFAULT 0,
    hard_count INTEGER NOT NULL DEFAULT 0,
    expert_count INTEGER NOT NULL DEFAULT 0,
    topic_xp INTEGER NOT NULL DEFAULT 0,
    topic_level INTEGER NOT NULL DEFAULT 1,
    topic_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_topic UNIQUE (user_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_user_problem_topics_user ON public.user_problem_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_topics_topic ON public.user_problem_topics(topic);
CREATE INDEX IF NOT EXISTS idx_user_problem_topics_xp ON public.user_problem_topics(topic_xp DESC);

DROP TRIGGER IF EXISTS trigger_user_problem_topics_updated_at ON public.user_problem_topics;
CREATE TRIGGER trigger_user_problem_topics_updated_at
BEFORE UPDATE ON public.user_problem_topics
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. PROBLEM-SOLVING SUMMARY
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'problem_solving_profiles') THEN
        CREATE TABLE public.problem_solving_profiles (
            user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
            verified_solved_count INTEGER NOT NULL DEFAULT 0,
            easy_solved INTEGER NOT NULL DEFAULT 0,
            medium_solved INTEGER NOT NULL DEFAULT 0,
            hard_solved INTEGER NOT NULL DEFAULT 0,
            expert_solved INTEGER NOT NULL DEFAULT 0,
            problem_solving_xp INTEGER NOT NULL DEFAULT 0,
            problem_solving_level INTEGER NOT NULL DEFAULT 1,
            problem_solving_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
            contest_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
            consistency_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
            breadth_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
            advanced_problem_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
            active_weeks_last_12 INTEGER NOT NULL DEFAULT 0,
            last_activity_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    ELSE
        -- Extend existing table non-destructively
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS verified_solved_count INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS easy_solved INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS medium_solved INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS hard_solved INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS expert_solved INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS problem_solving_xp INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS problem_solving_level INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS contest_score NUMERIC(5,2) NOT NULL DEFAULT 0.00;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS consistency_score NUMERIC(5,2) NOT NULL DEFAULT 0.00;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS breadth_score NUMERIC(5,2) NOT NULL DEFAULT 0.00;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS advanced_problem_score NUMERIC(5,2) NOT NULL DEFAULT 0.00;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS active_weeks_last_12 INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE public.problem_solving_profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ps_profiles_ps_xp ON public.problem_solving_profiles(problem_solving_xp DESC);
CREATE INDEX IF NOT EXISTS idx_ps_profiles_ps_score ON public.problem_solving_profiles(problem_solving_score DESC);
CREATE INDEX IF NOT EXISTS idx_ps_profiles_ps_level ON public.problem_solving_profiles(problem_solving_level DESC);

DROP TRIGGER IF EXISTS trigger_ps_profiles_updated_at ON public.problem_solving_profiles;
CREATE TRIGGER trigger_ps_profiles_updated_at
BEFORE UPDATE ON public.problem_solving_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 7. XP LEDGER (IMMUTABLE & IDEMPOTENT)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (
        source_type IN ('project', 'certificate', 'collaboration', 'assessment', 'problem_solve', 'coding_contest', 'achievement')
    ),
    source_id TEXT NOT NULL,
    category TEXT NOT NULL,
    base_xp INTEGER NOT NULL DEFAULT 0,
    modifier_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    final_xp INTEGER NOT NULL DEFAULT 0,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Strict Idempotency Constraint: A repeated sync must NEVER award XP twice
    CONSTRAINT uq_xp_transaction_idempotency UNIQUE (user_id, source_type, source_id, category)
);

CREATE INDEX IF NOT EXISTS idx_xp_tx_user ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_tx_source ON public.xp_transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_xp_tx_category ON public.xp_transactions(category);
CREATE INDEX IF NOT EXISTS idx_xp_tx_awarded ON public.xp_transactions(awarded_at DESC);


-- ============================================================
-- SECURITY: SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.problem_solving_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_solve_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_solving_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- 1. Platform Connections: Private to the authenticated user
DROP POLICY IF EXISTS "Users can view their own platform connections" ON public.problem_solving_connections;
CREATE POLICY "Users can view their own platform connections"
ON public.problem_solving_connections FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = problem_solving_connections.user_id 
        AND profiles.auth_user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can initiate their own platform connections" ON public.problem_solving_connections;
CREATE POLICY "Users can initiate their own platform connections"
ON public.problem_solving_connections FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = problem_solving_connections.user_id 
        AND profiles.auth_user_id = auth.uid()
    )
    AND verification_status = 'pending'
);

DROP POLICY IF EXISTS "Users can update their connection handle and url" ON public.problem_solving_connections;
CREATE POLICY "Users can update their connection handle and url"
ON public.problem_solving_connections FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = problem_solving_connections.user_id 
        AND profiles.auth_user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = problem_solving_connections.user_id 
        AND profiles.auth_user_id = auth.uid()
    )
);

-- 2. Problem Catalog: Public read, backend management
DROP POLICY IF EXISTS "Problem catalog is viewable by everyone" ON public.problem_catalog;
CREATE POLICY "Problem catalog is viewable by everyone"
ON public.problem_catalog FOR SELECT
USING (true);

-- 3. Problem Solve Events: Public read, user can create pending unverified solves
DROP POLICY IF EXISTS "Problem solve events are viewable by everyone" ON public.problem_solve_events;
CREATE POLICY "Problem solve events are viewable by everyone"
ON public.problem_solve_events FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can submit pending solve events without forging XP" ON public.problem_solve_events;
CREATE POLICY "Users can submit pending solve events without forging XP"
ON public.problem_solve_events FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = problem_solve_events.user_id 
        AND profiles.auth_user_id = auth.uid()
    )
    AND xp_awarded = FALSE
    AND base_xp = 0
    AND skill_xp = 0
    AND overall_xp = 0
    AND verification_status IN ('unverified', 'user_reported')
);

-- 4. Contests & Participations: Public read
DROP POLICY IF EXISTS "Coding contests are viewable by everyone" ON public.coding_contests;
CREATE POLICY "Coding contests are viewable by everyone"
ON public.coding_contests FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Contest participations are viewable by everyone" ON public.contest_participations;
CREATE POLICY "Contest participations are viewable by everyone"
ON public.contest_participations FOR SELECT
USING (true);

-- 5. Topic Performance: Public read, backend calculation only
DROP POLICY IF EXISTS "User problem topics are viewable by everyone" ON public.user_problem_topics;
CREATE POLICY "User problem topics are viewable by everyone"
ON public.user_problem_topics FOR SELECT
USING (true);

-- 6. Problem-Solving Profiles: Public read, backend calculation only
DROP POLICY IF EXISTS "Problem solving profiles are viewable by everyone" ON public.problem_solving_profiles;
CREATE POLICY "Problem solving profiles are viewable by everyone"
ON public.problem_solving_profiles FOR SELECT
USING (true);

-- 7. XP Transactions: Private read for candidate, strictly immutable (no user insert/update)
DROP POLICY IF EXISTS "Users can view their own XP transactions" ON public.xp_transactions;
CREATE POLICY "Users can view their own XP transactions"
ON public.xp_transactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = xp_transactions.user_id 
        AND profiles.auth_user_id = auth.uid()
    )
);

-- Backend Service Role has full access across all tables automatically
