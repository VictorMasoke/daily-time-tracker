"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Coffee, LogOut, Play, Pause, Trash2, Clock, Calendar,
  TrendingUp, BarChart3, Edit2, Save, X, Plus,
  Tag, FileText, PieChart, LineChart, Filter,
  Target, Zap, Brain, Bell, Settings, ChevronRight,
  Maximize2, Minimize2, Music, BookOpen, Code,
  Briefcase, Dumbbell, Gamepad2, Palette, Search,
  Sparkles, Trophy, Flame, CheckCircle2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDuration, formatTime, formatDate } from "@/lib/utils"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { NotesDashboard } from "./notes-dashboard"
import { GoalsDashboard } from "./goals/goals-dashboard"
import { ThemeToggle } from "./theme-toggle"
import type { User, Category, Task } from "@/lib/types"
import MusicPlayer from "./music-player"

type DashboardClientProps = {
  user: User
  initialCategories?: Category[]
  initialTasks?: Task[]
}

// Animated number counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number, duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setDisplayValue(Math.floor(progress * value))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <>{displayValue}</>
}

// Animated progress ring
function ProgressRing({ progress, size = 60, strokeWidth = 6, color = "#f59e0b" }: { progress: number, size?: number, strokeWidth?: number, color?: string }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-stone-200 dark:text-stone-700"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function DashboardClient({
  user,
  initialCategories = [],
  initialTasks = []
}: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'tracking' | 'analytics' | 'goals' | 'notes' | 'music'>('tracking')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#f59e0b', icon: 'Coffee' })
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [])
  const [newTask, setNewTask] = useState({ title: '', description: '' })
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [timer, setTimer] = useState(0)
  const [focusMode, setFocusMode] = useState(false)
  const [productivityScore, setProductivityScore] = useState(0)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  const icons = {
    Coffee, Music, BookOpen, Code, Briefcase, Dumbbell, Gamepad2, Palette,
    Target, Zap, Brain, Clock, Calendar, TrendingUp, BarChart3
  }

  const colors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
  ]

  // Ensure we always have arrays
  const safeCategories = useMemo(() => {
    return Array.isArray(categories) ? categories : []
  }, [categories])

  const safeTasks = useMemo(() => {
    return Array.isArray(tasks) ? tasks : []
  }, [tasks])

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('coffee-time-notes')
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes))
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }, [])

  // Save notes to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('coffee-time-notes', JSON.stringify(notes))
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }, [notes])

  // Update timer every second for active task
  useEffect(() => {
    if (activeTaskId) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
        setTasks(prev => (Array.isArray(prev) ? prev : []).map(task =>
          task.id === activeTaskId ? { ...task, duration: task.duration + 1 } : task
        ))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setTimer(0)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeTaskId])

  // Calculate productivity score
  useEffect(() => {
    if (!safeTasks.length) {
      setProductivityScore(0)
      return
    }

    try {
      const todayTasks = safeTasks.filter(t => {
        if (!t?.created_at) return false
        try {
          const taskDate = new Date(t.created_at).toDateString()
          const today = new Date().toDateString()
          return taskDate === today
        } catch (e) {
          return false
        }
      })

      if (todayTasks.length === 0) {
        setProductivityScore(0)
        return
      }

      const completed = todayTasks.filter(t => t?.status === 'completed').length
      setProductivityScore(Math.round((completed / todayTasks.length) * 100))
    } catch (error) {
      console.error('Error calculating productivity score:', error)
      setProductivityScore(0)
    }
  }, [safeTasks])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const addCategory = async () => {
    if (!newCategory.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: newCategory.name,
          color: newCategory.color,
          icon: newCategory.icon
        })
        .select()
        .single()

      if (!error && data) {
        setCategories([...safeCategories, data])
        setNewCategory({ name: '', color: '#f59e0b', icon: 'Coffee' })
        setIsAddingCategory(false)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    }
  }

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)

      if (!error) {
        setCategories(safeCategories.map(c => c.id === categoryId ? { ...c, ...updates } : c))
        setEditingCategory(null)
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      await supabase.from('tasks').delete().eq('category_id', categoryId)
      const { error } = await supabase.from('categories').delete().eq('id', categoryId)

      if (!error) {
        setCategories(safeCategories.filter(c => c.id !== categoryId))
        setTasks(safeTasks.filter(t => t.category_id !== categoryId))
        if (activeCategory === categoryId) setActiveCategory(null)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const addTask = async () => {
    if (!newTask.title.trim() || !activeCategory) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          category_id: activeCategory,
          title: newTask.title,
          description: newTask.description,
          status: 'idle',
          duration: 0
        })
        .select()
        .single()

      if (!error && data) {
        setTasks([data, ...safeTasks])
        setNewTask({ title: '', description: '' })
      }
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Failed to add task')
    }
  }

  const startTask = async (taskId: string) => {
    try {
      // Don't start if this task is already running
      const taskToStart = safeTasks.find(t => t.id === taskId)
      if (taskToStart?.status === 'running') {
        return // Already running, do nothing
      }

      // Stop any currently running task first
      if (activeTaskId && activeTaskId !== taskId) {
        await stopTask(activeTaskId)
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'running',
          start_time: new Date().toISOString()
        })
        .eq('id', taskId)

      if (!error) {
        setActiveTaskId(taskId)
        setFocusMode(true)
        // Update local state to reflect running status
        setTasks(safeTasks.map(t =>
          t.id === taskId ? { ...t, status: 'running' as const } : t
        ))
      }
    } catch (error) {
      console.error('Error starting task:', error)
    }
  }

  const stopTask = async (taskId: string) => {
    try {
      const task = safeTasks.find(t => t.id === taskId)
      if (!task) return

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          duration: task.duration
        })
        .eq('id', taskId)

      if (!error) {
        setActiveTaskId(null)
        setFocusMode(false)
        setTasks(safeTasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const, end_time: new Date().toISOString() } : t))
      }
    } catch (error) {
      console.error('Error stopping task:', error)
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (!error) {
        setTasks(safeTasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      if (activeTaskId === taskId) {
        await stopTask(taskId)
      }

      const { error } = await supabase.from('tasks').delete().eq('id', taskId)

      if (!error) {
        setTasks(safeTasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const updateNote = (categoryId: string, content: string) => {
    setNotes(prev => ({ ...prev, [categoryId]: content }))
  }

  const filteredTasks = useMemo(() => {
    return safeTasks.filter(task => {
      if (!task) return false

      try {
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            task.title?.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query)
          )
        }
        if (activeCategory) {
          return task.category_id === activeCategory
        }
        return true
      } catch (error) {
        return false
      }
    })
  }, [safeTasks, searchQuery, activeCategory])

  const todaysFocusTime = useMemo(() => {
    return safeTasks
      .filter(t => {
        try {
          return new Date(t.created_at).toDateString() === new Date().toDateString()
        } catch {
          return false
        }
      })
      .reduce((sum, t) => sum + (t.duration || 0), 0)
  }, [safeTasks])

  const activeTasksCount = useMemo(() => {
    return safeTasks.filter(t => t?.status === 'running').length
  }, [safeTasks])

  const completedTodayCount = useMemo(() => {
    return safeTasks.filter(t => {
      try {
        return t?.status === 'completed' && new Date(t.created_at).toDateString() === new Date().toDateString()
      } catch {
        return false
      }
    }).length
  }, [safeTasks])

  const currentTask = safeTasks.find(t => t.id === activeTaskId)
  const activeCategoryData = safeCategories.find(c => c.id === activeCategory)

  return (
    <div className={`min-h-screen transition-all duration-500 ${focusMode ? 'bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950' : 'bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950'}`}>
      {/* Floating Timer for Analytics Tab */}
      <AnimatePresence>
        {activeTab === 'analytics' && activeTaskId && currentTask && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-2xl border-amber-500/50 backdrop-blur-sm rounded-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium opacity-90">Currently Tracking</p>
                  <p className="text-xl font-bold tracking-tight font-mono">{formatDuration(timer)}</p>
                  <p className="text-xs opacity-80">{currentTask.title}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {focusMode && currentTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
              {/* Floating particles */}
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-amber-400/20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -50, 0],
                    opacity: [0.1, 0.5, 0.1],
                    scale: [1, 2, 1]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 3
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative text-center max-w-2xl z-10"
            >
              {/* Pulsing ring */}
              <motion.div
                className="relative inline-flex items-center justify-center w-32 h-32 mb-8"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-600 to-orange-600" />
                <Target className="relative w-14 h-14 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-white mb-4"
              >
                Deep Focus Mode
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl rounded-full" />
                <p className="relative text-7xl font-mono font-bold text-amber-400 tracking-tighter">
                  {formatDuration(timer)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 mb-8"
              >
                <p className="text-2xl text-amber-200 font-semibold">{currentTask.title}</p>
                {currentTask.description && (
                  <p className="text-stone-400 max-w-md mx-auto">{currentTask.description}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 justify-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => stopTask(currentTask.id)}
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 h-14 rounded-2xl text-lg shadow-lg shadow-red-500/30"
                  >
                    <Pause className="w-6 h-6 mr-2" />
                    End Session
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setFocusMode(false)}
                    size="lg"
                    variant="outline"
                    className="border-amber-400 text-amber-400 hover:bg-amber-400/10 px-8 h-14 rounded-2xl text-lg"
                  >
                    <Minimize2 className="w-6 h-6 mr-2" />
                    Minimize
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 ${focusMode ? 'bg-stone-900/50' : 'bg-white/70 dark:bg-stone-900/70 border-b border-stone-200/50 dark:border-stone-700/50'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className={`p-2.5 rounded-xl ${focusMode ? 'bg-amber-600/20' : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30'}`}
              >
                <Coffee className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className={`text-xl font-bold ${focusMode ? 'text-white' : 'text-stone-900 dark:text-white'}`}>
                  Coffee Time
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${focusMode ? 'bg-amber-600/30 text-amber-300' : 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-300'}`}
              >
                <Flame className="w-4 h-4" />
                <AnimatedCounter value={productivityScore} />% Focus
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <AnimatePresence>
                {activeTaskId && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`px-4 py-2 rounded-xl ${focusMode ? 'bg-amber-600/20 text-amber-300' : 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      <span className="font-mono font-bold">{formatDuration(timer)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <ThemeToggle />

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || user.email}
                    className="w-8 h-8 rounded-full ring-2 ring-amber-500/30"
                  />
                )}
                <span className={`text-sm font-medium ${focusMode ? 'text-stone-300' : 'text-stone-700 dark:text-stone-300'}`}>
                  {user.display_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                  variant={focusMode ? "outline" : "ghost"}
                  className={`rounded-xl ${focusMode ? "border-amber-400 text-amber-400 hover:bg-amber-400/10" : ""}`}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border border-stone-200/50 dark:border-stone-700/50 bg-white/70 dark:bg-stone-800/70 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-600" />
                    Categories
                  </h2>
                  <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => setIsAddingCategory(true)}
                      size="sm"
                      className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${!activeCategory ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 shadow-sm' : 'hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-white">All Tasks</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{safeTasks.length} tasks</p>
                      </div>
                    </div>
                  </motion.button>

                  {safeCategories.map((category, index) => {
                    const Icon = icons[category.icon as keyof typeof icons] || Coffee
                    const categoryTasks = safeTasks.filter(t => t.category_id === category.id)
                    const totalTime = categoryTasks.reduce((sum, t) => sum + (t.duration || 0), 0)

                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        className={`rounded-xl transition-all ${activeCategory === category.id ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 shadow-sm' : 'hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                      >
                        <button
                          onClick={() => setActiveCategory(category.id)}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: category.color }} />
                              </div>
                              <div>
                                {editingCategory === category.id ? (
                                  <Input
                                    value={category.name}
                                    onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                                    onBlur={() => setEditingCategory(null)}
                                    onKeyPress={(e) => e.key === 'Enter' && setEditingCategory(null)}
                                    className="h-7 border-0 p-0 text-sm font-medium bg-transparent"
                                    autoFocus
                                  />
                                ) : (
                                  <p
                                    className="font-semibold text-stone-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                                    onDoubleClick={() => setEditingCategory(category.id)}
                                  >
                                    {category.name}
                                  </p>
                                )}
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                  {categoryTasks.length} tasks • {formatDuration(totalTime)}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          </div>
                        </button>

                        {/* Category Actions */}
                        <div className="px-3 pb-2 flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
                            onClick={() => setEditingCategory(category.id)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Add Category Form */}
                  <AnimatePresence>
                    {isAddingCategory && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                      >
                        <Card className="p-4 border border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                          <Input
                            placeholder="Category name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                            className="mb-3 rounded-xl"
                            autoFocus
                          />
                          <div className="flex gap-2 mb-3">
                            {colors.map(color => (
                              <motion.button
                                key={color}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setNewCategory({...newCategory, color})}
                                className={`w-7 h-7 rounded-full border-2 transition-all ${newCategory.color === color ? 'border-stone-900 dark:border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2 mb-3">
                            {Object.keys(icons).slice(0, 8).map(icon => (
                              <motion.button
                                key={icon}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setNewCategory({...newCategory, icon})}
                                className={`p-1.5 rounded-lg transition-all ${newCategory.icon === icon ? 'bg-amber-200 dark:bg-amber-800' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                              >
                                {React.createElement(icons[icon as keyof typeof icons], { className: "w-4 h-4" })}
                              </motion.button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={addCategory} size="sm" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                              Add
                            </Button>
                            <Button onClick={() => setIsAddingCategory(false)} size="sm" variant="outline" className="rounded-xl">
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-3">
                {(['tracking', 'analytics', 'goals', 'notes', 'music'] as const).map((tab, index) => {
                  const tabIcons = {
                    tracking: Clock,
                    analytics: BarChart3,
                    goals: Target,
                    notes: FileText,
                    music: Music
                  }
                  const Icon = tabIcons[tab]
                  return (
                    <motion.button
                      key={tab}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ x: activeTab === tab ? 0 : 4 }}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all mb-1.5 ${activeTab === tab ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'hover:bg-stone-100 dark:hover:bg-stone-700/50 text-stone-700 dark:text-stone-300'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium capitalize">{tab}</span>
                      {tab === 'tracking' && activeTasksCount > 0 && (
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                          {activeTasksCount} active
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'tracking' && (
                <motion.div
                  key="tracking"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Today's Focus",
                        value: formatDuration(todaysFocusTime),
                        icon: Target,
                        color: 'amber',
                        bgFrom: 'from-amber-500',
                        bgTo: 'to-orange-500'
                      },
                      {
                        label: 'Active Tasks',
                        value: activeTasksCount.toString(),
                        icon: Zap,
                        color: 'green',
                        bgFrom: 'from-green-500',
                        bgTo: 'to-emerald-500'
                      },
                      {
                        label: 'Completed Today',
                        value: completedTodayCount.toString(),
                        icon: CheckCircle2,
                        color: 'blue',
                        bgFrom: 'from-blue-500',
                        bgTo: 'to-cyan-500'
                      },
                      {
                        label: 'Productivity',
                        value: `${productivityScore}%`,
                        icon: TrendingUp,
                        color: 'purple',
                        bgFrom: 'from-purple-500',
                        bgTo: 'to-pink-500'
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        <Card className="p-5 border border-stone-200/50 dark:border-stone-700/50 bg-white/70 dark:bg-stone-800/70 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden relative group">
                          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgFrom} ${stat.bgTo} opacity-0 group-hover:opacity-5 transition-opacity`} />
                          <div className="flex items-center justify-between relative">
                            <div>
                              <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">{stat.label}</p>
                              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                                {stat.value}
                              </p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgFrom} ${stat.bgTo} shadow-lg`}>
                              <stat.icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Task Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/70 dark:bg-stone-800/70 backdrop-blur-xl shadow-xl rounded-2xl">
                      <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-5 flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        Add New Task
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">Task Title</Label>
                          <Input
                            placeholder="What are you working on?"
                            value={newTask.title}
                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                            className="border-stone-300 dark:border-stone-600 dark:bg-stone-700/50 dark:text-white focus:border-amber-500 rounded-xl h-12"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 block">Description (Optional)</Label>
                          <Textarea
                            placeholder="Add details about this task..."
                            value={newTask.description}
                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            className="border-stone-300 dark:border-stone-600 dark:bg-stone-700/50 dark:text-white focus:border-amber-500 rounded-xl min-h-[80px]"
                          />
                        </div>
                        <div className="flex gap-3">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              onClick={addTask}
                              disabled={!newTask.title.trim() || !activeCategory || !categories || categories.length === 0}
                              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              {!activeCategory ? 'Select a category first' : 'Add Task'}
                            </Button>
                          </motion.div>

                          {!activeCategory && (
                            <p className="text-sm text-amber-600 text-center self-center">
                              ← Select a category from the sidebar to create tasks
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Task List */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/70 dark:bg-stone-800/70 backdrop-blur-xl shadow-xl rounded-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                            <Coffee className="w-5 h-5 text-amber-600" />
                          </div>
                          {activeCategoryData ? `${activeCategoryData.name} Tasks` : 'All Tasks'}
                        </h2>
                        <div className="relative">
                          <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 border-stone-300 dark:border-stone-600 dark:bg-stone-700/50 focus:border-amber-500 rounded-xl pl-10 h-11"
                          />
                          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>

                      {filteredTasks.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-16"
                        >
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800 mb-4"
                          >
                            <Coffee className="w-10 h-10 text-stone-400" />
                          </motion.div>
                          <p className="text-stone-500 dark:text-stone-400 text-lg">No tasks found. Create your first task!</p>
                        </motion.div>
                      ) : (
                        <div className="space-y-3">
                          {filteredTasks.map((task, index) => {
                            const category = (categories || []).find(c => c.id === task.category_id)
                            const Icon = icons[category?.icon as keyof typeof icons] || Coffee

                            return (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                whileHover={{ scale: 1.01 }}
                                className={`p-5 rounded-2xl border transition-all ${task.status === 'running' ? 'border-amber-300 dark:border-amber-600 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-lg shadow-amber-500/10' : 'border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg'}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      {category && (
                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                        >
                                          <Icon className="w-3 h-3" />
                                          {category.name}
                                        </motion.div>
                                      )}
                                      <span className="text-xs text-stone-500 dark:text-stone-400">
                                        {new Date(task.created_at).toLocaleDateString()}
                                      </span>
                                      {task.status === 'running' && (
                                        <motion.span
                                          animate={{ opacity: [1, 0.5, 1] }}
                                          transition={{ duration: 1.5, repeat: Infinity }}
                                          className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"
                                        >
                                          <span className="w-2 h-2 rounded-full bg-green-500" />
                                          Recording
                                        </motion.span>
                                      )}
                                    </div>

                                    {editingTask === task.id ? (
                                      <div className="space-y-3">
                                        <Input
                                          value={task.title}
                                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                                          onBlur={() => setEditingTask(null)}
                                          className="border-stone-300 dark:border-stone-600 dark:bg-stone-700/50 dark:text-white rounded-xl"
                                          autoFocus
                                        />
                                        <Textarea
                                          value={task.description || ''}
                                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                          placeholder="Add description..."
                                          className="border-stone-300 dark:border-stone-600 dark:bg-stone-700/50 dark:text-white rounded-xl"
                                        />
                                        <div className="flex gap-2">
                                          <Button onClick={() => setEditingTask(null)} size="sm" variant="outline" className="rounded-xl">
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <h3
                                          className="text-lg font-semibold text-stone-900 dark:text-white mb-1 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors"
                                          onDoubleClick={() => setEditingTask(task.id)}
                                        >
                                          {task.title}
                                        </h3>
                                        {task.description && (
                                          <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">{task.description}</p>
                                        )}
                                      </>
                                    )}

                                    <div className="flex items-center gap-4 mt-3">
                                      <span className="font-mono font-bold text-amber-900 dark:text-amber-400 text-xl">
                                        {formatDuration(task.duration)}
                                      </span>
                                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${task.status === 'running' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : task.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-300'}`}>
                                        {task.status}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 ml-4">
                                    {task.status === 'running' ? (
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          onClick={() => stopTask(task.id)}
                                          size="sm"
                                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-red-500/30"
                                        >
                                          <Pause className="w-4 h-4 mr-2" />
                                          Stop
                                        </Button>
                                      </motion.div>
                                    ) : task.status === 'completed' ? (
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          onClick={() => startTask(task.id)}
                                          size="sm"
                                          variant="outline"
                                          className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Resume
                                        </Button>
                                      </motion.div>
                                    ) : (
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          onClick={() => startTask(task.id)}
                                          size="sm"
                                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-green-500/30"
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Start
                                        </Button>
                                      </motion.div>
                                    )}

                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        onClick={() => setEditingTask(task.id)}
                                        size="sm"
                                        variant="outline"
                                        className="border-stone-300 dark:border-stone-600 rounded-xl"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        onClick={() => deleteTask(task.id)}
                                        size="sm"
                                        variant="outline"
                                        className="border-stone-300 dark:border-stone-600 hover:border-red-500 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 rounded-xl"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </motion.div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AnalyticsDashboard
                    tasks={tasks}
                    categories={categories}
                    activeTaskId={activeTaskId}
                    timer={timer}
                    currentTask={currentTask}
                  />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <NotesDashboard
                    categories={categories}
                    userId={user.id}
                  />
                </motion.div>
              )}

              {activeTab === 'goals' && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GoalsDashboard />
                </motion.div>
              )}

              <div style={{ display: activeTab === 'music' ? 'block' : 'none' }}>
                <MusicPlayer
                  isMinimized={false}
                  onToggleMinimize={() => {
                    setIsMusicPlaying(true)
                    setActiveTab('tracking')
                  }}
                  onPlayingChange={setIsMusicPlaying}
                />
              </div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Floating Music Player - Shows on all tabs except music */}
      <AnimatePresence>
        {activeTab !== 'music' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Card className="w-72 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white shadow-2xl border-0 overflow-hidden rounded-2xl">
              <div className="relative">
                {/* Animated gradient */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 80%, rgba(251, 146, 60, 0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.4) 0%, transparent 50%)',
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Focus Music</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setActiveTab('music')}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                  <p className="text-sm text-center text-white/70">Switch to Music tab to play</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
