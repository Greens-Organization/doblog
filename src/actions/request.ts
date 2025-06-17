export function makeRequestQuery(value: Record<string, string> | string) {
  if (typeof value === 'string') {
    const searchParams = new URLSearchParams(value)
    return `?${searchParams.toString()}`
  }

  const searchParams = new URLSearchParams(value)

  return `?${searchParams.toString()}`
}
