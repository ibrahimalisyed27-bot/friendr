import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat-interface"

interface ChatPageProps {
  params: Promise<{ matchId: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { matchId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get the match details and verify user has access
  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      target_profile:profiles!matches_target_user_id_fkey(*),
      user_profile:profiles!matches_user_id_fkey(*)
    `)
    .eq("id", matchId)
    .eq("is_mutual", true)
    .single()

  if (!match || (match.user_id !== user.id && match.target_user_id !== user.id)) {
    redirect("/matches")
  }

  // Determine the other user in the conversation
  const otherUser = match.user_id === user.id ? match.target_profile : match.user_profile
  const currentUserProfile = match.user_id === user.id ? match.user_profile : match.target_profile

  // Get existing messages
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(first_name, last_name, profile_photo_url)
    `)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })

  return (
    <div className="h-screen bg-background">
      <ChatInterface
        matchId={matchId}
        currentUser={currentUserProfile}
        otherUser={otherUser}
        initialMessages={messages || []}
      />
    </div>
  )
}
