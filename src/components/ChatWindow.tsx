import { useEffect, useRef } from 'react'

export type ChatMessage = {
  id: string
  senderId: string
  text: string
  createdAt?: any
}

export default function ChatWindow({ messages, currentUid }: { messages: ChatMessage[]; currentUid: string }) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => {
        const mine = m.senderId === currentUid
        return (
          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-xl ${mine ? 'bg-brand text-white' : 'bg-slate-100 text-slate-900'}`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        )
      })}
      <div ref={endRef} />
    </div>
  )
}


