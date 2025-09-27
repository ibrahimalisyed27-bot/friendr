import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SwipeInterface } from "@/components/enhanced-swipe-interface"

export default async function SwipePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user profile is complete
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/profile/setup")
  }

  // Get potential matches (users they haven't swiped on yet)
  const { data: alreadySwiped } = await supabase.from("matches").select("target_user_id").eq("user_id", user.id)

  const swipedUserIds = alreadySwiped?.map((match) => match.target_user_id) || []

  const { data: potentialMatches } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", user.id)
    .not("id", "in", `(${swipedUserIds.length > 0 ? swipedUserIds.join(",") : "''"}`)
    .limit(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SwipeInterface currentUser={profile} potentialMatches={potentialMatches || []} />
    </div>
  )
}
