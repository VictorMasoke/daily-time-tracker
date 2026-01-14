// Complete Task
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireAuth,
} from '@/lib/utils/api-helpers'

/**
 * POST /api/v1/tasks/[id]/complete
 * Mark a task as completed
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

    const now = new Date().toISOString()

    // If task is currently running, stop it first
    if (task.status === 'in-progress') {
      // Find and close active time entry
      const { data: timeEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single()

      if (timeEntry) {
        const duration = Math.floor(
          (new Date(now).getTime() - new Date(timeEntry.start_time).getTime()) / 1000
        )

        await supabase
          .from('time_entries')
          .update({
            end_time: now,
            duration,
          })
          .eq('id', timeEntry.id)
      }
    }

    // Update task to completed
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: now,
        end_time: now,
        updated_at: now,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, category:categories(*), goal:goals(*)')
      .single()

    if (updateError) throw updateError

    // Note: Goal progress will be automatically updated by the database trigger

    return successResponse(updatedTask)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return errorResponse('UNAUTHORIZED', 'Authentication required', 401)
    }
    return handleError(error)
  }
}
