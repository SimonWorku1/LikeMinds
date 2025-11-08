import { useEffect, useState } from 'react'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { db } from '../firebase'

export default function Profile() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [school, setSchool] = useState('')
  const [subjects, setSubjects] = useState<string[]>((user as any)?.subjects || [])
  const [topics, setTopics] = useState<string[]>((user as any)?.topics || [])
  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    if (!user) return
    ;(async () => {
      if (!user) return
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data() as any
      if (!data) return
      setDisplayName(data.displayName || '')
      setSchool(data.school || '')
      setSubjects(Array.isArray(data.subjects) ? data.subjects : [])
      setTopics(Array.isArray(data.topics) ? data.topics : [])
    })()
  }, [user?.uid])

  if (!user) {
    return <div className="p-6">Please sign in to edit your profile.</div>
  }

  async function save() {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      school,
      subjects,
      topics
    }, { merge: true })
  }

  function addTopic() {
    const t = newTopic.trim()
    if (!t) return
    setTopics((prev) => Array.from(new Set([...prev, t])))
    setNewTopic('')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Your profile</h1>
      <Card className="p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-700">Display name</label>
          <input className="mt-1 w-full rounded-lg border p-2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-700">School</label>
          <input className="mt-1 w-full rounded-lg border p-2" value={school} onChange={(e) => setSchool(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-700">Subjects (IDs, comma separated)</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={subjects.join(',')}
            onChange={(e) => setSubjects(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
          <div className="text-xs text-slate-500 mt-1">Populate from Admin/seed. Example: cs, math, physics.</div>
        </div>
        <div>
          <label className="block text-sm text-slate-700">Topics</label>
          <div className="flex gap-2 mt-1">
            <input className="flex-1 rounded-lg border p-2" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="e.g., Data Structures" />
            <Button type="button" onClick={addTopic}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {topics.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <Button onClick={save}>Save</Button>
        </div>
      </Card>
    </div>
  )
}


