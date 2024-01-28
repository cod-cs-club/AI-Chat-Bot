'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
// import type { ChatMessage } from '@/types'

// Chat Entry: Handles display of both user message, and the bot's reply.
// Also is responsible for fetching the bot's response, and showing errors.
// You should think of these as tied, because there is only 1 bot reply for each user message.
export default function ChatEntry({ message, }: { message: string }) {
  const [botReply, setBotReply] = useState<string>('')
  const [botError, setBotError] = useState<null | string>(null)

  useEffect(() => {
    fetchReply()
  }, [])
//TODO: instead of feeding a test body, feed all the past messages in that format to the fetch request.
  async function fetchReply() {
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{'role':'user','text':message}])
      })

  // Temp artificial delay
  await new Promise(resolve => setTimeout(resolve, 3000)) // 5s

      const reply  = await((await response).text())
      setBotReply(reply)
    }
    catch (error: any) {
      console.error(error)
      setBotError('Something went wrong. Please try again later.')
    }
  }

  let botDisplay = <p>{botReply}</p>
  if (!botReply) botDisplay = (
    <p className="flex items-center gap-2">
      <div className="w-[0.75rem] h-[0.75rem] bg-gray-500 rounded-full loading-dot-1 loading-dot-all"></div>
      <div className="w-[0.75rem] h-[0.75rem] bg-gray-500 rounded-full loading-dot-2 loading-dot-all"></div>
      <div className="w-[0.75rem] h-[0.75rem] bg-gray-500 rounded-full loading-dot-3 loading-dot-all"></div>
    </p>
  )
  if (botError) botDisplay = <p className="text-red-500">{botError}</p>

  const dateDisplay = new Date().toLocaleTimeString()

  return (
    <>
      {/* User message */}
      <div className="flex justify-end ml-[20%]">
        <div className="flex items-start gap-4 p-4 m-4 bg-chat-2 rounded-2xl chat-user-bubble-appear">
          <div className="flex flex-col gap-4">
            <p>{message}</p>
            <p className="text-sm text-text-2">{dateDisplay}</p>
          </div>
          <Image
            className="rounded-full"
            src="/user.png" alt=""
            width="50" height="50"
          />
        </div>
      </div>

      {/* Bot message */}
      <div className="flex justify-start mr-[20%]">
        <div className="flex items-start gap-4 p-4 m-4 bg-chat-1 rounded-2xl chat-bot-bubble-appear">
          <Image
            className="rounded-full"
            src="/logo.png" alt=""
            width="50" height="50"
          />
          <div className="flex flex-col gap-4">
            {botDisplay}
            <p className="text-sm text-text-2">{dateDisplay}</p>
          </div>
        </div>
      </div>
    </>
  )
}