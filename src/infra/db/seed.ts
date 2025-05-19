import { env } from '@/env'
import { db } from '.'
import { makePasswordHasher } from '../cryptography/password'
import { logger } from '../lib/logger/logger-server'
import { account } from './schemas/auth/account'
import { user } from './schemas/auth/user'

async function seed() {
  try {
    logger.info('Start seed DB...')

    const [newUser] = await db
      .insert(user)
      .values({
        name: 'Admin',
        email: env.ADMIN_EMAIL,
        emailVerified: true,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    await db
      .insert(account)
      .values({
        accountId: crypto.randomUUID(),
        userId: newUser!.id,
        providerId: 'credential',
        password: await makePasswordHasher().hash(env.ADMIN_PASSWORD),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    logger.info('Seed concluided with success!')
  } catch (error) {
    logger.error('Error on start seed:', error)
  }
}
seed()
