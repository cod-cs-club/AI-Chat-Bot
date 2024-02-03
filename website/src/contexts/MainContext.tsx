'use client'

import { useState, useContext, createContext } from 'react'
import { MessageSender } from '@/lib/enums'
import type { MessageExchange, MessageContext, BotResponsePayload } from '@/lib/types'

// Main app context, handles bot conversation state
type MainContextProps = {
  messages: MessageExchange[],
  sendMessage: (message: string) => Promise<void>
}

// Context provider wrapper component
export function MainProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MessageExchange[]>([])

  async function sendMessage(message: string): Promise<void> {
    setMessages(messages => [...messages, {
      id: messages.length,
      userMessage: message,
      botMessage: null,
      isFetching: true,
      error: null,
      time: new Date()
    }])

    try {
      // Include all past messages in the conversation for context
      const contextMessages: MessageContext[] = []
      for (const message of messages) {
        if (!message.botMessage) continue
        contextMessages.push({ role: MessageSender.User, text: message.userMessage })
        if (message.botMessage) contextMessages.push({ role: MessageSender.Bot, text: message.botMessage })
      }

      // Add the new user message to the context
      contextMessages.push({ role: MessageSender.User, text: message })

      const response = await fetch('http://127.0.0.1:5000/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextMessages)
      })

      // if (!response.ok) throw new Error('HTTP error! ' + response.status)

      const reply  = await response.json() as BotResponsePayload
      console.log('response.json() =', reply)

      if (reply.error) throw new Error(reply.error)
      
      const botMessage = reply.message
      if (!botMessage) throw new Error('No bot response!')

      setMessages(messages => messages.map(message => {
        if (message.id !== messages.length - 1) return message
        return { ...message, botMessage: botMessage, isFetching: false }
      }))
    }
    catch (error: any) {
      console.error(error)
      setMessages(messages => messages.map(message => {
        if (message.id !== messages.length - 1) return message
        return { ...message, isFetching: false, error: error.message }
      }))
    }
  }
  
  return <MainContext.Provider value={{
    messages,
    sendMessage
  }}>{children}</MainContext.Provider>
}

// Create the context and custom hook for it
export const MainContext = createContext<MainContextProps>(null as any)
export const useMainContext = () => useContext(MainContext)