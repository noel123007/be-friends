import nodemailer from 'nodemailer'
import { logger } from '../../util/logger'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export const emailService = {
  async sendEmail({ to, subject, html }: SendEmailParams) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
      })

      logger.info('Email sent successfully', { messageId: info.messageId })
      return true
    } catch (error) {
      logger.error('Failed to send email', { error })
      throw new Error('Failed to send email')
    }
  }
} 