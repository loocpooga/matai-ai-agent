-- Chat logs table for Fin (the website assistant)
-- Run this once in the Supabase SQL Editor.
-- Logging is best-effort: if this table doesn't exist, chat still works.

CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    assistant_message TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs(created_at DESC);

-- Handy view: one row per conversation with message count and last activity
CREATE OR REPLACE VIEW chat_sessions AS
SELECT
    session_id,
    COUNT(*) AS exchanges,
    MIN(created_at) AS started_at,
    MAX(created_at) AS last_activity
FROM chat_logs
GROUP BY session_id
ORDER BY last_activity DESC;
