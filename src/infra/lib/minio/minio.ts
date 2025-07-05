import { env } from '@/env'
import { Client } from 'minio'

export const client = new Client({
  endPoint: env.S3_ENDPOINT,
  accessKey: env.S3_ACCESS_KEY,
  useSSL: env.S3_USESSL,
  port: env.S3_PORT,
  secretKey: env.S3_SECRET_KEY
})
