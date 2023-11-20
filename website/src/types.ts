export type ChatMessage = {
  sender: 'user' | 'bot',
  content: string,
  time: Date
}