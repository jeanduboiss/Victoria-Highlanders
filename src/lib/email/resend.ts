import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Falta la variable de entorno RESEND_API_KEY')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Dirección verificada en Resend. Cámbiala por tu dominio propio cuando lo tengas.
export const FROM_EMAIL = 'onboarding@resend.dev'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = FROM_EMAIL }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({ from, to, subject, html })

  if (error) {
    console.error('[Resend] Error al enviar email:', error)
    throw new Error(error.message)
  }

  return data
}
