import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { blocked_user_id } = body

    if (!blocked_user_id) {
      return NextResponse.json({ error: "Missing blocked_user_id" }, { status: 400 })
    }

    // Insert the block
    const { error: blockError } = await supabase.from("blocked_users").insert({
      blocker_id: user.id,
      blocked_id: blocked_user_id,
    })

    if (blockError) {
      console.error("Error blocking user:", blockError)
      return NextResponse.json({ error: "Failed to block user" }, { status: 500 })
    }

    // Remove any existing matches between the users
    const { error: matchError } = await supabase
      .from("matches")
      .delete()
      .or(
        `and(user_id.eq.${user.id},target_user_id.eq.${blocked_user_id}),and(user_id.eq.${blocked_user_id},target_user_id.eq.${user.id})`,
      )

    if (matchError) {
      console.error("Error removing matches:", matchError)
      // Don't return error here as the block was successful
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in block API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
