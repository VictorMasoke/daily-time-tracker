'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGoalSchema, type CreateGoalInput } from '@/lib/validations/schemas'
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

interface GoalCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (goal: any) => void
}

const COLORS = [
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
]

const ICONS = [
  'Target',
  'Trophy',
  'Rocket',
  'Heart',
  'Star',
  'Zap',
  'Book',
  'Briefcase',
  'Dumbbell',
  'GraduationCap',
  'Home',
  'Lightbulb',
  'Music',
  'Palette',
  'Plane',
  'Sparkles',
]

export function GoalCreateDialog({ open, onOpenChange, onSuccess }: GoalCreateDialogProps) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value)
  const [selectedIcon, setSelectedIcon] = useState('Target')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      color: COLORS[0].value,
      icon: 'Target',
    },
  })

  const onSubmit = async (data: CreateGoalInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          color: selectedColor,
          icon: selectedIcon,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(result.data)
        reset()
        onOpenChange(false)
      } else {
        alert(result.error?.message || 'Failed to create goal')
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
      alert('Failed to create goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Goal</DialogTitle>
          <DialogDescription>
            Set a meaningful goal and track your progress towards achieving it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Learn TypeScript, Lose 20 pounds, Read 12 books"
              {...register('title')}
              className="text-lg"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal in detail..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              {...register('target_date')}
            />
            {errors.target_date && (
              <p className="text-sm text-red-600">{errors.target_date.message}</p>
            )}
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((iconName) => {
                const IconComponent = (Icons as any)[iconName]
                return (
                  <motion.button
                    key={iconName}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedIcon === iconName
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <motion.button
                  key={color.value}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    selectedColor === color.value
                      ? 'ring-4 ring-offset-2 ring-gray-400'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl border-2"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}15 0%, ${selectedColor}05 100%)`,
                borderColor: `${selectedColor}40`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${selectedColor}30` }}
                >
                  {(() => {
                    const IconComponent = (Icons as any)[selectedIcon]
                    return <IconComponent className="w-6 h-6" style={{ color: selectedColor }} />
                  })()}
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: selectedColor }}>
                    {register('title').name ? 'Your Goal Title' : 'Example Goal'}
                  </h3>
                  <p className="text-sm text-gray-600">0% complete</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
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
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
