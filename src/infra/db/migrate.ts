import { migrate } from 'drizzle-orm/neon-http/migrator'
import { db } from '.'
import { logger } from '../lib/logger/logger-server'

const main = async () => {
  const startTime = Date.now()
  logger.info('Starting database migration...')

  try {
    await migrate(db, { migrationsFolder: 'drizzle/migrations' })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    logger.info(`✅ Migration completed successfully in ${duration}s`)
  } catch (error: unknown) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    logger.error(`❌ Migration failed after ${duration}s`)

    if (error instanceof Error) {
      logger.error(`Error details: ${error.message}`)
      if (error.stack) {
        logger.error(`Stack trace:\n${error.stack}`)
      }
    } else {
      logger.error(`Error details: ${String(error)}`)
    }

    process.exit(1)
  }

  process.exit(0)
}

main()
