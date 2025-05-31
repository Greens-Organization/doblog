import type { DSubcategory } from '@/infra/db/schemas/blog'
import type { ICategoryDTO } from '../../category/dto'

export interface ISubcategoryDTO
  extends Omit<DSubcategory, 'categoryId' | 'isDefault'> {
  category: Omit<ICategoryDTO, 'id' | 'createdAt' | 'updatedAt'>
}

export interface IPublicSubcategoryDTO
  extends Omit<ISubcategoryDTO, 'id' | 'isDefault' | 'categoryId'> {}

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
