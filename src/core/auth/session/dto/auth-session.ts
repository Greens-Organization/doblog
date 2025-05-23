import type { IUserDTO } from '@/core/blog/user/dto'
import type { ISessionDTO } from './session'

export type IAuthSessionDTO = { session: ISessionDTO; user: IUserDTO } | null
