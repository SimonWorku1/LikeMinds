import { useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query, where, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { markRead } from '../hooks/useChat'

type ChatRow = {
  id: string
  otherId: string
  otherName?: string
  otherPhoto?: string | null
  lastMessageAt?: any
  unread: number
}

export default function Inbox() {
  const { user } = useAuth()
  const [rows, setRows] = useState<ChatRow[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const qChats = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    )
    const unsub = onSnapshot(qChats, async (snap) => {
      const base = snap.docs.map((d) => {
        const data = d.data() as any
        const otherId = (data.participantIds as string[]).find((id) => id !== user.uid) || ''
        return {
          id: d.id,
          otherId,
          lastMessageAt: data.lastMessageAt,
          unread: data?.unread?.[user.uid] || 0
        } as ChatRow
      })
      // Enrich with names/photos (best-effort)
      const enriched = await Promise.all(
        base.map(async (r) => {
          try {
            const snap = await getDoc(doc(db, 'users', r.otherId))
            const u = snap.data() as any
            return { ...r, otherName: u?.displayName || r.otherId, otherPhoto: u?.photoURL || null }
          } catch {
            return r
          }
        })
      )
      setRows(enriched)
    })
    return () => unsub()
  }, [user?.uid])

  if (!user) return <div className="p-6">Please sign in to view your inbox.</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      {rows.length === 0 ? (
        <Card className="p-6 text-slate-600">No conversations yet.</Card>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <Card key={c.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={c.otherPhoto || undefined} alt={c.otherName} />
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">{c.otherName || c.otherId}</div>
                  {c.unread > 0 && (
                    <div className="text-xs text-brand-700 mt-0.5">{c.unread} unread</div>
                  )}
                </div>
              </div>
              <Button
                onClick={async () => {
                  await markRead(c.id, user.uid)
                  navigate(`/chat/${c.id}`)
                }}
              >
                Open
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


