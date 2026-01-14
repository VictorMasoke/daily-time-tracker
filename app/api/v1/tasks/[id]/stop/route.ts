// Stop Task Timer
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireAuth,
  calculateDuration,
} from '@/lib/utils/api-helpers'

/**
 * POST /api/v1/tasks/[id]/stop
 * Stop a task timer
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

    if (task.status !== 'in-progress') {
      return errorResponse('CONFLICT', 'Task is not running', 409)
    }

    const now = new Date().toISOString()

    // Find active time entry
    const { data: timeEntry, error: entryError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('task_id', id)
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .single()

    if (entryError && entryError.code !== 'PGRST116') throw entryError

    let duration = 0
    if (timeEntry) {
      duration = calculateDuration(timeEntry.start_time, now)

      // Update time entry
      await supabase
        .from('time_entries')
        .update({
          end_time: now,
          duration,
        })
        .eq('id', timeEntry.id)
    }

    // Update task
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'todo',
        end_time: now,
        duration: (task.duration || 0) + duration,
        actual_duration: (task.actual_duration || 0) + duration,
        updated_at: now,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, category:categories(*), goal:goals(*)')
      .single()

    if (updateError) throw updateError

    return successResponse({
      task: updatedTask,
      duration,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}
