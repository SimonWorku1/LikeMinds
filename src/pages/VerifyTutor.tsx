import { useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { db, storage } from '../firebase'
import { Navigate } from 'react-router-dom'

export default function VerifyTutor() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileList | null>(null)
  const [status, setStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      if (!user) return
      const snap = await getDoc(doc(db, 'verificationSubmissions', user.uid))
      const data = snap.data() as any
      setStatus(data?.status || 'none')
      setLoading(false)
    })()
  }, [user?.uid])

  if (!user) return <Navigate to="/auth" replace />

  async function submit() {
    if (!user || !files || files.length === 0) return
    const filePaths: string[] = []
    for (const f of Array.from(files)) {
      const r = ref(storage, `verification/${user.uid}/${Date.now()}_${f.name}`)
      await uploadBytes(r, f)
      const url = await getDownloadURL(r)
      filePaths.push(url)
    }
    // Auto-approve the submission
    await setDoc(doc(db, 'verificationSubmissions', user.uid), {
      userId: user.uid,
      filePaths,
      status: 'approved',
      submittedAt: serverTimestamp(),
      reviewedAt: serverTimestamp()
    }, { merge: true })
    // Update the user record to tutor + verified
    await setDoc(doc(db, 'users', user.uid), {
      role: 'tutor',
      verified: true
    }, { merge: true })
    setStatus('approved')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Tutor verification</h1>
      <Card className="p-6">
        {status === 'approved' ? (
          <div className="text-green-700">Your verification is approved.</div>
        ) : status === 'pending' ? (
          <div className="text-slate-700">Your submission is pending review.</div>
        ) : (
          <>
            <p className="text-slate-700 mb-4">
              Upload verification documents (transcript, email from professor, etc.).
            </p>
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            <div className="mt-4">
              <Button onClick={submit}>Submit for review</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}


