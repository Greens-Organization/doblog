export enum DicebearTypes {
  glass = 'glass',
  loreleiNeutral = 'lorelei-neutral',
  notionists = 'notionists'
}

export interface Options {
  customSeed?: string
  type?: DicebearTypes
}

function generateRandomURLAvatar({
  type = DicebearTypes.glass,
  customSeed
}: Options = {}): string {
  const id = customSeed ?? crypto.randomUUID().slice(0, 8)

  const url = `https://api.dicebear.com/9.x/${type}/svg?seed=${id}`
  return url
}

export { generateRandomURLAvatar }
