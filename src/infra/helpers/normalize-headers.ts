export function normalizeHeaders(
  headers?: HeadersInit
): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {}
    headers.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.map(([k, v]) => [String(k), String(v)]))
  }
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [String(k), String(v as string)])
  )
}
