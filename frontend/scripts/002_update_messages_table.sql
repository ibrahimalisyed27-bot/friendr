-- Add match_id reference to messages table for better organization
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS match_id UUID;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_matches_mutual ON public.matches(is_mutual, user_id, target_user_id);

-- Update RLS policy for messages to include match_id context
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
CREATE POLICY "Users can view messages in their matches" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = match_id 
      AND is_mutual = true 
      AND (user_id = auth.uid() OR target_user_id = auth.uid())
    )
  );

-- Function to get conversation partner
CREATE OR REPLACE FUNCTION get_conversation_partner(match_row public.matches, current_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN match_row.user_id = current_user_id THEN match_row.target_user_id
    ELSE match_row.user_id
  END;
$$;
