export type ChatMessage = {
  sender: 'user' | 'bot',
  content: string | null,
  isLoading: boolean,
  error: string | null,
  time: Date
}