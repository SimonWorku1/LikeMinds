import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { db } from '../firebase'

const fallbackSubjects: { id: string; name: string }[] = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'math', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chem', name: 'Chemistry' },
  { id: 'bio', name: 'Biology' },
  { id: 'econ', name: 'Economics' },
  { id: 'business', name: 'Business' },
  { id: 'english', name: 'English' },
  { id: 'psych', name: 'Psychology' }
]

export default function Profile() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [school, setSchool] = useState('')
  const [subjects, setSubjects] = useState<string[]>((user as any)?.subjects || [])
  const [topics, setTopics] = useState<string[]>((user as any)?.topics || [])
  const [newTopic, setNewTopic] = useState('')
  const [allSubjects, setAllSubjects] = useState<{ id: string; name: string }[]>([])
  const [setupBanner, setSetupBanner] = useState(false)

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

  useEffect(() => {
    ;(async () => {
      const qs = await getDocs(collection(db, 'subjects'))
      const fetched = qs.docs.map((d) => ({ id: d.id, name: (d.data() as any).name || d.id }))
      setAllSubjects(fetched.length ? fetched : fallbackSubjects)
    })()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSetupBanner(params.get('setup') === 'tutor')
  }, [])

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
  function removeTopic(topic: string) {
    setTopics((prev) => prev.filter((t) => t !== topic))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Your profile</h1>
      {setupBanner && (
        <div className="mb-4 p-3 rounded-lg bg-brand-50 text-brand-800">
          You are verified as a tutor. Select your subjects and add the courses you TA.
        </div>
      )}
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
          <label className="block text-sm text-slate-700">Subjects you teach</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {allSubjects.map((s) => {
              const checked = subjects.includes(s.id)
              return (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setSubjects(Array.from(new Set([...subjects, s.id])))
                      else setSubjects(subjects.filter((x) => x !== s.id))
                    }}
                  />
                  <span>{s.name}</span>
                </label>
              )
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-700">Courses you can assist in</label>
          <div className="flex gap-2 mt-1">
            <input className="flex-1 rounded-lg border p-2" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="e.g., Data Structures" />
            <Button type="button" onClick={addTopic}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {topics.map((t) => (
              <span key={t} className="tag inline-flex items-center gap-2">
                <span>{t}</span>
                <button
                  type="button"
                  aria-label={`Remove ${t}`}
                  className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-brand-100 text-brand-800 hover:bg-brand-200"
                  onClick={() => removeTopic(t)}
                >
                  ×
                </button>
              </span>
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


