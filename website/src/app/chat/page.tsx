'use client'

import { useState, useRef, useEffect } from 'react'
import { useMainContext } from '@/contexts/MainContext'
import Image from 'next/image'
import ChatEntry from '@/components/ChatEntry'
import Icon from '@/components/Icon'

// Chat page
export default function Chat() {
  const { messages, sendMessage } = useMainContext()

  const [input, setInput] = useState<string>('')

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!input) return
    sendMessage(input)
    setInput('')
  }

  // Scroll to bottom of messages container when new messages are added
  useEffect(() => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages])

  return (
    <main className="h-screen flex flex-col pt-navbar-height">
      {messages.length > 0 ? (
        <div ref={messagesContainerRef} className="flex-1 flex-col p-4 pb-8 overflow-y-auto overflow-x-hidden">
          {messages.map(message => (
            <ChatEntry key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex-col flex items-center justify-center gap-8 grayscale">
          <Image src="/logo.png" alt="Logo" width="100" height="100" />
          <p className="text-2xl text-gray-300 text-center">Start a conversation by typing below!</p>
        </div>
      )}
      <div className="h-[120px] p-8 border-t-[1px] border-t-gray-800">
        <form
          onSubmit={submitMessage}
          className="flex items-center gap-4"
        >
          <Icon name="chat" className="text-green-500 text-[1.5rem]" />
          <input
            type="text"
            placeholder="Type a message..."
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 p-4 bg-transparent border-r-0 border-b-[1px] border-b-gray-500 outline-none focus:border-b-[2px] focus:border-b-blue-500" 
          />
        </form>
      </div>
    </main>
  )
}