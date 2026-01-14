// Database Types for Coffee Time Tracker
// Generated from database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'
export type TaskStatus = 'todo' | 'idle' | 'in-progress' | 'running' | 'completed' | 'cancelled'
export type TaskType = 'one-time' | 'recurring' | 'habit'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type HabitFrequency = 'daily' | 'weekly' | 'custom'
export type StreakType = 'goal' | 'habit' | 'focus' | 'general'
export type MusicSourceType = 'upload' | 'youtube' | 'soundcloud' | 'spotify'
export type EnergyLevel = 'low' | 'medium' | 'high'

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  timezone?: string
  preferences?: Json
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  is_default?: boolean
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  status: GoalStatus
  color: string
  icon: string
  progress_percentage: number
  metadata: Json
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  goal_id: string | null
  title: string
  description: string | null
  task_type: TaskType
  recurrence_rule: Json | null
  estimated_duration: number | null // minutes
  duration: number // seconds (legacy field, kept for compatibility)
  actual_duration: number // seconds
  priority: Priority
  status: TaskStatus
  is_template: boolean
  template_name: string | null
  tags: string[] | null
  start_time: string | null
  end_time: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  task_id: string | null
  goal_id: string | null
  start_time: string
  end_time: string | null
  duration: number | null // seconds, calculated on end
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  goal_id: string | null
  name: string
  description: string | null
  frequency: HabitFrequency
  target_count: number
  icon: string
  color: string
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_at: string // date
  notes: string | null
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  goal_id: string | null
  habit_id: string | null
  streak_type: StreakType
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}

export interface MusicTrack {
  id: string
  user_id: string | null // null for system tracks
  title: string
  artist: string | null
  album: string | null
  duration: number // seconds
  file_url: string // Supabase Storage URL or streaming URL
  artwork_url: string | null
  source_type: MusicSourceType
  source_id: string | null // external ID for streaming services
  category: string | null
  bpm: number | null
  energy_level: EnergyLevel | null
  is_public: boolean
  play_count: number
  metadata: Json
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: string
  user_id: string
  goal_id: string | null
  name: string
  description: string | null
  is_dynamic: boolean
  generation_rules: Json | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface PlaylistTrack {
  id: string
  playlist_id: string
  track_id: string
  position: number
  added_at: string
}

export interface Note {
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

// ============================================================================
// EXTENDED TYPES (with relations)
// ============================================================================

export interface GoalWithTasks extends Goal {
  tasks: Task[]
  habits: Habit[]
  streak?: Streak
  taskCount: number
  completedTaskCount: number
}

export interface TaskWithRelations extends Task {
  category?: Category
  goal?: Goal
  time_entries: TimeEntry[]
}

export interface HabitWithStreak extends Habit {
  streak?: Streak
  recent_completions: HabitCompletion[]
  completion_count: number
}

export interface PlaylistWithTracks extends Playlist {
  tracks: (PlaylistTrack & { track: MusicTrack })[]
  track_count: number
}

// ============================================================================
// API TYPES (Request/Response)
// ============================================================================

// Goal API Types
export interface CreateGoalRequest {
  title: string
  description?: string
  target_date?: string
  color?: string
  icon?: string
}

export interface UpdateGoalRequest {
  title?: string
  description?: string
  target_date?: string
  status?: GoalStatus
  color?: string
  icon?: string
}

export interface GoalProgressResponse {
  goal_id: string
  progress_percentage: number
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  focus_time: number // total seconds spent on this goal
  estimated_completion_date: string | null
}

// Task API Types
export interface CreateTaskRequest {
  title: string
  description?: string
  category_id?: string
  goal_id?: string
  task_type?: TaskType
  priority?: Priority
  estimated_duration?: number
  recurrence_rule?: Json
  tags?: string[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  category_id?: string
  goal_id?: string
  priority?: Priority
  status?: TaskStatus
  estimated_duration?: number
  tags?: string[]
}

export interface TaskTemplateResponse {
  id: string
  template_name: string
  title: string
  description: string | null
  estimated_duration: number | null
  category_id: string | null
  tags: string[] | null
  usage_count: number
}

export interface FrequentlyUsedTask {
  task: Task
  usage_count: number
  last_used: string
}

// Time Entry API Types
export interface CreateTimeEntryRequest {
  task_id?: string
  goal_id?: string
  start_time: string
  end_time?: string
  notes?: string
}

export interface TimeEntryStatsResponse {
  total_duration: number
  entries_count: number
  by_goal: { goal_id: string; duration: number }[]
  by_category: { category_id: string; duration: number }[]
  by_day: { date: string; duration: number }[]
}

// Habit API Types
export interface CreateHabitRequest {
  name: string
  description?: string
  goal_id?: string
  frequency?: HabitFrequency
  target_count?: number
  icon?: string
  color?: string
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  frequency?: HabitFrequency
  target_count?: number
  icon?: string
  color?: string
}

export interface HabitStatsResponse {
  habit_id: string
  current_streak: number
  longest_streak: number
  completion_rate: number // percentage
  total_completions: number
  completions_this_week: number
  completions_this_month: number
}

// Music API Types
export interface UploadMusicRequest {
  title: string
  artist?: string
  album?: string
  category?: string
  file: File
  artwork?: File
}

export interface CreateMusicTrackRequest {
  title: string
  artist?: string
  album?: string
  duration: number
  file_url: string
  artwork_url?: string
  source_type: MusicSourceType
  source_id?: string
  category?: string
  bpm?: number
  energy_level?: EnergyLevel
  is_public?: boolean
}

export interface CreatePlaylistRequest {
  name: string
  description?: string
  goal_id?: string
  is_dynamic?: boolean
  generation_rules?: Json
  is_public?: boolean
  track_ids?: string[]
}

export interface GenerateDynamicPlaylistRequest {
  categories?: string[]
  energy_levels?: EnergyLevel[]
  bpm_range?: { min: number; max: number }
  max_tracks?: number
}

// Analytics API Types
export interface DashboardStats {
  today_focus_time: number
  active_tasks_count: number
  productivity_score: number
  current_streaks: Streak[]
  goals_at_risk: Goal[]
  total_goals: number
  completed_goals: number
}

export interface ProductivityMetrics {
  focus_time_by_day: { date: string; duration: number }[]
  focus_time_by_category: { category: Category; duration: number }[]
  focus_time_by_goal: { goal: Goal; duration: number }[]
  peak_hours: { hour: number; duration: number }[]
  task_completion_rate: number
  average_task_duration: number
}

export interface FocusTimeBreakdown {
  total_duration: number
  by_goal: { goal: Goal; duration: number; percentage: number }[]
  by_category: { category: Category; duration: number; percentage: number }[]
  by_task_type: { type: TaskType; duration: number; percentage: number }[]
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Json
  }
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      totalPages: number
      totalCount: number
    }
    timestamp: string
  }
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  status?: string[]
  category_id?: string[]
  goal_id?: string[]
  priority?: Priority[]
  date_from?: string
  date_to?: string
  search?: string
}

// ============================================================================
// FORM SCHEMAS (for validation)
// ============================================================================

export interface GoalFormData {
  title: string
  description: string
  target_date: Date | null
  color: string
  icon: string
}

export interface TaskFormData {
  title: string
  description: string
  category_id: string
  goal_id: string
  priority: Priority
  estimated_duration: number
  task_type: TaskType
  tags: string[]
}

export interface HabitFormData {
  name: string
  description: string
  goal_id: string
  frequency: HabitFrequency
  target_count: number
  icon: string
  color: string
}

// ============================================================================
// RECURRENCE RULE TYPE
// ============================================================================

export interface RecurrenceRule {
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number // every X days/weeks/months
  days?: number[] // day of week (0 = Sunday) for weekly pattern
  day_of_month?: number // for monthly pattern
  end_date?: string
  occurrences?: number // number of times to repeat
}

// ============================================================================
// GENERATION RULES TYPE
// ============================================================================

export interface PlaylistGenerationRules {
  categories?: string[]
  energy_levels?: EnergyLevel[]
  bpm?: {
    min?: number
    max?: number
  }
  max_duration?: number // max total duration in seconds
  exclude_track_ids?: string[]
  shuffle?: boolean
}
