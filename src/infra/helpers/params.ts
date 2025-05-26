import type { z } from 'zod/v4'

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

function extractAndValidatePathParam<T extends z.ZodSchema<any>>(
  request: Request,
  schema: T
): ValidationResult<z.infer<T>> {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  const param = pathParts[pathParts.length - 1]

  const parsed = schema.safeParse({ id: param })

  if (!parsed.success) {
    return { success: false, error: parsed.error }
  }

  return { success: true, data: parsed.data }
}

export { extractAndValidatePathParam }
