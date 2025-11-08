import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import FieldDivider from '../components/FieldDivider'
import TutorCard, { Tutor } from '../components/TutorCard'
import { useAuth } from '../hooks/useAuth'
import { createOrGetChat } from '../hooks/useChat'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'

type Subject = { id: string; name: string; order?: number }
const fallbackSubjects: Subject[] = [
  { id: 'cs', name: 'Computer Science', order: 1 },
  { id: 'math', name: 'Mathematics', order: 2 },
  { id: 'physics', name: 'Physics', order: 3 },
  { id: 'chem', name: 'Chemistry', order: 4 },
  { id: 'bio', name: 'Biology', order: 5 },
  { id: 'econ', name: 'Economics', order: 6 }
]

export default function Landing() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tutorsBySubject, setTutorsBySubject] = useState<Record<string, Tutor[]>>({})
  const navigate = useNavigate()

  useEffect(() => {
    const qSubjects = query(collection(db, 'subjects'), orderBy('order', 'asc'))
    const unsubSubj = onSnapshot(
      qSubjects,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Subject[]
        setSubjects(list.length ? list : fallbackSubjects)
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.warn('Subjects listener error', err)
        setSubjects(fallbackSubjects)
      }
    )
    return () => unsubSubj()
  }, [])

  useEffect(() => {
    const unsubscribers: (() => void)[] = []
    subjects.forEach((s) => {
      const qTutors = query(
        collection(db, 'users'),
        where('role', '==', 'tutor'),
        where('verified', '==', true),
        where('subjects', 'array-contains', s.id)
      )
      const unsub = onSnapshot(
        qTutors,
        (snap) => {
          const list = snap.docs.map((d) => {
            const data = d.data() as any
            return {
              uid: d.id,
              displayName: data.displayName || 'Tutor',
              topics: data.topics || [],
              school: data.school,
              photoURL: data.photoURL || null
            } as Tutor
          })
          setTutorsBySubject((prev) => ({ ...prev, [s.id]: list }))
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.warn('Tutors listener error', err)
          setTutorsBySubject((prev) => ({ ...prev, [s.id]: [] }))
        }
      )
      unsubscribers.push(unsub)
    })
    return () => unsubscribers.forEach((fn) => fn())
  }, [subjects.length])

  async function startChat(tutorId: string) {
    if (!user) {
      navigate('/auth')
      return
    }
    const chatId = await createOrGetChat(user.uid, tutorId)
    navigate(`/chat/${chatId}`)
  }

  return (
    <div>
      <header className="bg-gradient-to-b from-brand-50 to-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Find a verified tutor by subject</h1>
        </div>
      </header>
      {subjects
        .filter((s) => (tutorsBySubject[s.id] || []).length > 0)
        .map((s) => (
          <FieldDivider key={s.id} title={s.name}>
            {(tutorsBySubject[s.id] || []).map((t) => (
              <TutorCard key={t.uid} tutor={t} subjectName={s.name} onStartChat={startChat} />
            ))}
          </FieldDivider>
        ))}
    </div>
  )
}


