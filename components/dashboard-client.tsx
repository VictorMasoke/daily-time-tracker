"use client"

import * as React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
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
  Briefcase, Dumbbell, Gamepad2, Palette, Search
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDuration, formatTime, formatDate } from "@/lib/utils"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { NotesDashboard } from "./notes-dashboard"
import type { User, Category, Task } from "@/lib/types"
import MusicPlayer from "./music-player"

type DashboardClientProps = {
  user: User
  initialCategories?: Category[]
  initialTasks?: Task[]
}

export default function DashboardClient({
  user,
  initialCategories = [],
  initialTasks = []
}: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'tracking' | 'analytics' | 'notes' | 'music'>('tracking')
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
      if (activeTaskId) {
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

  const currentTask = safeTasks.find(t => t.id === activeTaskId)
  const activeCategoryData = safeCategories.find(c => c.id === activeCategory)

  return (
    <div className={`min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 transition-all duration-300 ${focusMode ? 'bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950' : ''}`}>
      {/* Floating Timer for Analytics Tab */}
      {activeTab === 'analytics' && activeTaskId && currentTask && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <Card className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-2xl border-amber-500/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Currently Tracking</p>
                <p className="text-xl font-bold tracking-tight">{formatDuration(timer)}</p>
                <p className="text-xs opacity-80">{currentTask.title}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Focus Mode Overlay */}
      {focusMode && currentTask && (
        <div className="fixed inset-0 bg-gradient-to-br from-stone-950/95 via-stone-900/95 to-stone-950/95 z-50 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 mb-8 animate-pulse">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Deep Focus Mode</h2>
            <p className="text-6xl font-mono font-bold text-amber-400 mb-8 tracking-tighter">
              {formatDuration(timer)}
            </p>
            <div className="space-y-4">
              <p className="text-xl text-amber-200">{currentTask.title}</p>
              <p className="text-stone-400">{currentTask.description}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => stopTask(currentTask.id)}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 h-14 rounded-xl text-lg"
                >
                  <Pause className="w-6 h-6 mr-2" />
                  End Session
                </Button>
                <Button
                  onClick={() => setFocusMode(false)}
                  size="lg"
                  variant="outline"
                  className="border-amber-400 text-amber-400 hover:bg-amber-400/10 px-8 h-14 rounded-xl text-lg"
                >
                  <Minimize2 className="w-6 h-6 mr-2" />
                  Minimize
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg transition-all duration-300 ${focusMode ? 'bg-stone-900/50' : 'bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${focusMode ? 'bg-amber-600/20' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-xl font-bold ${focusMode ? 'text-white' : 'text-stone-900'}`}>
                Coffee Time
              </h1>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${focusMode ? 'bg-amber-600/30 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                {productivityScore}% Focus
              </div>
            </div>

            <div className="flex items-center gap-4">
              {activeTaskId && (
                <div className={`px-4 py-2 rounded-lg ${focusMode ? 'bg-amber-600/20 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-bold">{formatDuration(timer)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || user.email}
                    className="w-8 h-8 rounded-full border border-amber-500/30"
                  />
                )}
                <span className={`text-sm font-medium ${focusMode ? 'text-stone-300' : 'text-stone-700'}`}>
                  {user.display_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>

              <Button
                onClick={handleSignOut}
                size="sm"
                variant={focusMode ? "outline" : "ghost"}
                className={focusMode ? "border-amber-400 text-amber-400 hover:bg-amber-400/10" : ""}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="border border-stone-200/50 bg-white/50 backdrop-blur-sm shadow-lg">
              <div className="p-4 border-b border-stone-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-600" />
                    Categories
                  </h2>
                  <Button
                    onClick={() => setIsAddingCategory(true)}
                    size="sm"
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${!activeCategory ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'hover:bg-stone-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center">
                        <Coffee className="w-4 h-4 text-stone-600" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">All Tasks</p>
                        <p className="text-xs text-stone-500">{safeTasks.length} tasks</p>
                      </div>
                    </div>
                  </button>

                  {safeCategories.map(category => {
                    const Icon = icons[category.icon as keyof typeof icons] || Coffee
                    const categoryTasks = safeTasks.filter(t => t.category_id === category.id)
                    const totalTime = categoryTasks.reduce((sum, t) => sum + (t.duration || 0), 0)

                    return (
                      <div
                        key={category.id}
                        className={`rounded-xl transition-all ${activeCategory === category.id ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'hover:bg-stone-50'}`}
                      >
                        <button
                          onClick={() => setActiveCategory(category.id)}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: category.color }} />
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
                                    className="font-medium text-stone-900 hover:text-amber-700 transition-colors"
                                    onDoubleClick={() => setEditingCategory(category.id)}
                                  >
                                    {category.name}
                                  </p>
                                )}
                                <p className="text-xs text-stone-500">
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
                            className="h-7 px-2 text-xs"
                            onClick={() => setEditingCategory(category.id)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Add Category Form */}
                  {isAddingCategory && (
                    <Card className="p-3 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                      <Input
                        placeholder="Category name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2 mb-2">
                        {colors.map(color => (
                          <button
                            key={color}
                            onClick={() => setNewCategory({...newCategory, color})}
                            className={`w-6 h-6 rounded-full border-2 ${newCategory.color === color ? 'border-stone-900' : 'border-stone-300'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {Object.keys(icons).slice(0, 8).map(icon => (
                          <button
                            key={icon}
                            onClick={() => setNewCategory({...newCategory, icon})}
                            className={`p-1 rounded-lg ${newCategory.icon === icon ? 'bg-amber-100' : 'hover:bg-stone-100'}`}
                          >
                            {React.createElement(icons[icon as keyof typeof icons], { className: "w-4 h-4" })}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button onClick={addCategory} size="sm" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500">
                          Add
                        </Button>
                        <Button onClick={() => setIsAddingCategory(false)} size="sm" variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-2">
                {(['tracking', 'analytics', 'notes', 'music'] as const).map(tab => {
                  const icons = {
                    tracking: Clock,
                    analytics: BarChart3,
                    notes: FileText,
                    music: Music
                  }
                  const Icon = icons[tab]
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${activeTab === tab ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'hover:bg-stone-100 text-stone-700'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium capitalize">{tab}</span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Today's Focus</p>
                        <p className="text-2xl font-bold text-stone-900">
                          {formatDuration(todaysFocusTime)}
                        </p>
                      </div>
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Target className="w-5 h-5 text-amber-700" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Active Tasks</p>
                        <p className="text-2xl font-bold text-stone-900">{activeTasksCount}</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Zap className="w-5 h-5 text-green-700" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 mb-1">Productivity</p>
                        <p className="text-2xl font-bold text-stone-900">{productivityScore}%</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-700" />
                      </div>
                    </div>
                  </Card>
                </div>
                {/* Add Task Form */}
                <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm shadow-lg">
                  <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-amber-600" />
                    Add New Task
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-stone-700 mb-2 block">Task Title</Label>
                      <Input
                        placeholder="What are you working on?"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="border-stone-300 focus:border-amber-500 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-stone-700 mb-2 block">Description (Optional)</Label>
                      <Textarea
                        placeholder="Add details about this task..."
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="border-stone-300 focus:border-amber-500 rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={addTask}
                        disabled={!newTask.title.trim() || !activeCategory || !categories || categories.length === 0}
                        className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        {!activeCategory ? 'Select a category first' : 'Add Task'}
                      </Button>

                      {!activeCategory && (
                        <p className="text-sm text-amber-600 text-center">
                          ← Select a category from the sidebar to create tasks
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Task List */}
                <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-amber-600" />
                      {activeCategoryData ? `${activeCategoryData.name} Tasks` : 'All Tasks'}
                    </h2>
                    <div className="relative">
                      <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 border-stone-300 focus:border-amber-500 rounded-xl pl-10"
                      />
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
                        <Coffee className="w-8 h-8 text-stone-400" />
                      </div>
                      <p className="text-stone-500">No tasks found. Create your first task!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTasks.map(task => {
                        const category = (categories || []).find(c => c.id === task.category_id)
                        const Icon = icons[category?.icon as keyof typeof icons] || Coffee

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-xl border transition-all ${task.status === 'running' ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm' : 'border-stone-200 hover:border-amber-300 hover:shadow-sm'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {category && (
                                    <div
                                      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                    >
                                      <Icon className="w-3 h-3" />
                                      {category.name}
                                    </div>
                                  )}
                                  <span className="text-xs text-stone-500">
                                    {new Date(task.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                {editingTask === task.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={task.title}
                                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                                      onBlur={() => setEditingTask(null)}
                                      className="border-stone-300"
                                      autoFocus
                                    />
                                    <Textarea
                                      value={task.description || ''}
                                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                      placeholder="Add description..."
                                      className="border-stone-300"
                                    />
                                    <div className="flex gap-2">
                                      <Button onClick={() => setEditingTask(null)} size="sm" variant="outline">
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <h3
                                      className="text-lg font-semibold text-stone-900 mb-1 hover:text-amber-700 cursor-pointer"
                                      onDoubleClick={() => setEditingTask(task.id)}
                                    >
                                      {task.title}
                                    </h3>
                                    {task.description && (
                                      <p className="text-sm text-stone-600 mb-3">{task.description}</p>
                                    )}
                                  </>
                                )}

                                <div className="flex items-center gap-4 mt-3">
                                  <span className="font-mono font-bold text-amber-900 text-lg">
                                    {formatDuration(task.duration)}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'running' ? 'bg-green-100 text-green-800' : task.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-800'}`}>
                                    {task.status}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                {task.status === 'running' ? (
                                  <Button
                                    onClick={() => stopTask(task.id)}
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Stop
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => startTask(task.id)}
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                  </Button>
                                )}

                                <Button
                                  onClick={() => setEditingTask(task.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-stone-300"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>

                                <Button
                                  onClick={() => deleteTask(task.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-stone-300 hover:border-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                tasks={tasks}
                categories={categories}
                activeTaskId={activeTaskId}
                timer={timer}
                currentTask={currentTask}
              />
            )}

            {activeTab === 'notes' && (
              <NotesDashboard
                categories={categories}
                userId={user.id}
              />
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
          </div>


        </div>
      </div>
      {/* Floating Music Player - Shows on all tabs except music */}
      {activeTab !== 'music' && (
      <div className="fixed bottom-6 left-6 w-80 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-2xl border-0 z-50 overflow-hidden rounded-2xl">
        <div className="relative">
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Now Playing</span>
              </div>
              <Button
                onClick={() => setActiveTab('music')}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-white/80">Switch to Music tab to see player</p>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
