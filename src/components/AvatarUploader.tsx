import React, { useMemo, useRef, useState } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, setDoc } from "firebase/firestore"
import { getAuth, updateProfile } from "firebase/auth"
import { storage, db } from "../firebase"
import Button from "./Button"

type Props = {
  uid: string
  url?: string | null
  sizePx?: number                // visual size in px
  onUpdated?: (url: string) => void
  className?: string
}

export default function EditableAvatar({
  uid,
  url,
  sizePx = 80,
  onUpdated,
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string>(url ?? "")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const dim = useMemo(() => `${sizePx}px`, [sizePx])

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(null)

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("Max file size is 5MB.")
      return
    }

    setBusy(true)
    try {
      // circle-crop to transparent PNG
      const blob = await toCirclePng(file, 512)
      const path = `avatars/${uid}/${Date.now()}.png`
      await uploadBytes(ref(storage, path), blob, { contentType: "image/png" })
      const downloadUrl = await getDownloadURL(ref(storage, path))

      // Update Firestore profile
      await setDoc(doc(db, "users", uid), { photoURL: downloadUrl }, { merge: true })

      // If this is the signed-in user, also update Auth profile
      const auth = getAuth()
      if (auth.currentUser && auth.currentUser.uid === uid) {
        await updateProfile(auth.currentUser, { photoURL: downloadUrl })
      }

      setPreview(downloadUrl)
      onUpdated?.(downloadUrl)
    } catch (e: any) {
      console.error(e)
      setErr(e?.message || "Upload failed.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <div
        className="relative inline-block"
        style={{ width: dim, height: dim }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border"
          />
        ) : (
          <div className="w-full h-full rounded-full grid place-items-center border bg-slate-100 text-slate-500">
            <span className="text-xs">No photo</span>
          </div>
        )}

        {/* Small camera button overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute bottom-0 right-0 translate-x-1 translate-y-1 rounded-full border bg-white/90 backdrop-blur px-2 py-1 text-xs shadow"
          aria-label="Change photo"
          title="Change photo"
        >
          {busy ? "…" : "📷"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePick}
        />
      </div>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      {!err && (
        <p className="mt-1 text-[11px] text-slate-500">PNG up to 5MB. Auto circle-crop.</p>
      )}
    </div>
  )
}

/** Center-crop to square, then export as a circular PNG with transparent corners */
async function toCirclePng(file: File, diameter = 512): Promise<Blob> {
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImage(dataUrl)

  const side = Math.min(img.naturalWidth, img.naturalHeight)
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
