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
    const { reported_user_id, reason, description } = body

    if (!reported_user_id || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert the report
    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: user.id,
        reported_user_id,
        reason,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating report:", error)
      return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
    }

    return NextResponse.json({ success: true, report: data })
  } catch (error) {
    console.error("Error in reports API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
