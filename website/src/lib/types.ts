// Type definitions for the project

import { MessageSender } from '@/lib/enums'

// Type for user message & bot response state
export type MessageExchange = {
  id: number,
  userMessage: string,
  botMessage: string | null,
  isFetching: boolean,
  error: string | null,
  time: Date
}

export type MessageContext = {
  role: MessageSender,
  text: string
}

export type BotResponsePayload = {
  message?: string,
  error?: string
}