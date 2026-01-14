'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, type CreateTaskInput } from '@/lib/validations/schemas'
import { Goal, Category } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TaskQuickAddProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (task: any) => void
  preselectedGoalId?: string
}

export function TaskQuickAdd({
  open,
  onOpenChange,
  onSuccess,
  preselectedGoalId,
}: TaskQuickAddProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string>(preselectedGoalId || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPriority, setSelectedPriority] = useState<string>('medium')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'medium',
      task_type: 'one-time',
    },
  })

  useEffect(() => {
    if (open) {
      fetchGoals()
      fetchCategories()
      if (preselectedGoalId) {
        setSelectedGoal(preselectedGoalId)
        setValue('goal_id', preselectedGoalId)
      }
    }
  }, [open, preselectedGoalId])

  async function fetchGoals() {
    try {
      const response = await fetch('/api/v1/goals')
      const result = await response.json()
      if (result.success) {
        setGoals(result.data.filter((g: Goal) => g.status === 'active'))
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    }
  }

  async function fetchCategories() {
    try {
      // Fetch categories from your existing system
      // For now, we'll use a simple fetch
      const response = await fetch('/api/v1/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const onSubmit = async (data: CreateTaskInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          goal_id: selectedGoal || null,
          category_id: selectedCategory || null,
          priority: selectedPriority,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(result.data)
        reset()
        setSelectedGoal('')
        setSelectedCategory('')
        setSelectedPriority('medium')
        onOpenChange(false)
      } else {
        alert(result.error?.message || 'Failed to create task')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const priorityColors = {
    low: { bg: '#10b981', text: 'Low' },
    medium: { bg: '#f59e0b', text: 'Medium' },
    high: { bg: '#f97316', text: 'High' },
    urgent: { bg: '#ef4444', text: 'Urgent' },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Icons.Plus className="w-6 h-6 text-orange-600" />
            Quick Add Task
          </DialogTitle>
          <DialogDescription>
            Quickly create a new task and assign it to a goal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning workout, Write blog post..."
              {...register('title')}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message as string}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add details..."
              rows={2}
              {...register('description')}
            />
          </div>

          {/* Goal Selection */}
          <div className="space-y-2">
            <Label>Goal (Optional)</Label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a goal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Goal</SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = (Icons as any)[goal.icon] || Icons.Target
                        return <IconComponent className="w-4 h-4" style={{ color: goal.color }} />
                      })()}
                      <span>{goal.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(priorityColors).map(([key, { bg, text }]) => (
                <motion.button
                  key={key}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPriority(key)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedPriority === key
                      ? 'ring-2 ring-offset-2 shadow-lg text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={
                    selectedPriority === key
                      ? { backgroundColor: bg }
                      : {}
                  }
                >
                  {text}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
            <Input
              id="estimated_duration"
              type="number"
              placeholder="30"
              {...register('estimated_duration', { valueAsNumber: true })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
