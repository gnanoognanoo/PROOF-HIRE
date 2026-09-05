-- Migration: 20250105_recruiter_problem_solving_matching.sql
-- Phase 11: Add problem solving fields to jobs table for recruiter matching

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS requires_problem_solving BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS minimum_problem_solving_score NUMERIC(5,2) NULL,
ADD COLUMN IF NOT EXISTS problem_solving_weight NUMERIC(5,2) NULL DEFAULT 0.10;

-- Index for problem solving job filtering
CREATE INDEX IF NOT EXISTS idx_jobs_requires_problem_solving ON public.jobs(requires_problem_solving);
CREATE INDEX IF NOT EXISTS idx_jobs_min_problem_solving_score ON public.jobs(minimum_problem_solving_score);
