import { collection, doc, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

type Submission = {
  id: string
  userId: string
  filePaths: string[]
  status: 'pending' | 'approved' | 'rejected'
}

export default function Admin() {
  const { user } = useAuth()
  const [subs, setSubs] = useState<Submission[]>([])

  useEffect(() => {
    const qSubs = query(collection(db, 'verificationSubmissions'))
    const unsub = onSnapshot(qSubs, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Submission[]
      setSubs(list)
    })
    return () => unsub()
  }, [])

  async function setStatus(s: Submission, status: Submission['status']) {
    await updateDoc(doc(db, 'verificationSubmissions', s.id), { status })
    if (status === 'approved') {
      await updateDoc(doc(db, 'users', s.userId), { verified: true } as any)
    }
    if (status === 'rejected') {
      await updateDoc(doc(db, 'users', s.userId), { verified: false } as any)
    }
  }

  if (!user) return <Navigate to="/auth" replace />

  async function seedSubjects() {
    const items = [
      { id: 'cs', name: 'Computer Science', order: 1 },
      { id: 'math', name: 'Mathematics', order: 2 },
      { id: 'physics', name: 'Physics', order: 3 },
      { id: 'chem', name: 'Chemistry', order: 4 },
      { id: 'bio', name: 'Biology', order: 5 },
      { id: 'econ', name: 'Economics', order: 6 }
    ]
    await Promise.all(items.map((s) => setDoc(doc(db, 'subjects', s.id), s, { merge: true })))
    alert('Seeded default subjects')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Admin: Review Tutor Verifications</h1>
      <div>
        <Button variant="ghost" onClick={seedSubjects}>Seed default subjects</Button>
      </div>
      {subs.length === 0 ? (
        <div className="text-slate-600">No submissions yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subs.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="font-medium">User: {s.userId}</div>
              <div className="text-sm text-slate-600 mb-2">Status: {s.status}</div>
              <div className="space-y-2">
                {s.filePaths?.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" className="text-brand underline">View file {idx + 1}</a>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => setStatus(s, 'approved')}>Approve</Button>
                <Button variant="ghost" onClick={() => setStatus(s, 'rejected')}>Reject</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="text-sm text-slate-500">
        Note: Mark one user as admin in Firestore manually by setting users/{'{uid}'}.role = 'admin' for production security rules.
      </div>
    </div>
  )
}


