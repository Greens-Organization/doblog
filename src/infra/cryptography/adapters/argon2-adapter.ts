import type { HashComparer, Hasher } from '@/core/data/protocols'
import { type Options, hash, verify } from '@node-rs/argon2'

const argon2Options = {
  algorithm: 2, // Use argon2id for better security
  memoryCost: 8129, // 8MB in KiB (8192 = 8 * 1024)
  parallelism: 1, // Parallelism is the number of threads to use
  timeCost: 2, // Iterations number
  outputLen: 32 // Hash in bytes
} as Options

export class Argon2Adapter implements Hasher, HashComparer {
  async hash(plaintext: string, salt?: string): Promise<string> {
    return hash(plaintext, argon2Options)
  }

  async compare(payload: { hash: string; password: string }): Promise<boolean> {
    return verify(payload.hash, payload.password)
  }
}
