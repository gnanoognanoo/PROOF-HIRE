-- ============================================================
-- ProofHire Database Migration (Supabase PostgreSQL + pgvector)
-- Migration: 20250101_init_schema.sql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum for ProofHire grade tiers
DO $$ BEGIN
    CREATE TYPE grade_tier AS ENUM ('O', 'A', 'B', 'C', 'D', 'E');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    title VARCHAR(128) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    level INT NOT NULL DEFAULT 1,
    total_xp INT NOT NULL DEFAULT 0,
    ai_quality_index NUMERIC(5,2) DEFAULT 0.00,
    verified_repos_count INT DEFAULT 0,
    github_username VARCHAR(128),
    polygon_wallet_address VARCHAR(66),
    location VARCHAR(128),
    availability VARCHAR(64) DEFAULT 'Passive / Exploring',
    is_identity_verified BOOLEAN DEFAULT FALSE,
    embedding vector(1536), -- For LlamaIndex semantic candidate matching
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    primary_stack TEXT[] DEFAULT '{}',
    grade grade_tier NOT NULL DEFAULT 'B',
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    architecture_score NUMERIC(5,2) DEFAULT 0.00,
    test_coverage NUMERIC(5,2) DEFAULT 0.00,
    code_quality NUMERIC(5,2) DEFAULT 0.00,
    doc_clarity NUMERIC(5,2) DEFAULT 0.00,
    sha256_hash CHAR(64) NOT NULL,
    polygon_tx_hash VARCHAR(66),
    merkle_root VARCHAR(66),
    commit_count INT DEFAULT 0,
    loc_count INT DEFAULT 0,
    gemini_review_note TEXT,
    evaluation_cycle_id VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Contributor Attributions Table
CREATE TABLE IF NOT EXISTS public.contributor_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    contributor_name VARCHAR(128) NOT NULL,
    github_handle VARCHAR(128) NOT NULL,
    role_description VARCHAR(128),
    lines_of_code INT NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_verified_gpg BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Skill Matrix Table
CREATE TABLE IF NOT EXISTS public.skill_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(64) NOT NULL,
    grade grade_tier NOT NULL DEFAULT 'B',
    score INT NOT NULL DEFAULT 75,
    xp INT NOT NULL DEFAULT 500,
    verified_project_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    benchmark_name VARCHAR(128) NOT NULL,
    tier VARCHAR(32) NOT NULL,
    score NUMERIC(5,2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'COMPLETED',
    test_cases_passed INT DEFAULT 0,
    test_cases_total INT DEFAULT 0,
    jitsi_room_id VARCHAR(128),
    polygon_attestation_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Recruiter Inquiries & Invites
CREATE TABLE IF NOT EXISTS public.recruiter_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(128) NOT NULL,
    role_title VARCHAR(128) NOT NULL,
    salary_band VARCHAR(64),
    status VARCHAR(32) DEFAULT 'PENDING',
    jitsi_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_projects_grade ON public.projects(grade);
CREATE INDEX IF NOT EXISTS idx_projects_profile ON public.projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_profile ON public.skill_matrix(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skill_matrix(skill_name);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributor_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_inquiries ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public skills are viewable by everyone" ON public.skill_matrix FOR SELECT USING (true);
CREATE POLICY "Public attributions are viewable by everyone" ON public.contributor_attributions FOR SELECT USING (true);
