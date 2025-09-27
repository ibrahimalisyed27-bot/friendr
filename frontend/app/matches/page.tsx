import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MatchesList } from "@/components/matches-list"

export default async function MatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get mutual matches
  const { data: mutualMatches } = await supabase
    .from("matches")
    .select(`
      *,
      target_profile:profiles!matches_target_user_id_fkey(*)
    `)
    .eq("user_id", user.id)
    .eq("is_mutual", true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <MatchesList matches={mutualMatches || []} currentUserId={user.id} />
    </div>
  )
}
