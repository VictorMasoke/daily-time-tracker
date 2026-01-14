// Tasks API - Individual Task Operations
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  validateRequest,
  isErrorResponse,
  requireAuth,
  calculateDuration,
} from '@/lib/utils/api-helpers'
import { updateTaskSchema } from '@/lib/validations/schemas'
import type { UpdateTaskRequest } from '@/lib/types/database'

/**
 * GET /api/v1/tasks/[id]
 * Get a specific task with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*, category:categories(*), goal:goals(*), time_entries(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404)
    }

    return successResponse(task)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}

/**
 * PATCH /api/v1/tasks/[id]
 * Update a task
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    // Check if task exists and belongs to user
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existingTask) {
      return errorResponse('NOT_FOUND', 'Task not found', 404)
    }

    const validatedResult = await validateRequest<UpdateTaskRequest>(request, updateTaskSchema)
    if (isErrorResponse(validatedResult)) return validatedResult

    const validated = validatedResult as UpdateTaskRequest

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, category:categories(*), goal:goals(*)')
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
 * DELETE /api/v1/tasks/[id]
 * Delete a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    // Check if task exists and belongs to user
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existingTask) {
      return errorResponse('NOT_FOUND', 'Task not found', 404)
    }

    const { error } = await supabase
      .from('tasks')
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
