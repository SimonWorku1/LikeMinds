import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, getDocs, limit } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'

export type Chat = {
  id: string
  participantIds: string[]
  lastMessageAt?: any
  unread?: Record<string, number>
}

export type Message = {
  id: string
  senderId: string
  text: string
  createdAt?: any
  readBy?: string[]
}

export function useChat(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!chatId) return
    const msgsRef = collection(db, 'chats', chatId, 'messages')
    const q = query(msgsRef, orderBy('createdAt'))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setMessages(list)
    })
    return () => unsub()
  }, [chatId])

  return useMemo(() => ({ messages }), [messages])
}

export async function createOrGetChat(studentId: string, tutorId: string) {
  // Try to find an existing chat between student and tutor
  const chatsRef = collection(db, 'chats')
  const q = query(
    chatsRef,
    where('participantIds', 'array-contains', studentId),
    limit(20)
  )
  const snap = await getDocs(q)
  const existing = snap.docs.find((d) => {
    const data = d.data() as any
    return Array.isArray(data.participantIds) && data.participantIds.includes(tutorId)
  })
  if (existing) return existing.id

  const newChat = await addDoc(chatsRef, {
    participantIds: [studentId, tutorId],
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    unread: { [tutorId]: 0, [studentId]: 0 }
  })
  return newChat.id
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  const chatRef = doc(db, 'chats', chatId)
  const msgRef = collection(chatRef, 'messages')
  await addDoc(msgRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
    readBy: [senderId]
  })
  const chatSnap = await getDoc(chatRef)
  const data = chatSnap.data() as any
  const otherId = (data.participantIds as string[]).find((id) => id !== senderId)!
  await updateDoc(chatRef, {
    lastMessageAt: serverTimestamp(),
    [`unread.${otherId}`]: (data.unread?.[otherId] || 0) + 1
  } as any)
}

export async function markRead(chatId: string, viewerId: string) {
  const chatRef = doc(db, 'chats', chatId)
  await updateDoc(chatRef, {
    [`unread.${viewerId}`]: 0
  } as any)
}


