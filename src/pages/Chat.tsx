import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'
import MessageInput from '../components/MessageInput'
import { useAuth } from '../hooks/useAuth'
import { markRead, sendMessage, useChat } from '../hooks/useChat'

export default function ChatPage() {
  const { chatId = '' } = useParams()
  const { user } = useAuth()
  const { messages } = useChat(chatId)

  useEffect(() => {
    if (!user || !chatId) return
    markRead(chatId, user.uid)
    const onFocus = () => markRead(chatId, user.uid)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [chatId, user?.uid])

  if (!user) {
    return <div className="p-6">Please sign in to chat.</div>
  }

  return (
    <div className="mx-auto max-w-4xl h-[calc(100vh-140px)] mt-6 border rounded-xl flex flex-col">
      <ChatWindow
        messages={messages.map((m) => ({ id: m.id, senderId: m.senderId, text: m.text, createdAt: m.createdAt }))}
        currentUid={user.uid}
      />
      <MessageInput onSend={(text) => sendMessage(chatId, user.uid, text)} />
    </div>
  )
}


