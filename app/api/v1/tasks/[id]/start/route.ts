// Start Task Timer
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireAuth,
} from '@/lib/utils/api-helpers'

/**
 * POST /api/v1/tasks/[id]/start
 * Start a task timer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const userId = await requireAuth(supabase)
    const { id } = await params

    // Get the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (taskError) throw taskError
    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404)
    }

    if (task.status === 'running') {
      return errorResponse('CONFLICT', 'Task is already running', 409)
    }

    const now = new Date().toISOString()

    // Update task status
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'in-progress',
        start_time: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, category:categories(*), goal:goals(*)')
      .single()

    if (updateError) throw updateError

    // Create time entry
    const { data: timeEntry, error: timeError } = await supabase
      .from('time_entries')
      .insert({
        user_id: userId,
        task_id: id,
        goal_id: task.goal_id,
        start_time: now,
      })
      .select()
      .single()

    if (timeError) throw timeError

    return successResponse({
      task: updatedTask,
      time_entry: timeEntry,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}
