// Tasks API - Enhanced with Goal Support
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  validateRequest,
  isErrorResponse,
  requireAuth,
  getPaginationParams,
  calculatePagination,
  applyPagination,
  buildTaskFilters,
} from '@/lib/utils/api-helpers'
import { createTaskSchema, taskFilterSchema } from '@/lib/validations/schemas'
import type { Task, CreateTaskRequest } from '@/lib/types/database'

/**
 * GET /api/v1/tasks
 * List all tasks for the authenticated user with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)

    const searchParams = request.nextUrl.searchParams
    const { page, pageSize, sortBy, sortOrder } = getPaginationParams(searchParams)

    // Parse filters
    const status = searchParams.getAll('status')
    const category_id = searchParams.getAll('category_id')
    const goal_id = searchParams.getAll('goal_id')
    const priority = searchParams.getAll('priority')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('tasks')
      .select('*, category:categories(*), goal:goals(*)', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    query = buildTaskFilters(query, {
      status,
      category_id,
      goal_id,
      priority,
      date_from: date_from || undefined,
      date_to: date_to || undefined,
      search: search || undefined,
    })

    // Apply sorting
    const sortColumn = sortBy || 'created_at'
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = applyPagination(query, page, pageSize)

    const { data, error, count } = await query

    if (error) throw error

    return successResponse(data || [], {
      ...calculatePagination(count || 0, page, pageSize),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}

/**
 * POST /api/v1/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)

    const validatedResult = await validateRequest<CreateTaskRequest>(request, createTaskSchema)
    if (isErrorResponse(validatedResult)) return validatedResult

    const validated = validatedResult as CreateTaskRequest

    // Verify goal exists if provided
    if (validated.goal_id) {
      const { data: goal } = await supabase
        .from('goals')
        .select('id')
        .eq('id', validated.goal_id)
        .eq('user_id', userId)
        .single()

      if (!goal) {
        return errorResponse('NOT_FOUND', 'Goal not found', 404)
      }
    }

    // Verify category exists if provided
    if (validated.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', validated.category_id)
        .eq('user_id', userId)
        .single()

      if (!category) {
        return errorResponse('NOT_FOUND', 'Category not found', 404)
      }
    }

    const taskData = {
      user_id: userId,
      title: validated.title,
      description: validated.description || null,
      category_id: validated.category_id || null,
      goal_id: validated.goal_id || null,
      task_type: validated.task_type || 'one-time',
      priority: validated.priority || 'medium',
      estimated_duration: validated.estimated_duration || null,
      recurrence_rule: validated.recurrence_rule || null,
      tags: validated.tags || null,
      status: 'todo',
      duration: 0,
      actual_duration: 0,
      is_template: false,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select('*, category:categories(*), goal:goals(*)')
      .single()

    if (error) throw error

    return successResponse(data, { timestamp: new Date().toISOString() })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}
