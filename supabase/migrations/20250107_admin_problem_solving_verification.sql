-- ============================================================
-- ProofHire Phase 13: Admin Problem-Solving Verification
-- Migration: 20250107_admin_problem_solving_verification.sql
-- Description: Complete data model for admin verification queue,
--              suspicious activity flags, duplicate detection clusters,
--              and immutable audit logging for administrative actions.
-- ============================================================

-- Ensure uuid & pgcrypto extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ADMIN AUDIT LEDGER (IMMUTABLE)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.problem_solving_admin_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    admin_name TEXT NOT NULL DEFAULT 'System Administrator',
    action TEXT NOT NULL CHECK (
        action IN ('APPROVE', 'REJECT', 'MARK_DUPLICATE', 'REQUEST_EVIDENCE', 'FLAG_SUSPICIOUS', 'RETRY_SYNC')
    ),
    target_type TEXT NOT NULL CHECK (
        target_type IN ('solve_event', 'platform_connection', 'import_batch', 'duplicate_cluster', 'sync_error')
    ),
    target_id TEXT NOT NULL,
    candidate_username TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    evidence_reviewed JSONB NOT NULL DEFAULT '{}'::jsonb,
    deterministic_skill_xp INTEGER NOT NULL DEFAULT 0,
    deterministic_overall_xp INTEGER NOT NULL DEFAULT 0,
    reputation_ratio DOUBLE PRECISION NOT NULL DEFAULT 0.90,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ps_admin_audits_admin ON public.problem_solving_admin_audits(admin_id);
CREATE INDEX IF NOT EXISTS idx_ps_admin_audits_target ON public.problem_solving_admin_audits(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_ps_admin_audits_candidate ON public.problem_solving_admin_audits(candidate_username);
CREATE INDEX IF NOT EXISTS idx_ps_admin_audits_action ON public.problem_solving_admin_audits(action);
CREATE INDEX IF NOT EXISTS idx_ps_admin_audits_created ON public.problem_solving_admin_audits(created_at DESC);


-- ============================================================
-- 2. VERIFICATION QUEUE & FLAG REGISTRY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.problem_solving_verification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL CHECK (
        section IN ('pending_imports', 'suspicious_activity', 'failed_verification', 'duplicate_detection', 'provider_sync_errors')
    ),
    candidate_username TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (
        provider IN ('leetcode', 'skillrack', 'hackerrank', 'codechef', 'codeforces', 'geeksforgeeks', 'proofhire')
    ),
    problem_title TEXT NOT NULL,
    problem_slug TEXT,
    external_problem_id TEXT,
    difficulty TEXT NOT NULL CHECK (
        difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT', 'UNKNOWN')
    ),
    topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_code TEXT,
    source_code_hash TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (
        status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DUPLICATE', 'MORE_EVIDENCE_REQUESTED', 'RESOLVED')
    ),
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (
        severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    ),
    evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    duplicate_of_id TEXT,
    admin_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ps_queue_section ON public.problem_solving_verification_queue(section);
CREATE INDEX IF NOT EXISTS idx_ps_queue_status ON public.problem_solving_verification_queue(status);
CREATE INDEX IF NOT EXISTS idx_ps_queue_severity ON public.problem_solving_verification_queue(severity);
CREATE INDEX IF NOT EXISTS idx_ps_queue_candidate ON public.problem_solving_verification_queue(candidate_username);
CREATE INDEX IF NOT EXISTS idx_ps_queue_provider ON public.problem_solving_verification_queue(provider);

DROP TRIGGER IF EXISTS trigger_ps_queue_updated_at ON public.problem_solving_verification_queue;
CREATE TRIGGER trigger_ps_queue_updated_at
BEFORE UPDATE ON public.problem_solving_verification_queue
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
