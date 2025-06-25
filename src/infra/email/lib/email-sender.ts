import { env } from '@/env'
import nodemailer from 'nodemailer'
import type { EmailJob } from './email-schema'

export class EmailSender {
  private transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  }

  async send(job: EmailJob): Promise<void> {
    const from = job.fromDisplayName
      ? { name: job.fromDisplayName, address: env.SMTP_FROM }
      : env.SMTP_FROM

    const to = job.toDisplayName
      ? { name: job.toDisplayName, address: job.to }
      : job.to

    await this.transporter.sendMail({
      from,
      to,
      subject: job.subject,
      html: job.html,
      text: job.text
    })
  }
}
