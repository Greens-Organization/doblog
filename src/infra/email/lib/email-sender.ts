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
    await this.transporter.sendMail({
      sender: job.sender,
      from: env.SMTP_FROM,
      to: job.to,
      subject: job.subject,
      html: job.html,
      text: job.text
    })
  }
}
