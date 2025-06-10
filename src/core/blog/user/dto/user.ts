import type { DUser } from '@/infra/db/schemas/auth'
import type { ICategoryDTO } from '../../category/dto'

export interface IUserDTO extends DUser {
  categories?: ICategoryDTO[]
  totalPosts?: number
  totalPostPublished?: number
  totalPostDraft?: number
}
