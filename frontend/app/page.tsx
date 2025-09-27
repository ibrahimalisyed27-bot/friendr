import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Homepage: User authenticated:', !!user)

  if (user) {
    console.log('Homepage: Redirecting authenticated user to dashboard')
    redirect("/dashboard")
  } else {
    console.log('Homepage: Redirecting unauthenticated user to login')
    redirect("/auth/login")
  }
}
