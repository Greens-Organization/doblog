import type { DPost } from '@/infra/db/schemas/blog'
import type { ICategoryDTO } from '../../category/dto'
import type { IUserDTO } from '../../user/dto'

export interface IPostDTO extends DPost {}

export interface IGetPublishedPostDTO
  extends Omit<IPostDTO, 'id' | 'authorId' | 'subcategoryId'> {
  author: Pick<IUserDTO, 'name' | 'image'>
  subcategory: Pick<ICategoryDTO, 'name' | 'slug' | 'description'> & {
    category: Pick<ICategoryDTO, 'name' | 'slug' | 'description'>
  }
}

export interface IGetPostDTO extends IPostDTO {
  author: Pick<IUserDTO, 'id' | 'name' | 'image'>
  subcategory: Pick<ICategoryDTO, 'id' | 'name' | 'slug' | 'description'> & {
    category: Pick<ICategoryDTO, 'id' | 'name' | 'slug' | 'description'>
  }
}

export interface IPostCreateDTO
  extends Omit<
    IPostDTO,
    'id' | 'createdAt' | 'updatedAt' | 'status' | 'authorId' | 'status'
  > {}
