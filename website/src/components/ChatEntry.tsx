'use client'

import Image from 'next/image'
import Markdown from '@/components/Markdown'
import type { MessageExchange } from '@/lib/types'

// Chat Entry: Handles display of both user message and the bot's reply.
// Also is responsible for fetching the bot's response, and showing errors.
// You should think of these as tied, because there is only 1 bot reply for each user message.
export default function ChatEntry({ message }: { message: MessageExchange }) {
  let botDisplay: JSX.Element
  if (message.isFetching) botDisplay = (
    <p className="flex items-center gap-2">
      <div className="w-[0.75rem] h-[0.75rem] bg-gray-500 rounded-full loading-dot-1 loading-dot-all"></div>
      <div className="w-[0.75rem] h-[0.75rem] bg-gray-500 rounded-full loading-dot-2 loading-dot-all"></div>
      <div className="w-[0.75rem] h-[0.75rem] bg-gray-500 rounded-full loading-dot-3 loading-dot-all"></div>
    </p>
  )
  else if (message.error) botDisplay = <p className="text-red-500">{message.error}</p>
  else botDisplay = <Markdown>{message.botMessage || ''}</Markdown>

  const dateDisplay = message.time.toLocaleTimeString()

  return (
    <>
      {/* User message */}
      <div className="flex justify-end ml-[20%]">
        <div className="flex items-start gap-4 p-4 m-4 bg-chat-2 rounded-2xl chat-user-bubble-appear">
          <div className="flex flex-col gap-4">
            <p>{message.userMessage}</p>
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