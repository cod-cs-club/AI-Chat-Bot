'use client'

import { useState, useRef } from 'react'
import ChatEntry from '@/components/ChatEntry'
import Icon from '@/components/Icon'

// Chat page
export default function Chat() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState<string>('')

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!input) return
    setMessages((messages) => [...messages, input])
    setInput('')

    // Scroll to bottom of messages container
    // Wait 100ms to let the DOM update
    await new Promise(resolve => setTimeout(resolve, 100))
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  return (
    <main className="h-screen flex flex-col pt-navbar-height">
      {/* Chat messages container */}
      <div ref={messagesContainerRef} className="flex-1 flex-col p-4 pb-8 overflow-y-auto overflow-x-hidden">
        {messages.map((message, index) => (
          <ChatEntry key={index} message={message} />
        ))}
      </div>
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