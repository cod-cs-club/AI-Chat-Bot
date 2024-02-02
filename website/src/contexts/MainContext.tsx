import { useState, useEffect, useContext, createContext } from 'react'
import type { ChatMessage } from '@/types'

// Main app context, handles bot conversation state
type MainContextProps = {
  messages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

// Context provider wrapper component
export function MainProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  return <MainContext.Provider value={{
    messages,
    setMessages
  }}>{children}</MainContext.Provider>
}

// Create the context and custom hook for it
export const MainContext = createContext<MainContextProps>(null as any)
export const useMainContext = () => useContext(MainContext)