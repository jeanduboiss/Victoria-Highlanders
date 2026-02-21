import nodemailer from 'nodemailer'

export const FROM_EMAIL = process.env.GMAIL_USER ?? ''

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = FROM_EMAIL }: SendEmailOptions) {
  await transporter.sendMail({
    from: `Victoria Highlanders <${from}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}
