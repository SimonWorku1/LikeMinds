import { FormEvent, KeyboardEvent, useState } from 'react'
import Button from './Button'

export default function MessageInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function doSend() {
    if (!text.trim()) return
    setSending(true)
    try {
      await onSend(text.trim())
      setText('')
    } finally {
      setSending(false)
    }
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await doSend()
  }
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      if (!sending) {
        void doSend()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 flex items-end gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Type a message..."
        className="flex-1 resize-none rounded-lg border border-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
      <Button type="submit" disabled={sending || !text.trim()}>Send</Button>
    </form>
  )
}


