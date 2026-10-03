-- ==============================================================================
-- CodeSage Supabase Database Schema: User Repository History
-- ==============================================================================
-- Paste and run this script in your Supabase Dashboard:
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 1. Create the user_repo_history table
-- Enforces composite primary key on (user_id, repository_id) to eliminate cross-user probing and namespace collision (CWE-203 mitigation).
CREATE TABLE IF NOT EXISTS public.user_repo_history (
    user_id TEXT NOT NULL,                            -- Authenticated User ID (Supabase Auth UID or Local Dev ID)
    repository_id TEXT NOT NULL,                      -- Normalized repository ID
    id TEXT,                                          -- Optional legacy synthetic key
    name TEXT NOT NULL,                               -- "owner/repo" display string
    owner TEXT NOT NULL,                              -- Repository owner
    repo TEXT NOT NULL,                               -- Repository name
    url TEXT,                                         -- Full Git / GitHub URL
    primary_lang TEXT DEFAULT 'Code',                 -- Primary language
    files_count INTEGER DEFAULT 0,                    -- Total files parsed
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),            -- Last analyzed timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),             -- Initial record timestamp
    PRIMARY KEY (user_id, repository_id)
);

-- Migration check for existing installations: ensure composite unique constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_repo_history'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = 'public' 
              AND table_name = 'user_repo_history'
              AND constraint_name = 'user_repo_history_user_repo_unique'
        ) THEN
            BEGIN
                ALTER TABLE public.user_repo_history ADD CONSTRAINT user_repo_history_user_repo_unique UNIQUE (user_id, repository_id);
            EXCEPTION WHEN OTHERS THEN
                -- Constraint or primary key already satisfies uniqueness
                NULL;
            END;
        END IF;
    END IF;
END $$;

-- 2. Create High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_user_repo_history_user_analyzed 
    ON public.user_repo_history (user_id, analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_repo_history_repo_id 
    ON public.user_repo_history (repository_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_repo_history ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies with User Identity Verification
-- Ensures authenticated clients can only read their own analyzed repositories
CREATE POLICY "Allow select on user_repo_history"
    ON public.user_repo_history
    FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
        OR (auth.jwt() ->> 'sub' = user_id)
    );

-- Ensures clients can only insert repositories matching their verified identity
CREATE POLICY "Allow insert on user_repo_history"
    ON public.user_repo_history
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
        OR (auth.jwt() ->> 'sub' = user_id)
    );

-- Ensures clients can only update their own records
CREATE POLICY "Allow update on user_repo_history"
    ON public.user_repo_history
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
        OR (auth.jwt() ->> 'sub' = user_id)
    )
    WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
        OR (auth.jwt() ->> 'sub' = user_id)
    );

-- Ensures clients can only delete their own records
CREATE POLICY "Allow delete on user_repo_history"
    ON public.user_repo_history
    FOR DELETE
    USING (
        (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
        OR (auth.jwt() ->> 'sub' = user_id)
    );

