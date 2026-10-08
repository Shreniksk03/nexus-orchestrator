-- =========================================================
-- NEXUS ORCHESTRATOR - PRODUCTION DATABASE SCHEMA (SUPABASE)
-- Multi-Agent Zero-Touch Compliance Analyst
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    contract_text TEXT,
    trust_score INTEGER,
    reputation_summary TEXT,
    overall_reasoning TEXT,
    industry TEXT,
    legal_entity_name TEXT,
    is_alert_triggered BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

-- Agent Logs Table (To store the reasoning chain)
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    agent_name TEXT NOT NULL, -- ROUTER, RESEARCHER, ANALYST, ORCHESTRATOR
    log_message TEXT NOT NULL,
    metadata JSONB
);

-- Flagged Clauses Table
CREATE TABLE IF NOT EXISTS public.flagged_clauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    domain TEXT NOT NULL, -- INFORMATION_SECURITY, FINANCIAL_RISK, LEGAL_LIABILITY, REGULATORY_COMPLIANCE
    severity TEXT NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    clause_text TEXT NOT NULL,
    agent_reasoning TEXT NOT NULL
);

-- App Settings Table (For n8n webhook configuration)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_url TEXT DEFAULT '',
    alert_threshold INTEGER DEFAULT 70,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row if table is empty
INSERT INTO public.app_settings (webhook_url, alert_threshold)
SELECT '', 70
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anonymous/Service role access policies for hackathon and demo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Allow anonymous access') THEN
        CREATE POLICY "Allow anonymous access" ON public.vendors FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agent_logs' AND policyname = 'Allow anonymous access') THEN
        CREATE POLICY "Allow anonymous access" ON public.agent_logs FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'flagged_clauses' AND policyname = 'Allow anonymous access') THEN
        CREATE POLICY "Allow anonymous access" ON public.flagged_clauses FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow anonymous access') THEN
        CREATE POLICY "Allow anonymous access" ON public.app_settings FOR ALL USING (true);
    END IF;
END $$;
