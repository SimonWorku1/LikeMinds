import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'
import EditableAvatar from './AvatarUploader'   // ⬅️ add this


const AVATAR_RULES = {
  maxBytes: 5 * 1024 * 1024,                 // 5 MB
  allowedTypes: ["image/png", "image/jpeg", "image/webp"],
  minSide: 256,                               // at least 256×256 px
  targetSide: 512,                            // will be circle-cropped to 512×512
};


export type Tutor = {
  uid: string
  displayName: string
  school?: string
  topics?: string[]
  courses?: string[]
  photoURL?: string | null
}

export default function TutorCard({
  tutor,
  subjectName,
  currentUid,
  onStartChat,
  canEditAvatar = false,           // ⬅️ optional editing for own avatar
  onAvatarUpdated,                 // ⬅️ optional callback
}: {
  tutor: Tutor
  subjectName?: string
  currentUid?: string
  onStartChat: (uid: string) => void
  canEditAvatar?: boolean
  onAvatarUpdated?: (url: string) => void
}) {
  const courses = tutor.courses || tutor.topics || []
  const isSelf = currentUid === tutor.uid
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        {canEditAvatar ? (
          <EditableAvatar
            uid={tutor.uid}
            url={tutor.photoURL}
            sizePx={80}
            onUpdated={onAvatarUpdated}
          />
        ) : (
          <Avatar src={tutor.photoURL} alt={tutor.displayName} />
        )}
        <div className="min-w-0">
          <div className="text-lg font-medium text-slate-900 truncate">{tutor.displayName}</div>
          <div className="text-sm text-slate-500">
            {tutor.school ? `${tutor.school}` : null}
            {tutor.school && subjectName ? ' · ' : ''}
            {subjectName ? subjectName : null}
          </div>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {courses.slice(0, 8).map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
      )}

      <div className="mt-5">
        <Button
          onClick={() => onStartChat(tutor.uid)}
          className="w-full"
          disabled={isSelf}
          title={isSelf ? "You can't contact yourself" : undefined}
        >
          {isSelf ? 'Your profile' : 'Contact'}
        </Button>
      </div>
    </Card>
  )
}