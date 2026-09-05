-- ============================================================
-- ProofHire Phase 2 Database Migration
-- Migration: 20250102_phase2_schema.sql
-- Description: Production-grade schema covering 22 tables, 
-- foreign keys, indexes, triggers, and Row Level Security (RLS).
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enumerations
DO $$ BEGIN
    CREATE TYPE account_role AS ENUM ('developer', 'student', 'recruiter', 'institution');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE grade_tier AS ENUM ('O', 'A', 'B', 'C', 'D', 'E');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('in_progress', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE visibility_status AS ENUM ('public', 'private', 'recruiter_only');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'staff', 'principal');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'assessment_sent', 'interview_scheduled', 'offered', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE assessment_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Utility Function: Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Table 1: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(128),
    role account_role NOT NULL DEFAULT 'developer',
    university VARCHAR(128),
    graduation_year INT,
    website_url TEXT,
    github_username VARCHAR(128),
    linkedin_url TEXT,
    total_xp INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    overall_grade grade_tier NOT NULL DEFAULT 'B',
    collaboration_score NUMERIC(5,2) DEFAULT 100.00,
    profile_completion INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON public.profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level DESC);

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Table 2: skills
-- ============================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- ============================================================
-- Table 3: user_skills
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    xp INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    verification_strength NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_score ON public.user_skills(score DESC);

DROP TRIGGER IF EXISTS trigger_user_skills_updated_at ON public.user_skills;
CREATE TRIGGER trigger_user_skills_updated_at
BEFORE UPDATE ON public.user_skills
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Table 4: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    repository_url TEXT NOT NULL,
    demo_url TEXT,
    thumbnail_url TEXT,
    status project_status NOT NULL DEFAULT 'completed',
    visibility visibility_status NOT NULL DEFAULT 'public',
    grade grade_tier NOT NULL DEFAULT 'B',
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    xp_awarded INT NOT NULL DEFAULT 0,
    verification_status verification_status NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_grade ON public.projects(grade);
CREATE INDEX IF NOT EXISTS idx_projects_score ON public.projects(score DESC);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON public.projects(visibility);

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Table 5: project_skills
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_skills (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    confidence NUMERIC(5,2) NOT NULL DEFAULT 0.90,
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (project_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_project_skills_project ON public.project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill ON public.project_skills(skill_id);

-- ============================================================
-- Table 6: project_members
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL DEFAULT 'contributor',
    contribution_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    contribution_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    xp_awarded INT NOT NULL DEFAULT 0,
    UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

-- ============================================================
-- Table 7: certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    issuer VARCHAR(128) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id VARCHAR(128),
    credential_url TEXT,
    file_url TEXT,
    verification_status verification_status NOT NULL DEFAULT 'verified',
    blockchain_credential_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issuer ON public.certificates(issuer);

-- ============================================================
-- Table 8: badges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) UNIQUE NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'gold',
    icon_name VARCHAR(64) NOT NULL,
    criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_badges_slug ON public.badges(slug);
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);

-- ============================================================
-- Table 9: user_badges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);

-- ============================================================
-- Table 10: collaborations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    repository_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collaborations_creator ON public.collaborations(created_by);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON public.collaborations(status);

-- ============================================================
-- Table 11: collaboration_members
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collaboration_members (
    collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL DEFAULT 'contributor',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collaboration_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collab_members_user ON public.collaboration_members(user_id);

-- ============================================================
-- Table 12: companies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    industry VARCHAR(64),
    size VARCHAR(32),
    verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verified);

-- ============================================================
-- Table 13: recruiters
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    position VARCHAR(128) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recruiters_user ON public.recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_company ON public.recruiters(company_id);

-- ============================================================
-- Table 14: jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(128) NOT NULL,
    employment_type employment_type NOT NULL DEFAULT 'full_time',
    experience_level experience_level NOT NULL DEFAULT 'senior',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

-- ============================================================
-- Table 15: job_skills
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_skills (
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    minimum_level INT NOT NULL DEFAULT 1,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    PRIMARY KEY (job_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job ON public.job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON public.job_skills(skill_id);

-- ============================================================
-- Table 16: applications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status application_status NOT NULL DEFAULT 'submitted',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- ============================================================
-- Table 17: assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    status assessment_status NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_assessments_recruiter ON public.assessments(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_assessments_job ON public.assessments(job_id);

-- ============================================================
-- Table 18: assessment_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL DEFAULT 'mcq',
    question TEXT NOT NULL,
    options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON public.assessment_questions(assessment_id);

-- ============================================================
-- Table 19: assessment_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress'
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment ON public.assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_candidate ON public.assessment_attempts(candidate_id);

-- ============================================================
-- Table 20: interviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    meeting_url TEXT NOT NULL,
    status interview_status NOT NULL DEFAULT 'scheduled'
);

CREATE INDEX IF NOT EXISTS idx_interviews_recruiter ON public.interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON public.interviews(scheduled_at);

-- ============================================================
-- Table 21: credentials
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    credential_identifier VARCHAR(128) UNIQUE NOT NULL,
    document_hash CHAR(64) NOT NULL,
    blockchain_tx_hash VARCHAR(66),
    blockchain_network VARCHAR(64) NOT NULL DEFAULT 'Polygon PoS Mainnet',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status verification_status NOT NULL DEFAULT 'verified'
);

CREATE INDEX IF NOT EXISTS idx_credentials_user ON public.credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_identifier ON public.credentials(credential_identifier);
CREATE INDEX IF NOT EXISTS idx_credentials_hash ON public.credentials(document_hash);

-- ============================================================
-- Table 22: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    data_json JSONB DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read_at);

-- ============================================================
-- Automatic User Profile Generation Trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        auth_user_id,
        username,
        full_name,
        avatar_url,
        role,
        profile_completion
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Member'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'),
        COALESCE((NEW.raw_user_meta_data->>'role')::account_role, 'developer'),
        20
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_user_id);

-- Skills & Badges: Public read, admin manage
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User skills & badges: Public read, owner manage
CREATE POLICY "User skills are viewable by everyone" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their skills" ON public.user_skills FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = user_skills.user_id AND profiles.auth_user_id = auth.uid())
);

CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);

-- Projects: Visibility-dependent read, owner manage
CREATE POLICY "Projects are viewable based on visibility" ON public.projects FOR SELECT USING (
    visibility = 'public' OR 
    (visibility = 'recruiter_only' AND EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role = 'recruiter')) OR
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = projects.owner_id AND auth_user_id = auth.uid()))
);
CREATE POLICY "Owners can manage projects" ON public.projects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = projects.owner_id AND auth_user_id = auth.uid())
);

-- Project skills & members
CREATE POLICY "Project skills are viewable by everyone" ON public.project_skills FOR SELECT USING (true);
CREATE POLICY "Project members are viewable by everyone" ON public.project_members FOR SELECT USING (true);

-- Certificates: Public read, owner manage
CREATE POLICY "Certificates are viewable by everyone" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users can manage certificates" ON public.certificates FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = certificates.user_id AND auth_user_id = auth.uid())
);

-- Collaborations: Public read, members/creator manage
CREATE POLICY "Collaborations are viewable by everyone" ON public.collaborations FOR SELECT USING (true);
CREATE POLICY "Collaboration members viewable by everyone" ON public.collaboration_members FOR SELECT USING (true);

-- Companies & Jobs: Public read
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Recruiters are viewable by everyone" ON public.recruiters FOR SELECT USING (true);
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Job skills are viewable by everyone" ON public.job_skills FOR SELECT USING (true);

-- Applications: Candidate & Recruiter access
CREATE POLICY "Candidates can view their applications" ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = applications.candidate_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Recruiters can view applications to their jobs" ON public.applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.jobs 
        JOIN public.recruiters ON recruiters.id = jobs.recruiter_id 
        JOIN public.profiles ON profiles.id = recruiters.user_id 
        WHERE jobs.id = applications.job_id AND profiles.auth_user_id = auth.uid()
    )
);

-- Assessments & Attempts
CREATE POLICY "Assessments are viewable by candidates and recruiters" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Assessment questions viewable by authenticated" ON public.assessment_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Candidates can view their assessment attempts" ON public.assessment_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = assessment_attempts.candidate_id AND auth_user_id = auth.uid())
);

-- Interviews
CREATE POLICY "Interviews viewable by participants" ON public.interviews FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = interviews.candidate_id AND auth_user_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.recruiters 
        JOIN public.profiles ON profiles.id = recruiters.user_id 
        WHERE recruiters.id = interviews.recruiter_id AND profiles.auth_user_id = auth.uid()
    )
);

-- Credentials: Cryptographic public read
CREATE POLICY "Credentials are viewable by everyone" ON public.credentials FOR SELECT USING (true);

-- Notifications: Strictly private to user
CREATE POLICY "Users can only view their own notifications" ON public.notifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = notifications.user_id AND auth_user_id = auth.uid())
);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = notifications.user_id AND auth_user_id = auth.uid())
);
