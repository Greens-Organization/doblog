import { env } from '@/env'
import IORedis from 'ioredis'

const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Disable automatic retries
  monitor: false // Disable monitoring for performance
})

export { redis }
