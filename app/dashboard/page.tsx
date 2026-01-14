import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Coffee } from "lucide-react"
import DashboardClient from "@/components/dashboard-client"
import { Suspense } from "react"
import { User } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const typedUser = user as User

  // Fetch coffee entries
  const { data: entries } = await supabase
    .from("coffee_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Loading your dashboard...</p>
        </div>
      </div>
    }>
      <DashboardClient
        user={typedUser}
        initialTasks={entries || []}
      />
    </Suspense>
  )
}
