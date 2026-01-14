'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Goal } from '@/lib/types/database'
import { GoalCard } from './goal-card'
import { GoalCreateDialog } from './goal-create-dialog'
import { GoalDetailView } from './goal-detail-view'
import { TaskQuickAdd } from '../tasks/task-quick-add'
import { KeyboardShortcuts } from '../keyboard-shortcuts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function GoalsDashboard() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/goals')
      const result = await response.json()

      if (result.success) {
        setGoals(result.data)
      } else {
        console.error('Failed to fetch goals:', result.error)
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteGoal(goalId: string) {
    if (!confirm('Are you sure you want to delete this goal? This will also delete all associated tasks and habits.')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/goals/${goalId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setGoals(goals.filter((g) => g.id !== goalId))
      } else {
        alert('Failed to delete goal')
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
      alert('Failed to delete goal')
    }
  }

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return 'No goals match your search'
    }
    if (statusFilter !== 'all') {
      return `No ${statusFilter} goals`
    }
    return 'No goals yet. Create your first goal to get started!'
  }

  // Show detail view if a goal is selected
  if (selectedGoalId) {
    return (
      <GoalDetailView
        goalId={selectedGoalId}
        onBack={() => setSelectedGoalId(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onQuickAdd={() => setQuickAddOpen(true)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            My Goals
          </h1>
          <p className="text-gray-600 mt-1">Track your progress and achieve your dreams</p>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
          size="lg"
        >
          <Icons.Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Goals',
            value: goals.length,
            icon: Icons.Target,
            color: '#f59e0b',
          },
          {
            label: 'Active',
            value: goals.filter((g) => g.status === 'active').length,
            icon: Icons.Zap,
            color: '#10b981',
          },
          {
            label: 'Completed',
            value: goals.filter((g) => g.status === 'completed').length,
            icon: Icons.Trophy,
            color: '#3b82f6',
          },
          {
            label: 'Avg Progress',
            value: goals.length > 0
              ? `${Math.round(
                  goals.reduce((acc, g) => acc + g.progress_percentage, 0) / goals.length
                )}%`
              : '0%',
            icon: Icons.TrendingUp,
            color: '#8b5cf6',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white border-2 border-gray-100 hover:border-gray-200 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Icons.LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <Icons.List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Goals Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Icons.Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your goals...</p>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6">
            <Icons.Target className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{getEmptyStateMessage()}</h3>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => setSelectedGoalId(goal.id)}
                onEdit={() => {
                  // TODO: Open edit dialog
                  console.log('Edit goal:', goal.id)
                }}
                onDelete={() => handleDeleteGoal(goal.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Dialog */}
      <GoalCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(newGoal) => {
          setGoals([newGoal, ...goals])
        }}
      />

      {/* Quick Add Task Dialog */}
      <TaskQuickAdd
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={() => {
          // Optionally refresh goals to update task counts
          fetchGoals()
        }}
      />
    </div>
  )
}
