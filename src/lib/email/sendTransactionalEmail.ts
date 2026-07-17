import 'server-only'

import type { ReactElement } from 'react'

import { getResendClient } from '@/lib/email/client'
import type { SendTransactionalEmailResult } from '@/lib/email/emailTypes'

type SendTransactionalEmailInput = {
  from: string
  to: string | string[]
  subject: string
  idempotencyKey: string
  replyTo?: string
} & (
  | {
      react: ReactElement
    }
  | {
      html: string
      text: string
    }
)

export async function sendTransactionalEmail(
  input: SendTransactionalEmailInput
): Promise<SendTransactionalEmailResult> {
  const resend = getResendClient()

  const { data, error } =
    'react' in input ?
      await resend.emails.send(
        {
          from: input.from,
          to: input.to,
          subject: input.subject,
          ...(input.replyTo ? { replyTo: input.replyTo } : {}),
          react: input.react
        },
        {
          idempotencyKey: input.idempotencyKey
        }
      )
    : await resend.emails.send(
        {
          from: input.from,
          to: input.to,
          subject: input.subject,
          ...(input.replyTo ? { replyTo: input.replyTo } : {}),
          html: input.html,
          text: input.text
        },
        {
          idempotencyKey: input.idempotencyKey
        }
      )

  if (error) {
    return {
      ok: false,
      message: error.message
    }
  }

  if (!data?.id) {
    return {
      ok: false,
      message: 'Resend returned no email id'
    }
  }

  return {
    ok: true,
    id: data.id
  }
}
