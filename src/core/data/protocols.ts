export interface Hasher {
  hash(plaintext: string, salt?: string): Promise<string>
}

export interface HashComparer {
  compare(payload: { hash: string; password: string }): Promise<boolean>
}
