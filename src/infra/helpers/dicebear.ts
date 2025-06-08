interface Options {
  type?: 'glass' | 'lorelei-neutral'
}

function generateRandomURLAvatar({ type = 'glass' }: Options = {}): string {
  const id = crypto.randomUUID().slice(0, 8)

  const url = `https://api.dicebear.com/9.x/${type}/svg?seed=${id}`
  return url
}

export { generateRandomURLAvatar }
