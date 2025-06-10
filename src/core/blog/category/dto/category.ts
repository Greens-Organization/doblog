import type { DCategory } from '@/infra/db/schemas/blog'
import { ISubcategoryDTO } from '../../subcategory/dto'

export interface ICategoryDTO extends DCategory {
  totalPost?: number
  subCategories?: ISubcategoryDTO[]
}

export interface IPublicCategoryDTO extends Omit<ICategoryDTO, 'id'> {}

export interface ICreateCategoryDTO
  extends Omit<ICategoryDTO, 'id' | 'createdAt' | 'updatedAt' | 'description'> {
  description?: string
}

export type IUpdateCategoryDTO = Partial<
  Omit<ICategoryDTO, 'createdAt' | 'updatedAt'>
>
