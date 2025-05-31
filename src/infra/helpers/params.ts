import type { zod } from '../lib/zod'

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: zod.ZodError }

function extractAndValidatePathParams<T extends zod.ZodSchema<any>>(
  request: Request,
  schema: T,
  paramNames: string[]
): ValidationResult<zod.infer<T>> {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/').filter(Boolean) // remove vazios

  // Pega os últimos N segmentos do path, na ordem dos paramNames
  const paramsFromPath = pathParts.slice(-paramNames.length)

  // Monta o objeto { slug: 'foo', id: '123', asd: 'bar' }
  const paramsObj = Object.fromEntries(
    paramNames.map((name, idx) => [name, paramsFromPath[idx]])
  )

  const parsed = schema.safeParse(paramsObj)

  if (!parsed.success) {
    return { success: false, error: parsed.error }
  }

  return { success: true, data: parsed.data }
}

export { extractAndValidatePathParams }
