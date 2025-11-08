import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'

export type Tutor = {
  uid: string
  displayName: string
  school?: string
  topics?: string[]          // courses
  courses?: string[]         // alias for topics
  photoURL?: string | null
}

export default function TutorCard({
  tutor,
  subjectName,
  currentUid,
  onStartChat
}: {
  tutor: Tutor
  subjectName?: string
  currentUid?: string
  onStartChat: (uid: string) => void
}) {
  const courses = tutor.courses || tutor.topics || []
  const isSelf = currentUid === tutor.uid
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <Avatar src={tutor.photoURL} alt={tutor.displayName} />
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


