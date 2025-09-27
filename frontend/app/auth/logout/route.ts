import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Sign out the user
  await supabase.auth.signOut()
  
  // Redirect to login page
  return NextResponse.redirect(new URL("/auth/login", request.url))
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Sign out the user
  await supabase.auth.signOut()
  
  // Redirect to login page
  return NextResponse.redirect(new URL("/auth/login", request.url))
}

