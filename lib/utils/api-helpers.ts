// API Helper Functions
import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/types/database'
import { ZodError } from 'zod'

/**
 * Create a success response
 */
export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(error: ZodError): NextResponse<ApiResponse<never>> {
  const formattedErrors = error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }))

  return errorResponse('VALIDATION_ERROR', 'Validation failed', 400, formattedErrors)
}

/**
 * Handle general errors
 */
export function handleError(error: unknown): NextResponse<ApiResponse<never>> {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return handleValidationError(error)
  }

  if (error instanceof Error) {
    // Check for Supabase errors
    if ('code' in error) {
      const supabaseError = error as any
      return errorResponse(
        supabaseError.code || 'DATABASE_ERROR',
        supabaseError.message,
        500,
        supabaseError.details
      )
    }

    return errorResponse('SERVER_ERROR', error.message, 500)
  }

  return errorResponse('UNKNOWN_ERROR', 'An unknown error occurred', 500)
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(request: Request, schema: any): Promise<T | NextResponse> {
  try {
    const body = await request.json()
    const validated = schema.parse(body)
    return validated as T
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error)
    }
    throw error
  }
}

/**
 * Check if a response is an error response
 */
export function isErrorResponse(response: any): response is NextResponse<ApiResponse<never>> {
  return response instanceof NextResponse
}

/**
 * Extract pagination params from URL
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '20'),
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
  }
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(totalCount: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    pagination: {
      page,
      pageSize,
      totalPages,
      totalCount,
    },
  }
}

/**
 * Build Supabase query with pagination
 */
export function applyPagination(query: any, page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return query.range(from, to)
}

/**
 * Build filter query for tasks
 */
export function buildTaskFilters(query: any, filters: {
  status?: string[]
  category_id?: string[]
  goal_id?: string[]
  priority?: string[]
  date_from?: string
  date_to?: string
  search?: string
}) {
  if (filters.status?.length) {
    query = query.in('status', filters.status)
  }

  if (filters.category_id?.length) {
    query = query.in('category_id', filters.category_id)
  }

  if (filters.goal_id?.length) {
    query = query.in('goal_id', filters.goal_id)
  }

  if (filters.priority?.length) {
    query = query.in('priority', filters.priority)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  return query
}

/**
 * Calculate duration between two timestamps
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.floor((end.getTime() - start.getTime()) / 1000) // seconds
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Check if user is authenticated and return user ID
 */
export async function getUserId(supabase: any): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user.id
}

/**
 * Require authentication (throws error if not authenticated)
 */
export async function requireAuth(supabase: any): Promise<string> {
  const userId = await getUserId(supabase)

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return userId
}

/**
 * Parse search params with type safety
 */
export function parseSearchParam(
  searchParams: URLSearchParams,
  key: string,
  type: 'string' | 'number' | 'boolean' | 'array' = 'string'
): any {
  const value = searchParams.get(key)

  if (!value) return undefined

  switch (type) {
    case 'number':
      return parseInt(value, 10)
    case 'boolean':
      return value === 'true'
    case 'array':
      return value.split(',').filter(Boolean)
    default:
      return value
  }
}

/**
 * Get multiple search params as array
 */
export function getSearchParamArray(searchParams: URLSearchParams, key: string): string[] {
  const values = searchParams.getAll(key)
  if (values.length === 0) {
    const single = searchParams.get(key)
    return single ? single.split(',').filter(Boolean) : []
  }
  return values
}
