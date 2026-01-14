'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Goal, Task } from '@/lib/types/database'
import { TaskQuickAdd } from '../tasks/task-quick-add'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface GoalDetailViewProps {
  goalId: string
  onBack: () => void
}

export function GoalDetailView({ goalId, onBack }: GoalDetailViewProps) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => {
    fetchGoalDetails()
  }, [goalId])

  async function fetchGoalDetails() {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/goals/${goalId}`)
      const result = await response.json()

      if (result.success) {
        setGoal(result.data)
        setTasks(result.data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to fetch goal details:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/complete`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        // Refresh goal details to get updated progress
        await fetchGoalDetails()
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        await fetchGoalDetails()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="text-center py-20">
        <p>Goal not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const Icon = (Icons as any)[goal.icon] || Icons.Target
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const activeTasks = tasks.filter((t) => t.status !== 'completed')

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <Icons.ArrowLeft className="w-4 h-4 mr-2" />
          Back to Goals
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: `${goal.color}30` }}
            >
              <Icon className="w-8 h-8" style={{ color: goal.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: goal.color }}>
                {goal.title}
              </h1>
              {goal.description && (
                <p className="text-gray-600 mb-3">{goal.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {goal.target_date && (
                  <div className="flex items-center gap-1.5">
                    <Icons.Calendar className="w-4 h-4" />
                    <span>
                      Due {formatDistanceToNow(new Date(goal.target_date), { addSuffix: true })}
                    </span>
                  </div>
                )}
                <Badge variant="secondary">
                  {goal.status}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setQuickAddOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="p-6 rounded-2xl bg-white border-2 border-gray-100">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Overall Progress</h3>
            <span className="text-2xl font-bold" style={{ color: goal.color }}>
              {Math.round(goal.progress_percentage)}%
            </span>
          </div>
          <Progress
            value={goal.progress_percentage}
            className="h-3"
            style={{ backgroundColor: `${goal.color}20` }}
            indicatorStyle={{ backgroundColor: goal.color }}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedTasks.length} of {tasks.length} tasks completed</span>
            <span>{tasks.length - completedTasks.length} remaining</span>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tasks</h2>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Icons.ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No tasks yet</p>
            <Button
              onClick={() => setQuickAddOpen(true)}
              variant="outline"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create First Task
            </Button>
          </div>
        ) : (
          <>
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Active ({activeTasks.length})
                </h3>
                <AnimatePresence>
                  {activeTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      goalColor={goal.color}
                      onComplete={() => handleCompleteTask(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Completed ({completedTasks.length})
                </h3>
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      goalColor={goal.color}
                      onDelete={() => handleDeleteTask(task.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Add Dialog */}
      <TaskQuickAdd
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        preselectedGoalId={goalId}
        onSuccess={() => fetchGoalDetails()}
      />
    </motion.div>
  )
}

interface TaskItemProps {
  task: Task
  goalColor: string
  onComplete?: () => void
  onDelete: () => void
}

function TaskItem({ task, goalColor, onComplete, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed'

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-xl border-2 transition-all ${
        isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {!isCompleted && onComplete && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onComplete}
            className="p-1 rounded-full border-2 hover:bg-green-50 transition-colors mt-0.5"
            style={{ borderColor: goalColor }}
          >
            <Icons.Check className="w-4 h-4" style={{ color: goalColor }} />
          </motion.button>
        )}

        {isCompleted && (
          <div className="p-1 rounded-full bg-green-100 mt-0.5">
            <Icons.CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}
            >
              {task.title}
            </h4>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: priorityColors[task.priority] }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-1 hover:bg-red-50 rounded transition-colors"
              >
                <Icons.Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
              </motion.button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          {task.estimated_duration && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
              <Icons.Clock className="w-3.5 h-3.5" />
              <span>{task.estimated_duration} minutes</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
