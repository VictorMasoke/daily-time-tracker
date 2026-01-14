// Goals API - List and Create
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
} from '@/lib/utils/api-helpers'
import { createGoalSchema, goalFilterSchema } from '@/lib/validations/schemas'
import type { Goal, CreateGoalRequest } from '@/lib/types/database'

/**
 * GET /api/v1/goals
 * List all goals for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)

    const searchParams = request.nextUrl.searchParams
    const { page, pageSize, sortBy, sortOrder } = getPaginationParams(searchParams)

    // Parse filters
    const status = searchParams.getAll('status')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('goals')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (status.length > 0) {
      query = query.in('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const sortColumn = sortBy || 'created_at'
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = applyPagination(query, page, pageSize)

    const { data, error, count } = await query

    if (error) throw error

    // Get task counts for each goal
    const goalsWithCounts = await Promise.all(
      (data || []).map(async (goal) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status')
          .eq('goal_id', goal.id)

        const taskCount = tasks?.length || 0
        const completedTaskCount = tasks?.filter(t => t.status === 'completed').length || 0

        return {
          ...goal,
          taskCount,
          completedTaskCount,
        }
      })
    )

    return successResponse(goalsWithCounts, {
      ...calculatePagination(count || 0, page, pageSize),
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}

/**
 * POST /api/v1/goals
 * Create a new goal
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)

    const validatedResult = await validateRequest<CreateGoalRequest>(request, createGoalSchema)
    if (isErrorResponse(validatedResult)) return validatedResult

    const validated = validatedResult as CreateGoalRequest

    const goalData = {
      user_id: userId,
      title: validated.title,
      description: validated.description || null,
      target_date: validated.target_date || null,
      color: validated.color || '#f59e0b',
      icon: validated.icon || 'Target',
      status: 'active' as const,
      progress_percentage: 0,
      metadata: {},
    }

    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
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
