// components/analytics-dashboard.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar, TrendingUp, PieChart, LineChart,
  Filter, Clock, Target, Zap, Brain, Download
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
  const today = new Date().toDateString()
  const todayTasks = tasks.filter(t => new Date(t.created_at).toDateString() === today)
  const weekTasks = tasks.filter(t => {
    const taskDate = new Date(t.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return taskDate >= weekAgo
  })

  const categoryData = categories.map(category => {
    const categoryTasks = tasks.filter(t => t.category_id === category.id)
    const totalTime = categoryTasks.reduce((sum, t) => sum + t.duration, 0)
    return { ...category, totalTime, taskCount: categoryTasks.length }
  }).sort((a, b) => b.totalTime - a.totalTime)

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayTasks = tasks.filter(t =>
      new Date(t.created_at).toDateString() === date.toDateString()
    )
    const totalTime = dayTasks.reduce((sum, t) => sum + t.duration, 0)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: totalTime
    }
  }).reverse()

  const peakHours = Array.from({ length: 24 }, (_, hour) => {
    const hourTasks = tasks.filter(t => {
      const taskHour = new Date(t.start_time || t.created_at).getHours()
      return taskHour === hour
    })
    const totalTime = hourTasks.reduce((sum, t) => sum + t.duration, 0)
    return { hour, time: totalTime }
  })

  const focusScore = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
    : 0

  const averageSessionTime = tasks.length > 0
    ? tasks.reduce((sum, t) => sum + t.duration, 0) / tasks.length
    : 0

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
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
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
                {formatDuration(tasks.reduce((sum, t) => sum + t.duration, 0))}
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
                {formatDuration(averageSessionTime)}
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
              <p className="text-2xl font-bold text-stone-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
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
          <div className="space-y-4">
            {categoryData.map((category) => {
              const percentage = category.totalTime / (tasks.reduce((sum, t) => sum + t.duration, 0) || 1) * 100
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
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
            {dailyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-orange-500 transition-all hover:opacity-80"
                  style={{ height: `${(day.time / 3600) * 20}px` }}
                />
                <span className="text-xs text-stone-500 mt-2">{day.date}</span>
                <span className="text-xs font-medium text-stone-700">
                  {formatDuration(day.time)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Hours */}
        <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Peak Productivity Hours
          </h3>
          <div className="grid grid-cols-6 lg:grid-cols-12 gap-2">
            {peakHours.map((hourData, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full bg-stone-200 rounded-lg overflow-hidden">
                  <div
                    className="bg-gradient-to-t from-amber-400 to-orange-500 transition-all hover:opacity-80"
                    style={{ height: `${(hourData.time / 3600) * 30}px` }}
                  />
                </div>
                <span className="text-xs text-stone-500 mt-1">
                  {hourData.hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
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
              <svg className="w-full h-full" viewBox="0 0 100 100">
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
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Top Tasks */}
        <Card className="p-6 border border-stone-200/50 bg-white/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-6">Top Tasks by Duration</h3>
          <div className="space-y-4">
            {tasks
              .sort((a, b) => b.duration - a.duration)
              .slice(0, 5)
              .map((task, index) => {
                const category = categories.find(c => c.id === task.category_id)
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-700">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{task.title}</p>
                        {category && (
                          <p className="text-xs text-stone-500" style={{ color: category.color }}>
                            {category.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-900">
                      {formatDuration(task.duration)}
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>
    </div>
  )
}
