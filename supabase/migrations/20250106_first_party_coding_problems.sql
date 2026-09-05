-- ============================================================
-- ProofHire Phase 12: First-Party ProofHire Problem Solving
-- Migration: 20250106_first_party_coding_problems.sql
-- Description: Schema for first-party coding challenges,
--              confidential hidden test cases, examples,
--              constraints, and sandbox execution submissions.
-- ============================================================

-- Ensure uuid & pgcrypto extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1. FIRST-PARTY CODING PROBLEMS CATALOG
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.first_party_coding_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    constraints JSONB NOT NULL DEFAULT '[]'::jsonb,
    examples JSONB NOT NULL DEFAULT '[]'::jsonb,
    hidden_test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    time_limit DOUBLE PRECISION NOT NULL DEFAULT 2.0, -- seconds
    memory_limit INT NOT NULL DEFAULT 256, -- megabytes
    starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    solution_template JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fpc_slug ON public.first_party_coding_problems(slug);
CREATE INDEX IF NOT EXISTS idx_fpc_difficulty ON public.first_party_coding_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_fpc_is_active ON public.first_party_coding_problems(is_active);

DROP TRIGGER IF EXISTS trigger_fpc_updated_at ON public.first_party_coding_problems;
CREATE TRIGGER trigger_fpc_updated_at
BEFORE UPDATE ON public.first_party_coding_problems
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 2. FIRST-PARTY CODING SUBMISSIONS & EXECUTION AUDIT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.first_party_coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.first_party_coding_problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    execution_status TEXT NOT NULL DEFAULT 'NOT_CONFIGURED' CHECK (
        execution_status IN (
            'NOT_CONFIGURED',
            'PENDING',
            'RUNNING',
            'ACCEPTED',
            'WRONG_ANSWER',
            'TIME_LIMIT_EXCEEDED',
            'MEMORY_LIMIT_EXCEEDED',
            'COMPILATION_ERROR',
            'RUNTIME_ERROR'
        )
    ),
    tests_passed INT NOT NULL DEFAULT 0,
    total_tests INT NOT NULL DEFAULT 0,
    runtime_ms DOUBLE PRECISION,
    memory_kb INT,
    ai_quality_score DOUBLE PRECISION,
    xp_awarded INT NOT NULL DEFAULT 0,
    compile_output TEXT,
    audit_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fpcs_problem_id ON public.first_party_coding_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_fpcs_user_id ON public.first_party_coding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_fpcs_status ON public.first_party_coding_submissions(execution_status);
CREATE INDEX IF NOT EXISTS idx_fpcs_created_at ON public.first_party_coding_submissions(created_at DESC);

DROP TRIGGER IF EXISTS trigger_fpcs_updated_at ON public.first_party_coding_submissions;
CREATE TRIGGER trigger_fpcs_updated_at
BEFORE UPDATE ON public.first_party_coding_submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
