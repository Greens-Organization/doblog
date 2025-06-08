interface Options {
  customSeed?: string
  type?: 'glass' | 'lorelei-neutral' | 'notionists'
}

function generateRandomURLAvatar({
  type = 'glass',
  customSeed
}: Options = {}): string {
  const id = customSeed ?? crypto.randomUUID().slice(0, 8)

  const url = `https://api.dicebear.com/9.x/${type}/svg?seed=${id}`
  return url
}

export { generateRandomURLAvatar }
