import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getAuth, updateProfile } from 'firebase/auth'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { db, storage } from '../firebase'

export default function Profile() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [school, setSchool] = useState('')
  const [subjects, setSubjects] = useState<string[]>((user as any)?.subjects || [])
  const [topics, setTopics] = useState<string[]>((user as any)?.topics || [])
  const [newTopic, setNewTopic] = useState('')

  // avatar state
  const [photoURL, setPhotoURL] = useState<string>(user?.photoURL || '')
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      const data = snap.data() as any
      if (!data) return
      setDisplayName(data.displayName || '')
      setSchool(data.school || '')
      setSubjects(Array.isArray(data.subjects) ? data.subjects : [])
      setTopics(Array.isArray(data.topics) ? data.topics : [])
      setPhotoURL(data.photoURL || user.photoURL || '')
    })()
  }, [user?.uid])

  if (!user) {
    return <div className="p-6">Please sign in to edit your profile.</div>
  }

  async function save() {
    if (!user) return
    await setDoc(
      doc(db, 'users', user.uid),
      { displayName, school, subjects, topics },
      { merge: true }
    )
  }

  function addTopic() {
    const t = newTopic.trim()
    if (!t) return
    setTopics((prev) => Array.from(new Set([...prev, t])))
    setNewTopic('')
  }

  // ---------- NEW: change photo handlers ----------
  function openFilePicker() {
    fileInputRef.current?.click()
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(null)
  
    // (keep your existing type/size checks here)
  
    const auth = getAuth()
    if (!auth.currentUser) { setErr("You must be signed in."); return }
  
    setUploading(true)
    try {
      console.log("[triage] start")
  
      // Step 0: local processing (no rules involved)
      const blob = await toCirclePng(file, 512, 256)
      console.log("[triage] processed OK, bytes=", blob.size)
  
      // Step 1: Storage upload
      const path = `avatars/${auth.currentUser.uid}/${Date.now()}.png`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, blob, { contentType: "image/png" })
      console.log("[triage] storage upload OK:", path)
  
      // Step 2: Public URL
      const url = await getDownloadURL(storageRef)
      console.log("[triage] download URL OK:", url)
  
      // Step 3: Firestore profile write
      await setDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url }, { merge: true })
      console.log("[triage] firestore write OK")
  
      // Step 4: Auth profile update (no rules here)
      await updateProfile(auth.currentUser, { photoURL: url })
      console.log("[triage] auth update OK")
  
      setPhotoURL(url)
    } catch (e: any) {
      console.error("[triage] step failed:", e?.code, e?.message)
      setErr(e?.message || "Upload failed.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function removePhoto() {
    const authUser = getAuth().currentUser
    if (!authUser) return
    setUploading(true)
    try {
      await Promise.all([
        updateProfile(authUser, { photoURL: '' }),
        setDoc(doc(db, 'users', authUser.uid), { photoURL: '' }, { merge: true }),
      ])
      setPhotoURL('')
    } catch (e: any) {
      console.error(e)
      setErr(e?.message || 'Could not remove photo.')
    } finally {
      setUploading(false)
    }
  }
  // ------------------------------------------------

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Your profile</h1>
      <Card className="p-6 space-y-5">

        {/* NEW: Avatar section */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">Profile photo</label>
          <div className="flex items-center gap-4">
            {/* Clickable avatar */}
            <button
              type="button"
              onClick={openFilePicker}
              className="relative inline-block h-20 w-20 rounded-full border overflow-hidden"
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center bg-slate-100 text-slate-500 text-xs">
                  No photo
                </div>
              )}
              <span className="absolute bottom-0 right-0 m-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] shadow">
                {uploading ? '…' : 'Edit'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <Button type="button" onClick={openFilePicker} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Choose photo'}
              </Button>
              {photoURL && (
                <Button type="button" variant="ghost" onClick={removePhoto} disabled={uploading}>
                  Remove
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
          </div>
          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          {!err && <p className="mt-2 text-xs text-slate-500">PNG up to 5MB. Auto circle-crop.</p>}
        </div>

        {/* Existing fields */}
        <div>
          <label className="block text-sm text-slate-700">Display name</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700">School</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </div>

        {/* Keep your subjects/topics UI as-is */}
        <div>
          <label className="block text-sm text-slate-700">Subjects (IDs, comma separated)</label>
          <input
            className="mt-1 w-full rounded-lg border p-2"
            value={subjects.join(',')}
            onChange={(e) =>
              setSubjects(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
          <div className="text-xs text-slate-500 mt-1">
            Populate from Admin/seed. Example: cs, math, physics.
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-700">Topics</label>
          <div className="flex gap-2 mt-1">
            <input
              className="flex-1 rounded-lg border p-2"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g., Data Structures"
            />
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

/** Center-crop to square then export a circular PNG with transparent corners */
async function toCirclePng(file: File, diameter = 512, minSide?: number): Promise<Blob> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  const side = Math.min(img.naturalWidth, img.naturalHeight)
  if (typeof minSide === "number" && side < minSide) {
    throw new Error(`Image must be at least ${minSide}×${minSide} pixels.`)
  }

  const sx = Math.max(0, (img.naturalWidth - side) / 2)
  const sy = Math.max(0, (img.naturalHeight - side) / 2)

  const canvas = document.createElement("canvas")
  canvas.width = diameter
  canvas.height = diameter
  const ctx = canvas.getContext("2d")!
  ctx.clearRect(0, 0, diameter, diameter)

  ctx.beginPath()
  ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(img, sx, sy, side, side, 0, 0, diameter, diameter)

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Canvas export failed"))), "image/png")
  )
  return blob
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(fr.error)
    fr.onload = () => resolve(fr.result as string)
    fr.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
