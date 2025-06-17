export function sanitizeValue(value: unknown): string | number | null {
  if (typeof value === 'string') {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
    return value.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '')
  }
  if (typeof value === 'number') {
    return value
  }
  return null
}
