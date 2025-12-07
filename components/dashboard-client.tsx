"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coffee, LogOut, Play, Pause, Trash2, Clock, Calendar, TrendingUp, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

type CoffeeEntry = {
  id: string
  user_id: string
  task_name: string
  category: string
  duration: number
  status: string
  start_time: string | null
  end_time: string | null
  created_at: string
  updated_at: string
}

type DashboardClientProps = {
  user: User
  profile: Profile | null
  initialEntries: CoffeeEntry[]
}

export default function DashboardClient({ user, profile, initialEntries }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [entries, setEntries] = useState<CoffeeEntry[]>(initialEntries)
  const [taskName, setTaskName] = useState("")
  const [category, setCategory] = useState("Work")
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tracking")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const addTask = async () => {
    if (!taskName.trim()) return

    const { data, error } = await supabase
      .from("coffee_entries")
      .insert({
        user_id: user.id,
        task_name: taskName,
        category,
        duration: 0,
        status: "stopped",
      })
      .select()
      .single()

    if (!error && data) {
      setEntries([data, ...entries])
      setTaskName("")
    }
  }

  const startTask = async (taskId: string) => {
    if (activeTaskId) {
      await stopTask(activeTaskId)
    }

    const { error } = await supabase
      .from("coffee_entries")
      .update({
        status: "running",
        start_time: new Date().toISOString(),
      })
      .eq("id", taskId)

    if (!error) {
      setActiveTaskId(taskId)
      setEntries(
        entries.map((entry) =>
          entry.id === taskId ? { ...entry, status: "running", start_time: new Date().toISOString() } : entry,
        ),
      )

      intervalRef.current = setInterval(() => {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === taskId && entry.status === "running" ? { ...entry, duration: entry.duration + 1 } : entry,
          ),
        )
      }, 1000)
    }
  }

  const stopTask = async (taskId: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const entry = entries.find((e) => e.id === taskId)
    if (!entry) return

    const { error } = await supabase
      .from("coffee_entries")
      .update({
        status: "stopped",
        end_time: new Date().toISOString(),
        duration: entry.duration,
      })
      .eq("id", taskId)

    if (!error) {
      setActiveTaskId(null)
      setEntries(
        entries.map((e) => (e.id === taskId ? { ...e, status: "stopped", end_time: new Date().toISOString() } : e)),
      )
    }
  }

  const deleteTask = async (taskId: string) => {
    if (activeTaskId === taskId) {
      await stopTask(taskId)
    }

    const { error } = await supabase.from("coffee_entries").delete().eq("id", taskId)

    if (!error) {
      setEntries(entries.filter((e) => e.id !== taskId))
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const todayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.created_at).toDateString()
    const today = new Date().toDateString()
    return entryDate === today
  })

  const totalToday = todayEntries.reduce((sum, entry) => sum + entry.duration, 0)

  // Analytics calculations
  const categoryData = entries.reduce(
    (acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.duration
      return acc
    },
    {} as Record<string, number>,
  )

  const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Coffee className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Coffee Time Tracker</h1>
            </div>
            <div className="flex items-center gap-4">
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.display_name || "User"}
                  className="w-10 h-10 rounded-full border-2 border-amber-300 shadow-md"
                />
              )}
              <span className="hidden sm:inline font-medium">{profile?.display_name || user.email}</span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="hover:bg-white/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-[72px] z-40 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("tracking")}
              className={`py-4 px-6 font-semibold transition-all border-b-4 rounded-t-lg ${
                activeTab === "tracking"
                  ? "border-amber-600 text-amber-900 bg-amber-50"
                  : "border-transparent text-stone-600 hover:text-amber-800 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Time Tracking</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-6 font-semibold transition-all border-b-4 rounded-t-lg ${
                activeTab === "analytics"
                  ? "border-amber-600 text-amber-900 bg-amber-50"
                  : "border-transparent text-stone-600 hover:text-amber-800 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "tracking" ? (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium mb-1">Today's Total</p>
                    <p className="text-4xl font-bold text-amber-900 tracking-tight">{formatDuration(totalToday)}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-2xl">
                    <Clock className="w-8 h-8 text-amber-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium mb-1">Active Tasks</p>
                    <p className="text-4xl font-bold text-orange-900 tracking-tight">
                      {todayEntries.filter((t) => t.status === "running").length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-2xl">
                    <Play className="w-8 h-8 text-orange-700" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-stone-200 bg-gradient-to-br from-white to-stone-50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-stone-600 text-sm font-medium mb-1">Tasks Today</p>
                    <p className="text-4xl font-bold text-stone-900 tracking-tight">{todayEntries.length}</p>
                  </div>
                  <div className="p-3 bg-stone-100 rounded-2xl">
                    <Calendar className="w-8 h-8 text-stone-700" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Add Task Form */}
            <Card className="p-6 border-2 border-stone-200 shadow-lg">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-amber-600" />
                Add New Task
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="task-name" className="text-sm font-medium mb-2 block">
                    Task Name
                  </Label>
                  <Input
                    id="task-name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    placeholder="What are you working on?"
                    className="h-12 border-2 border-stone-300 focus:border-amber-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 border-2 border-stone-300 focus:border-amber-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Exercise">Exercise</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={addTask}
                className="mt-4 w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all"
              >
                Add Task
              </Button>
            </Card>

            {/* Task List */}
            <Card className="p-6 border-2 border-stone-200 shadow-lg">
              <h2 className="text-2xl font-bold text-stone-900 mb-6">Today's Tasks</h2>
              {todayEntries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-100 mb-4">
                    <Coffee className="w-10 h-10 text-stone-400" />
                  </div>
                  <p className="text-stone-500 text-lg">No tasks yet. Start tracking your time!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-5 rounded-2xl border-2 transition-all ${
                        entry.status === "running"
                          ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg"
                          : "border-stone-200 bg-white hover:border-amber-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-stone-900">{entry.task_name}</h3>
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                              {entry.category}
                            </span>
                          </div>
                          <p className="text-3xl font-mono font-bold text-amber-900 tracking-tight">
                            {formatDuration(entry.duration)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.status === "running" ? (
                            <Button
                              onClick={() => stopTask(entry.id)}
                              size="lg"
                              className="h-12 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md"
                            >
                              <Pause className="w-5 h-5 mr-2" />
                              Stop
                            </Button>
                          ) : (
                            <Button
                              onClick={() => startTask(entry.id)}
                              size="lg"
                              className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md"
                            >
                              <Play className="w-5 h-5 mr-2" />
                              Start
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteTask(entry.id)}
                            size="lg"
                            variant="outline"
                            className="h-12 px-4 border-2 border-stone-300 hover:border-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-5 h-5 text-stone-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Analytics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 shadow-lg">
                <p className="text-stone-600 text-sm font-medium mb-1">Total Time</p>
                <p className="text-3xl font-bold text-amber-900">{(totalTime / 3600).toFixed(1)}h</p>
              </Card>

              <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50 shadow-lg">
                <p className="text-stone-600 text-sm font-medium mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-orange-900">{entries.length}</p>
              </Card>

              <Card className="p-6 border-2 border-stone-200 bg-gradient-to-br from-white to-stone-50 shadow-lg">
                <p className="text-stone-600 text-sm font-medium mb-1">Avg per Task</p>
                <p className="text-3xl font-bold text-stone-900">
                  {entries.length > 0 ? (totalTime / entries.length / 60).toFixed(0) : 0}m
                </p>
              </Card>

              <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-white to-green-50 shadow-lg">
                <p className="text-stone-600 text-sm font-medium mb-1">Top Category</p>
                <p className="text-2xl font-bold text-green-900">
                  {Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                </p>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card className="p-6 border-2 border-stone-200 shadow-lg">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                Time by Category
              </h2>
              {Object.keys(categoryData).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-stone-500 text-lg">No data yet. Start tracking to see analytics!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryData)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, seconds]) => {
                      const percentage = (seconds / totalTime) * 100
                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-stone-900">{cat}</span>
                            <span className="text-amber-900 font-mono font-bold">
                              {(seconds / 3600).toFixed(1)}h ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
