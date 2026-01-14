'use client'

import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Goal } from '@/lib/types/database'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface GoalCardProps {
  goal: Goal & { taskCount?: number; completedTaskCount?: number }
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function GoalCard({ goal, onClick, onEdit, onDelete }: GoalCardProps) {
  const Icon = (Icons as any)[goal.icon] || Icons.Target

  const getStatusColor = () => {
    switch (goal.status) {
      case 'active':
        return 'bg-green-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-blue-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (goal.status) {
      case 'active':
        return 'Active'
      case 'paused':
        return 'Paused'
      case 'completed':
        return 'Completed'
      case 'archived':
        return 'Archived'
      default:
        return goal.status
    }
  }

  const targetDateText = goal.target_date
    ? `Due ${formatDistanceToNow(new Date(goal.target_date), { addSuffix: true })}`
    : 'No deadline'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div
        className="relative p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${goal.color}15 0%, ${goal.color}05 100%)`,
          borderColor: `${goal.color}40`,
          boxShadow: `0 4px 20px ${goal.color}20`,
        }}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-1.5`} />
            {getStatusText()}
          </Badge>
        </div>

        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="p-3 rounded-xl shrink-0"
            style={{
              backgroundColor: `${goal.color}30`,
              boxShadow: `0 4px 12px ${goal.color}20`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: goal.color }} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate" style={{ color: goal.color }}>
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-bold text-lg" style={{ color: goal.color }}>
              {Math.round(goal.progress_percentage)}%
            </span>
          </div>
          <Progress
            value={goal.progress_percentage}
            className="h-2"
            style={{
              backgroundColor: `${goal.color}20`,
            }}
            indicatorStyle={{ backgroundColor: goal.color }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {goal.taskCount !== undefined && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Icons.ListTodo className="w-4 h-4" />
                <span>
                  {goal.completedTaskCount || 0}/{goal.taskCount} tasks
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Icons.Calendar className="w-3.5 h-3.5" />
            <span>{targetDateText}</span>
          </div>
        </div>

        {/* Hover Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center gap-2 bg-black/5 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Icons.Edit className="w-5 h-5 text-blue-600" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Icons.Trash2 className="w-5 h-5 text-red-600" />
            </motion.button>
          )}
        </motion.div>

        {/* Completion Celebration */}
        {goal.status === 'completed' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full shadow-lg">
              <Icons.Trophy className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
