-- Create blocked_users table for user blocking functionality
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable Row Level Security
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their own blocks" ON public.blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert their own blocks" ON public.blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" ON public.blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- Create function to filter out blocked users from potential matches
CREATE OR REPLACE FUNCTION public.get_potential_matches(user_id UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  major TEXT,
  graduation_year INTEGER,
  interests TEXT[],
  profile_photo_url TEXT,
  university TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.bio,
    p.major,
    p.graduation_year,
    p.interests,
    p.profile_photo_url,
    p.university
  FROM public.profiles p
  WHERE p.id != user_id
    AND p.is_verified = true
    -- Exclude users who have already been swiped on
    AND p.id NOT IN (
      SELECT target_user_id 
      FROM public.matches 
      WHERE matches.user_id = user_id
    )
    -- Exclude blocked users (both directions)
    AND p.id NOT IN (
      SELECT blocked_id 
      FROM public.blocked_users 
      WHERE blocker_id = user_id
    )
    AND p.id NOT IN (
      SELECT blocker_id 
      FROM public.blocked_users 
      WHERE blocked_id = user_id
    )
  ORDER BY RANDOM()
  LIMIT 50;
END;
$$;

-- Create function to get mutual matches excluding blocked users
CREATE OR REPLACE FUNCTION public.get_mutual_matches(user_id UUID)
RETURNS TABLE (
  match_id UUID,
  other_user_id UUID,
  first_name TEXT,
  last_name TEXT,
  profile_photo_url TEXT,
  major TEXT,
  graduation_year INTEGER,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    p.id as other_user_id,
    p.first_name,
    p.last_name,
    p.profile_photo_url,
    p.major,
    p.graduation_year,
    latest_msg.content as last_message,
    latest_msg.created_at as last_message_time,
    m.created_at
  FROM public.matches m
  JOIN public.profiles p ON (
    CASE 
      WHEN m.user_id = user_id THEN p.id = m.target_user_id
      ELSE p.id = m.user_id
    END
  )
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM public.messages msg
    WHERE (msg.sender_id = user_id AND msg.receiver_id = p.id)
       OR (msg.sender_id = p.id AND msg.receiver_id = user_id)
    ORDER BY msg.created_at DESC
    LIMIT 1
  ) latest_msg ON true
  WHERE m.is_mutual = true
    AND (m.user_id = user_id OR m.target_user_id = user_id)
    -- Exclude blocked users (both directions)
    AND p.id NOT IN (
      SELECT blocked_id 
      FROM public.blocked_users 
      WHERE blocker_id = user_id
    )
    AND p.id NOT IN (
      SELECT blocker_id 
      FROM public.blocked_users 
      WHERE blocked_id = user_id
    )
  ORDER BY COALESCE(latest_msg.created_at, m.created_at) DESC;
END;
$$;
