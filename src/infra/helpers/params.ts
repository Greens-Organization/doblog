import type { zod } from '../lib/zod'

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: zod.ZodError }

function extractAndValidatePathParam<T extends zod.ZodSchema<any>>(
  request: Request,
  schema: T
): ValidationResult<zod.infer<T>> {
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
