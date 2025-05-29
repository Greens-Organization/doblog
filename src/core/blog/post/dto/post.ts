import type { DPost } from '@/infra/db/schemas/blog'

export interface IPostDTO extends DPost {}

export interface IPostCreateDTO
  extends Omit<
    IPostDTO,
    'id' | 'createdAt' | 'updatedAt' | 'status' | 'authorId' | 'status'
  > {}
