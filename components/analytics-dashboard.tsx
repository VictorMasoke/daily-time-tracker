// components/analytics-dashboard.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar, TrendingUp, PieChart, LineChart,
  Filter, Clock, Target, Zap, Brain, Download, Coffee
} from "lucide-react"
import { formatDuration } from "@/lib/utils"
import type { Task, Category } from "@/lib/types"

interface AnalyticsDashboardProps {
  tasks: Task[]
  categories: Category[]
  activeTaskId: string | null
  timer: number
  currentTask: Task | undefined
}

export function AnalyticsDashboard({ tasks, categories, activeTaskId, timer, currentTask }: AnalyticsDashboardProps) {
  // Safely handle empty or undefined arrays
  const safeTasks = Array.isArray(tasks) ? tasks : []
  const safeCategories = Array.isArray(categories) ? categories : []

  const today = new Date().toDateString()
  const todayTasks = safeTasks.filter(t => {
    try {
      return new Date(t.created_at).toDateString() === today
    } catch {
      return false
    }
  })

  const weekTasks = safeTasks.filter(t => {
    try {
      const taskDate = new Date(t.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return taskDate >= weekAgo
    } catch {
      return false
    }
  })

  const categoryData = safeCategories.map(category => {
    const categoryTasks = safeTasks.filter(t => t.category_id === category.id)
    const totalTime = categoryTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
    return { ...category, totalTime, taskCount: categoryTasks.length }
  }).sort((a, b) => b.totalTime - a.totalTime)

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayTasks = safeTasks.filter(t => {
      try {
        return new Date(t.created_at).toDateString() === date.toDateString()
      } catch {
        return false
      }
    })
    const totalTime = dayTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: totalTime
    }
  }).reverse()

  const peakHours = Array.from({ length: 24 }, (_, hour) => {
    const hourTasks = safeTasks.filter(t => {
      try {
        const taskHour = new Date(t.start_time || t.created_at).getHours()
        return taskHour === hour
      } catch {
        return false
      }
    })
    const totalTime = hourTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
    return { hour, time: totalTime }
  })

  const completedTasks = safeTasks.filter(t => t.status === 'completed').length
  const focusScore = safeTasks.length > 0
    ? Math.round((completedTasks / safeTasks.length) * 100)
    : 0

  const totalDuration = safeTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
  const averageSessionTime = safeTasks.length > 0
    ? totalDuration / safeTasks.length
    : 0

  const maxDailyTime = Math.max(...dailyData.map(d => d.time), 1)
  const maxHourTime = Math.max(...peakHours.map(h => h.time), 1)

  // Check if we have any data
  const hasData = safeTasks.length > 0

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Analytics Dashboard</h2>
          <p className="text-stone-600">Deep insights into your productivity patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-stone-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="border-stone-300">
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500" disabled={!hasData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600 mb-1">Total Focus Time</p>
              <p className="text-2xl font-bold text-stone-900">
                {formatDuration(totalDuration)}
              </p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600 mb-1">Focus Score</p>
              <p className="text-2xl font-bold text-stone-900">{focusScore}%</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600 mb-1">Avg Session</p>
              <p className="text-2xl font-bold text-stone-900">
                {formatDuration(Math.round(averageSessionTime))}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600 mb-1">Tasks Completed</p>
              <p className="text-2xl font-bold text-stone-900">{completedTasks}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      {!hasData && (
        <Card className="p-12 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
              <Coffee className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">No Data Yet</h3>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Start tracking your time to see detailed analytics and insights about your productivity patterns.
            </p>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
              Create Your First Task
            </Button>
          </div>
        </Card>
      )}

      {/* Charts Grid - Only show if we have data */}
      {hasData && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-600" />
                Time by Category
              </h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            {categoryData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-500">No categories yet. Create a category to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryData.map((category) => {
                  const percentage = totalDuration > 0
                    ? (category.totalTime / totalDuration) * 100
                    : 0

                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-stone-900">{category.name}</span>
                          <span className="text-sm text-stone-500">({category.taskCount})</span>
                        </div>
                        <span className="font-mono font-bold text-amber-900">
                          {formatDuration(category.totalTime)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Daily Trends */}
          <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-amber-600" />
                7-Day Trend
              </h3>
              <Button variant="ghost" size="sm">Last Month</Button>
            </div>
            <div className="h-64 flex items-end gap-2">
              {dailyData.map((day, index) => {
                const heightPercentage = maxDailyTime > 0
                  ? (day.time / maxDailyTime) * 100
                  : 0
                const minHeight = day.time > 0 ? 20 : 0

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-orange-500 transition-all hover:opacity-80"
                        style={{
                          height: day.time > 0 ? `${Math.max(heightPercentage, minHeight)}%` : '0px'
                        }}
                        title={`${day.date}: ${formatDuration(day.time)}`}
                      />
                    </div>
                    <span className="text-xs text-stone-500">{day.date}</span>
                    <span className="text-xs font-medium text-stone-700">
                      {day.time > 0 ? formatDuration(day.time) : '0s'}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Peak Hours */}
          <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Peak Productivity Hours
            </h3>
            <div className="grid grid-cols-6 lg:grid-cols-12 gap-2">
              {peakHours.map((hourData, index) => {
                const heightPercentage = maxHourTime > 0
                  ? (hourData.time / maxHourTime) * 100
                  : 0
                const minHeight = hourData.time > 0 ? 20 : 0

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-full bg-stone-200 rounded-lg overflow-hidden" style={{ height: '80px' }}>
                      <div className="w-full h-full flex flex-col justify-end">
                        <div
                          className="bg-gradient-to-t from-amber-400 to-orange-500 transition-all hover:opacity-80"
                          style={{
                            height: hourData.time > 0 ? `${Math.max(heightPercentage, minHeight)}%` : '0%'
                          }}
                          title={`${hourData.hour.toString().padStart(2, '0')}:00 - ${formatDuration(hourData.time)}`}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 mt-1">
                      {hourData.hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Task Completion */}
          <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-6">Task Completion Rate</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-stone-900">{focusScore}%</div>
                    <div className="text-sm text-stone-600">Success Rate</div>
                  </div>
                </div>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${focusScore * 2.83} 283`}
                    className="transition-all duration-500"
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Top Tasks */}
          <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-6">Top Tasks by Duration</h3>
            {safeTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-500">No tasks yet. Start tracking to see your top tasks!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {safeTasks
                  .sort((a, b) => (b.duration || 0) - (a.duration || 0))
                  .slice(0, 5)
                  .map((task, index) => {
                    const category = safeCategories.find(c => c.id === task.category_id)
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-amber-700">{index + 1}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 truncate">{task.title}</p>
                            {category && (
                              <p className="text-xs truncate" style={{ color: category.color }}>
                                {category.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-900 flex-shrink-0 ml-2">
                          {formatDuration(task.duration || 0)}
                        </span>
                      </div>
                    )
                  })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
