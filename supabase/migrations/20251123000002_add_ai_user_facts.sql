CREATE TABLE IF NOT EXISTS ai_user_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE ai_user_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own facts" ON ai_user_facts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own facts" ON ai_user_facts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster lookup
CREATE INDEX idx_ai_user_facts_user_id ON ai_user_facts(user_id);
