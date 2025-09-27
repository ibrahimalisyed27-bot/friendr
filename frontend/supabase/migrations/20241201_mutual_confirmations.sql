-- Create mutual_confirmations table for "Meet in Person" feature
CREATE TABLE IF NOT EXISTS mutual_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mutual_confirmations_user_id ON mutual_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_mutual_confirmations_target_user_id ON mutual_confirmations(target_user_id);

-- Enable RLS
ALTER TABLE mutual_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own confirmations" ON mutual_confirmations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can create confirmations" ON mutual_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own confirmations" ON mutual_confirmations
  FOR DELETE USING (auth.uid() = user_id);
