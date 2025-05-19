import { Argon2Adapter } from './adapters/argon2-adapter'

export function makePasswordHasher() {
  return new Argon2Adapter()
}
