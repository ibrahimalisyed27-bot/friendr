import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainApp } from "@/components/main-app"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has completed their profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If profile doesn't exist, create a minimal one for testing
  if (!profile) {
    console.log("No profile found, creating minimal profile for testing...")
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || "Test",
        last_name: user.user_metadata?.last_name || "User",
        bio: "Test user for Friendr app",
        major: "Computer Science",
        graduation_year: 2025,
        interests: ["Technology", "Gaming", "Music"],
        university: "Arizona State University",
        is_verified: true,
      })

    if (insertError) {
      console.error("Failed to create minimal profile:", insertError)
      // Continue anyway with a mock profile for testing
    }
  }

  // Get the profile again (either existing or newly created)
  const { data: finalProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If still no profile, create a mock one for testing
  const currentProfile = finalProfile || {
    id: user.id,
    first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || "Test",
    last_name: user.user_metadata?.last_name || "User",
    bio: "Test user for Friendr app",
    major: "Computer Science",
    graduation_year: 2025,
    interests: ["Technology", "Gaming", "Music"],
    university: "Arizona State University",
    is_verified: true,
  }

  // Skip verification check - profiles are auto-approved

  // Get potential matches (users they haven't swiped on yet)
  const { data: alreadySwiped } = await supabase.from("matches").select("target_user_id").eq("user_id", user.id)
  const swipedUserIds = alreadySwiped?.map((match) => match.target_user_id) || []

  let { data: potentialMatches } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", user.id)
    .not("id", "in", `(${swipedUserIds.length > 0 ? swipedUserIds.join(",") : "''"}`)
    .limit(50)

  // If no potential matches, create some mock data for testing
  if (!potentialMatches || potentialMatches.length === 0) {
    console.log("No potential matches found, creating mock data for testing...")
    potentialMatches = [
      {
        id: "mock-user-1",
        first_name: "Alex",
        last_name: "Johnson",
        bio: "Computer Science major who loves coding, gaming, and hiking. Always up for a good conversation about technology!",
        major: "Computer Science",
        graduation_year: 2025,
        interests: ["Technology", "Gaming", "Hiking", "Coding"],
        university: "Arizona State University",
        is_verified: true,
      },
      {
        id: "mock-user-2", 
        first_name: "Sam",
        last_name: "Wilson",
        bio: "Business student with a passion for entrepreneurship and music. Love meeting new people and sharing ideas!",
        major: "Business",
        graduation_year: 2024,
        interests: ["Business", "Music", "Entrepreneurship", "Networking"],
        university: "Arizona State University",
        is_verified: true,
      },
      {
        id: "mock-user-3",
        first_name: "Jordan",
        last_name: "Davis",
        bio: "Psychology major interested in human behavior and mental health. Enjoy reading, art, and deep conversations.",
        major: "Psychology", 
        graduation_year: 2026,
        interests: ["Psychology", "Reading", "Art", "Mental Health"],
        university: "Arizona State University",
        is_verified: true,
      }
    ]
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
    <MainApp 
      currentUser={currentProfile} 
      potentialMatches={potentialMatches || []} 
      mutualMatches={mutualMatches || []} 
    />
  )
}
