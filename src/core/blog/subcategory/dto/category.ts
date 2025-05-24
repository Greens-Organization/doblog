import type { DSubcategory } from '@/infra/db/schemas/blog'
import type { ICategoryDTO } from '../../category/dto'

export interface ISubcategoryDTO extends Omit<DSubcategory, 'categoryId'> {
  category: Omit<ICategoryDTO, 'createdAt' | 'updatedAt'>
}

export interface ICreateSubcategoryDTO
  extends Omit<
    ISubcategoryDTO,
    'id' | 'createdAt' | 'updatedAt' | 'description'
  > {
  description?: string
}

export type IUpdateSubcategoryDTO = Partial<
  Omit<ISubcategoryDTO, 'createdAt' | 'updatedAt'>
>
