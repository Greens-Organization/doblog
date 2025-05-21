import type { DCategory } from '@/infra/db/schemas/blog'

export interface ICategoryDTO extends DCategory {}

export interface ICreateCategoryDTO
  extends Omit<ICategoryDTO, 'id' | 'createdAt' | 'updatedAt' | 'description'> {
  description?: string
}

export type IUpdateCategoryDTO = Partial<
  Omit<ICategoryDTO, 'createdAt' | 'updatedAt'>
>
