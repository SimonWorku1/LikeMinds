import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'

export type Tutor = {
  uid: string
  displayName: string
  school?: string
  topics?: string[]
  photoURL?: string | null
}

export default function TutorCard({ tutor, onStartChat }: { tutor: Tutor; onStartChat: (uid: string) => void }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <Avatar src={tutor.photoURL} alt={tutor.displayName} />
        <div className="min-w-0">
          <div className="text-lg font-medium text-slate-900 truncate">{tutor.displayName}</div>
          {tutor.school && <div className="text-sm text-slate-500">{tutor.school}</div>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {tutor.topics?.slice(0, 6).map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="mt-5">
        <Button onClick={() => onStartChat(tutor.uid)} className="w-full">Start Chat</Button>
      </div>
    </Card>
  )
}


