import { zod } from '@/infra/lib/zod'

export const createThumbnailSchema = () => {
  return zod.object({
    type: zod.string(),
    name: zod.string()
  })
}
