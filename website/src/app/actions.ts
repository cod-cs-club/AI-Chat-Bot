'use server'

import type { MessageContext, BotResponsePayload } from '@/lib/types'

// Send and receive messages from the bot
export async function getBotMessage(context: MessageContext[]): Promise<BotResponsePayload> {
  try {
    const response = await fetch('http://127.0.0.1:5000/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context)
    })

    const reply  = await response.json() as BotResponsePayload

    return reply
  }
  catch (error) {
    console.error('Error:', error)
    throw error
  }
}