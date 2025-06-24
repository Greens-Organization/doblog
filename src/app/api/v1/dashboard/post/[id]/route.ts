import {
  archivePost,
  getPost,
  movePostToDraft,
  publishPost,
  updatePost
} from '@/core/blog/post/services'
import { createApiHandler } from '@/infra/helpers/handlers/api'

export const GET = createApiHandler(getPost)
export const PUT = createApiHandler(updatePost)
export const POST = createApiHandler(publishPost)
export const PATCH = createApiHandler(movePostToDraft)
export const DELETE = createApiHandler(archivePost)
