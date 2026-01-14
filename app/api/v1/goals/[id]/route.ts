// Goals API - Get, Update, Delete specific goal
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  validateRequest,
  isErrorResponse,
  requireAuth,
} from '@/lib/utils/api-helpers'
import { updateGoalSchema } from '@/lib/validations/schemas'
import type { UpdateGoalRequest } from '@/lib/types/database'

/**
 * GET /api/v1/goals/[id]
 * Get a specific goal with its tasks and habits
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    const { data: goal, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!goal) {
      return errorResponse('NOT_FOUND', 'Goal not found', 404)
    }

    // Get associated tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('goal_id', id)
      .order('created_at', { ascending: false })

    // Get associated habits
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('goal_id', id)

    // Get streak information
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('goal_id', id)
      .eq('streak_type', 'goal')
      .single()

    const goalWithRelations = {
      ...goal,
      tasks: tasks || [],
      habits: habits || [],
      streak: streak || null,
      taskCount: tasks?.length || 0,
      completedTaskCount: tasks?.filter(t => t.status === 'completed').length || 0,
    }

    return successResponse(goalWithRelations)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}

/**
 * PATCH /api/v1/goals/[id]
 * Update a goal
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    // Check if goal exists and belongs to user
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existingGoal) {
      return errorResponse('NOT_FOUND', 'Goal not found', 404)
    }

    const validated = await validateRequest<UpdateGoalRequest>(request, updateGoalSchema)
    if (isErrorResponse(validated)) return validated

    const { data, error } = await supabase
      .from('goals')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return successResponse(data)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}

/**
 * DELETE /api/v1/goals/[id]
 * Delete a goal (and cascade delete tasks and habits)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    // Check if goal exists and belongs to user
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existingGoal) {
      return errorResponse('NOT_FOUND', 'Goal not found', 404)
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return successResponse({ success: true, id })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}
