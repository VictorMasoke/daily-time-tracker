// Validation Schemas using Zod
import { z } from 'zod'

// ============================================================================
// GOAL SCHEMAS
// ============================================================================

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  target_date: z.string().datetime().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().min(1).optional(),
})

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  target_date: z.string().datetime().optional().nullable(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().min(1).optional(),
})

// ============================================================================
// TASK SCHEMAS
// ============================================================================

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  goal_id: z.string().uuid().optional().nullable(),
  task_type: z.enum(['one-time', 'recurring', 'habit']).default('one-time'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimated_duration: z.number().int().positive().optional(),
  recurrence_rule: z.object({
    pattern: z.enum(['daily', 'weekly', 'monthly', 'custom']),
    interval: z.number().int().positive(),
    days: z.array(z.number().int().min(0).max(6)).optional(),
    day_of_month: z.number().int().min(1).max(31).optional(),
    end_date: z.string().datetime().optional(),
    occurrences: z.number().int().positive().optional(),
  }).optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  goal_id: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'idle', 'in-progress', 'running', 'completed', 'cancelled']).optional(),
  estimated_duration: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
})

export const createTaskTemplateSchema = z.object({
  template_name: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  estimated_duration: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
})

// ============================================================================
// TIME ENTRY SCHEMAS
// ============================================================================

export const createTimeEntrySchema = z.object({
  task_id: z.string().uuid().optional().nullable(),
  goal_id: z.string().uuid().optional().nullable(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.task_id || data.goal_id,
  { message: 'Either task_id or goal_id must be provided' }
)

export const updateTimeEntrySchema = z.object({
  end_time: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
})

// ============================================================================
// HABIT SCHEMAS
// ============================================================================

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  goal_id: z.string().uuid().optional().nullable(),
  frequency: z.enum(['daily', 'weekly', 'custom']).default('daily'),
  target_count: z.number().int().positive().default(1),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const updateHabitSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
  target_count: z.number().int().positive().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const completeHabitSchema = z.object({
  completed_at: z.string().date().optional(), // defaults to today
  notes: z.string().max(500).optional(),
})

// ============================================================================
// MUSIC SCHEMAS
// ============================================================================

export const createMusicTrackSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  artist: z.string().max(200).optional(),
  album: z.string().max(200).optional(),
  duration: z.number().int().positive('Duration must be positive'),
  file_url: z.string().url('Invalid file URL'),
  artwork_url: z.string().url().optional(),
  source_type: z.enum(['upload', 'youtube', 'soundcloud', 'spotify']).default('upload'),
  source_id: z.string().optional(),
  category: z.string().optional(),
  bpm: z.number().int().positive().optional(),
  energy_level: z.enum(['low', 'medium', 'high']).optional(),
  is_public: z.boolean().default(false),
})

export const updateMusicTrackSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  artist: z.string().max(200).optional(),
  album: z.string().max(200).optional(),
  artwork_url: z.string().url().optional().nullable(),
  category: z.string().optional(),
  bpm: z.number().int().positive().optional().nullable(),
  energy_level: z.enum(['low', 'medium', 'high']).optional().nullable(),
  is_public: z.boolean().optional(),
})

export const createPlaylistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(200),
  description: z.string().max(1000).optional(),
  goal_id: z.string().uuid().optional().nullable(),
  is_dynamic: z.boolean().default(false),
  generation_rules: z.object({
    categories: z.array(z.string()).optional(),
    energy_levels: z.array(z.enum(['low', 'medium', 'high'])).optional(),
    bpm: z.object({
      min: z.number().int().positive().optional(),
      max: z.number().int().positive().optional(),
    }).optional(),
    max_duration: z.number().int().positive().optional(),
    exclude_track_ids: z.array(z.string().uuid()).optional(),
    shuffle: z.boolean().optional(),
  }).optional().nullable(),
  is_public: z.boolean().default(false),
  track_ids: z.array(z.string().uuid()).optional(),
})

export const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  is_public: z.boolean().optional(),
})

export const generateDynamicPlaylistSchema = z.object({
  categories: z.array(z.string()).optional(),
  energy_levels: z.array(z.enum(['low', 'medium', 'high'])).optional(),
  bpm_range: z.object({
    min: z.number().int().positive().optional(),
    max: z.number().int().positive().optional(),
  }).optional(),
  max_tracks: z.number().int().positive().max(100).optional(),
})

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().min(1, 'Icon is required'),
  sort_order: z.number().int().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().min(1).optional(),
  sort_order: z.number().int().optional(),
})

// ============================================================================
// NOTE SCHEMAS
// ============================================================================

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().max(10000, 'Content must be less than 10000 characters'),
  category_id: z.string().uuid().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  is_pinned: z.boolean().default(false),
})

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(10000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  is_pinned: z.boolean().optional(),
})

// ============================================================================
// QUERY SCHEMAS (for filtering and pagination)
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const taskFilterSchema = z.object({
  status: z.array(z.enum(['todo', 'idle', 'in-progress', 'running', 'completed', 'cancelled'])).optional(),
  category_id: z.array(z.string().uuid()).optional(),
  goal_id: z.array(z.string().uuid()).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  search: z.string().optional(),
}).merge(paginationSchema)

export const goalFilterSchema = z.object({
  status: z.array(z.enum(['active', 'paused', 'completed', 'archived'])).optional(),
  search: z.string().optional(),
}).merge(paginationSchema)

export const musicFilterSchema = z.object({
  category: z.array(z.string()).optional(),
  source_type: z.array(z.enum(['upload', 'youtube', 'soundcloud', 'spotify'])).optional(),
  energy_level: z.array(z.enum(['low', 'medium', 'high'])).optional(),
  search: z.string().optional(),
}).merge(paginationSchema)

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const analyticsQuerySchema = z.object({
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  goal_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateTaskTemplateInput = z.infer<typeof createTaskTemplateSchema>
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>
export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>
export type CreateMusicTrackInput = z.infer<typeof createMusicTrackSchema>
export type UpdateMusicTrackInput = z.infer<typeof updateMusicTrackSchema>
export type CreatePlaylistInput = z.infer<typeof createPlaylistSchema>
export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>
export type GenerateDynamicPlaylistInput = z.infer<typeof generateDynamicPlaylistSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type TaskFilterInput = z.infer<typeof taskFilterSchema>
export type GoalFilterInput = z.infer<typeof goalFilterSchema>
export type MusicFilterInput = z.infer<typeof musicFilterSchema>
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>
