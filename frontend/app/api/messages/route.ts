import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, receiverId, matchId } = await request.json()

    if (!content || !receiverId || !matchId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the match exists and user has access
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .eq("is_mutual", true)
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)
      .single()

    if (!match) {
      return NextResponse.json({ error: "Match not found or access denied" }, { status: 403 })
    }

    // Insert the message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        content: content.trim(),
        sender_id: user.id,
        receiver_id: receiverId,
        match_id: matchId,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("matchId")
    const otherUserId = searchParams.get("otherUserId")

    if (!matchId || !otherUserId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get messages for this conversation
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(first_name, last_name, profile_photo_url)
      `)
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
