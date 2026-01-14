// components/analytics-dashboard.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar, TrendingUp, PieChart, LineChart,
  Filter, Clock, Target, Zap, Brain, Download, Coffee,
  Sparkles, ArrowUp, ArrowDown, Lightbulb, Trophy,
  Moon, Sun, Flame, Star
} from "lucide-react"
import { formatDuration } from "@/lib/utils"
import type { Task, Category } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"

interface AnalyticsDashboardProps {
  tasks: Task[]
  categories: Category[]
  activeTaskId: string | null
  timer: number
  currentTask: Task | undefined
}

export function AnalyticsDashboard({ tasks, categories, activeTaskId, timer, currentTask }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | 'all'>('7d')
  const [showAIInsights, setShowAIInsights] = useState(true)

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

  const previousWeekTasks = safeTasks.filter(t => {
    try {
      const taskDate = new Date(t.created_at)
      const weekAgo = new Date()
      const twoWeeksAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      return taskDate >= twoWeeksAgo && taskDate < weekAgo
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
    const completedCount = dayTasks.filter(t => t.status === 'completed').length
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: totalTime,
      tasks: dayTasks.length,
      completed: completedCount
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
  const weekDuration = weekTasks.reduce((sum, t) => sum + (t.duration || 0), 0)
  const previousWeekDuration = previousWeekTasks.reduce((sum, t) => sum + (t.duration || 0), 0)

  const weekChange = previousWeekDuration > 0
    ? Math.round(((weekDuration - previousWeekDuration) / previousWeekDuration) * 100)
    : weekDuration > 0 ? 100 : 0

  const averageSessionTime = safeTasks.length > 0
    ? totalDuration / safeTasks.length
    : 0

  const maxDailyTime = Math.max(...dailyData.map(d => d.time), 1)
  const maxHourTime = Math.max(...peakHours.map(h => h.time), 1)

  // Find peak productivity hour
  const peakHour = peakHours.reduce((max, h) => h.time > max.time ? h : max, peakHours[0])

  // Find most productive day
  const mostProductiveDay = dailyData.reduce((max, d) => d.time > max.time ? d : max, dailyData[0])

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0
    const sortedDays = [...dailyData].reverse()
    for (const day of sortedDays) {
      if (day.time > 0) streak++
      else break
    }
    return streak
  }
  const currentStreak = calculateStreak()

  // AI Insights Generation
  const aiInsights = useMemo(() => {
    const insights: { type: 'success' | 'warning' | 'tip' | 'insight'; icon: any; title: string; description: string }[] = []

    if (peakHour.time > 0) {
      const hourStr = peakHour.hour < 12 ? `${peakHour.hour}:00 AM` : peakHour.hour === 12 ? '12:00 PM' : `${peakHour.hour - 12}:00 PM`
      insights.push({
        type: 'insight',
        icon: Sun,
        title: 'Peak Performance Time',
        description: `You're most productive around ${hourStr}. Try scheduling your most important tasks during this time for maximum efficiency.`
      })
    }

    if (weekChange > 20) {
      insights.push({
        type: 'success',
        icon: Trophy,
        title: 'Productivity Surge!',
        description: `Your focus time is up ${weekChange}% compared to last week. You're building great momentum - keep it going!`
      })
    } else if (weekChange < -20) {
      insights.push({
        type: 'warning',
        icon: Flame,
        title: 'Time to Refocus',
        description: `Your productivity decreased ${Math.abs(weekChange)}% this week. Consider breaking tasks into smaller chunks to rebuild momentum.`
      })
    }

    if (currentStreak >= 3) {
      insights.push({
        type: 'success',
        icon: Flame,
        title: `${currentStreak}-Day Streak!`,
        description: `You've been productive for ${currentStreak} days in a row. Consistency is the key to success!`
      })
    }

    if (focusScore < 50 && safeTasks.length > 5) {
      insights.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Completion Rate Tip',
        description: 'Try the 2-minute rule: If a task takes less than 2 minutes, do it immediately. This helps build completion momentum.'
      })
    }

    if (averageSessionTime > 3600) {
      insights.push({
        type: 'tip',
        icon: Brain,
        title: 'Take Strategic Breaks',
        description: 'Your average session is over an hour. Consider using the Pomodoro technique (25 min work, 5 min break) to maintain peak focus.'
      })
    }

    const topCategory = categoryData[0]
    if (topCategory && topCategory.totalTime > 0) {
      insights.push({
        type: 'insight',
        icon: Star,
        title: `${topCategory.name} Champion`,
        description: `You've invested ${formatDuration(topCategory.totalTime)} in ${topCategory.name}. This is your most focused area!`
      })
    }

    return insights.slice(0, 4)
  }, [peakHour, weekChange, currentStreak, focusScore, averageSessionTime, categoryData, safeTasks.length])

  // Check if we have any data
  const hasData = safeTasks.length > 0

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            Analytics Dashboard
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-1">Deep insights into your productivity patterns</p>
        </motion.div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeRange === range
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            disabled={!hasData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {hasData && aiInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-900/20 dark:via-stone-800/50 dark:to-indigo-900/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-white">AI Productivity Insights</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">Personalized recommendations based on your patterns</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className="text-stone-600 dark:text-stone-400"
                >
                  {showAIInsights ? 'Hide' : 'Show'}
                </Button>
              </div>

              <AnimatePresence>
                {showAIInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    {aiInsights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          insight.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
                            : insight.type === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
                            : insight.type === 'tip'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
                            : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            insight.type === 'success'
                              ? 'bg-green-100 dark:bg-green-800/50'
                              : insight.type === 'warning'
                              ? 'bg-amber-100 dark:bg-amber-800/50'
                              : insight.type === 'tip'
                              ? 'bg-blue-100 dark:bg-blue-800/50'
                              : 'bg-purple-100 dark:bg-purple-800/50'
                          }`}>
                            <insight.icon className={`w-4 h-4 ${
                              insight.type === 'success'
                                ? 'text-green-600 dark:text-green-400'
                                : insight.type === 'warning'
                                ? 'text-amber-600 dark:text-amber-400'
                                : insight.type === 'tip'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-purple-600 dark:text-purple-400'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900 dark:text-white text-sm">{insight.title}</h4>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Focus Time',
            value: formatDuration(totalDuration),
            change: weekChange,
            icon: Clock,
            color: 'amber'
          },
          {
            label: 'Focus Score',
            value: `${focusScore}%`,
            change: null,
            icon: Target,
            color: 'green'
          },
          {
            label: 'Avg Session',
            value: formatDuration(Math.round(averageSessionTime)),
            change: null,
            icon: Zap,
            color: 'blue'
          },
          {
            label: 'Current Streak',
            value: `${currentStreak} days`,
            change: null,
            icon: Flame,
            color: 'purple'
          }
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-5 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-stone-600 dark:text-stone-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">
                    {metric.value}
                  </p>
                  {metric.change !== null && (
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {metric.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      <span>{Math.abs(metric.change)}% vs last week</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-${metric.color}-100 dark:bg-${metric.color}-900/30`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {!hasData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mb-6"
              >
                <Coffee className="w-10 h-10 text-amber-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">No Data Yet</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
                Start tracking your time to see detailed analytics and AI-powered insights about your productivity patterns.
              </p>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                Create Your First Task
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Charts Grid - Only show if we have data */}
      {hasData && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-amber-600" />
                  Time by Category
                </h3>
              </div>

              {categoryData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-stone-500 dark:text-stone-400">No categories yet. Create a category to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, i) => {
                    const percentage = totalDuration > 0
                      ? (category.totalTime / totalDuration) * 100
                      : 0

                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium text-stone-900 dark:text-white">{category.name}</span>
                            <span className="text-sm text-stone-500 dark:text-stone-400">({category.taskCount})</span>
                          </div>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {formatDuration(category.totalTime)}
                          </span>
                        </div>
                        <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Daily Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-amber-600" />
                  7-Day Trend
                </h3>
              </div>
              <div className="h-64 flex items-end gap-2">
                {dailyData.map((day, index) => {
                  const heightPercentage = maxDailyTime > 0
                    ? (day.time / maxDailyTime) * 100
                    : 0

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex-1 flex flex-col items-center gap-2"
                      style={{ originY: 1 }}
                    >
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '180px' }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: day.time > 0 ? `${Math.max(heightPercentage, 10)}%` : '4px' }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                            day.time > 0
                              ? 'bg-gradient-to-t from-amber-500 to-orange-500'
                              : 'bg-stone-200 dark:bg-stone-700'
                          }`}
                          title={`${day.fullDate}: ${formatDuration(day.time)}`}
                        />
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{day.date}</span>
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {day.time > 0 ? formatDuration(day.time) : '-'}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* Peak Hours Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Peak Productivity Hours
                </h3>
                <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  <span>Low</span>
                  <div className="flex gap-1">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((opacity) => (
                      <div
                        key={opacity}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `rgba(251, 146, 60, ${opacity})` }}
                      />
                    ))}
                  </div>
                  <span>High</span>
                </div>
              </div>
              <div className="grid grid-cols-8 lg:grid-cols-12 gap-2">
                {peakHours.map((hourData, index) => {
                  const intensity = maxHourTime > 0 ? hourData.time / maxHourTime : 0
                  const isPeak = hourData.hour === peakHour.hour && peakHour.time > 0

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-full aspect-square rounded-lg transition-all cursor-pointer hover:scale-110 ${
                          isPeak ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-800' : ''
                        }`}
                        style={{
                          backgroundColor: hourData.time > 0
                            ? `rgba(251, 146, 60, ${Math.max(intensity, 0.15)})`
                            : 'rgb(229, 231, 235)'
                        }}
                        title={`${hourData.hour.toString().padStart(2, '0')}:00 - ${formatDuration(hourData.time)}`}
                      />
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {hourData.hour.toString().padStart(2, '0')}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* Task Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Task Completion Rate</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                        className="text-4xl font-bold text-stone-900 dark:text-white"
                      >
                        {focusScore}%
                      </motion.div>
                      <div className="text-sm text-stone-600 dark:text-stone-400">Success Rate</div>
                    </div>
                  </div>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      className="stroke-stone-200 dark:stroke-stone-700"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 283' }}
                      animate={{ strokeDasharray: `${focusScore * 2.83} 283` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">Completed</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-700/50">
                  <p className="text-2xl font-bold text-stone-600 dark:text-stone-300">{safeTasks.length - completedTasks}</p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">In Progress</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Top Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 border border-stone-200/50 dark:border-stone-700/50 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                Top Tasks by Duration
              </h3>
              {safeTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-stone-500 dark:text-stone-400">No tasks yet. Start tracking to see your top tasks!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeTasks
                    .sort((a, b) => (b.duration || 0) - (a.duration || 0))
                    .slice(0, 5)
                    .map((task, index) => {
                      const category = safeCategories.find(c => c.id === task.category_id)
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-700/50 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              index === 0
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                : index === 1
                                ? 'bg-gradient-to-br from-stone-300 to-stone-400'
                                : index === 2
                                ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                                : 'bg-stone-200 dark:bg-stone-600'
                            }`}>
                              <span className={`text-sm font-bold ${index < 3 ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}>
                                {index + 1}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-stone-900 dark:text-white truncate">{task.title}</p>
                              {category && (
                                <p className="text-xs truncate" style={{ color: category.color }}>
                                  {category.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex-shrink-0 ml-2">
                            {formatDuration(task.duration || 0)}
                          </span>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
