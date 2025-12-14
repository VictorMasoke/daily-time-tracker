// app/types.ts
export type User = {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
  updated_at: string
  notes?: string
}

export type Note = {
  id: string
  user_id: string
  category_id: string | null
  title: string
  content: string
  color: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  user_id: string
  category_id: string
  title: string
  description?: string
  duration: number
  status: 'idle' | 'running' | 'completed'
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
  category?: Category
}

export type AnalyticsData = {
  totalTime: number
  tasksCompleted: number
  averageFocusTime: number
  productivityScore: number
  dailyTrends: Array<{ date: string; time: number }>
  categoryDistribution: Array<{ name: string; time: number; color: string }>
  peakHours: Array<{ hour: number; time: number }>
}
