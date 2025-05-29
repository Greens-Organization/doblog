import { updatePost } from '@/core/blog/post/services'
import { archivePost } from '@/core/blog/post/services/archive.service'
import { getPostBySlug } from '@/core/blog/post/services/get.service'
import { movePostToDraft } from '@/core/blog/post/services/move-to-draft.service'
import { publishPost } from '@/core/blog/post/services/publish.service'
import { createApiHandler } from '@/infra/helpers/handlers/api/create-api-handler'

export const PUT = createApiHandler(updatePost)
export const POST = createApiHandler(publishPost)
export const PATCH = createApiHandler(movePostToDraft)
export const DELETE = createApiHandler(archivePost)
export const GET = createApiHandler(getPostBySlug)
