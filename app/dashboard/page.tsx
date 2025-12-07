import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch coffee entries
  const { data: entries } = await supabase
    .from("coffee_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <DashboardClient user={user} profile={profile} initialEntries={entries || []} />
}
