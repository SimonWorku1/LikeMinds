import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user, signOut } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) {
      setUnread(0)
      return
    }
    const qChats = query(collection(db, 'chats'), where('participantIds', 'array-contains', user.uid))
    const unsub = onSnapshot(
      qChats,
      (snap) => {
        let total = 0
        snap.forEach((d) => {
          const data = d.data() as any
          total += data?.unread?.[user.uid] || 0
        })
        setUnread(total)
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.warn('Inbox listener error', err)
      }
    )
    return () => unsub()
  }, [user?.uid])

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-brand">
            LikeMinds
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink to="/" className="text-slate-700 hover:text-brand">
              Home
            </NavLink>
            {user && (
              <>
                <NavLink to="/profile" className="text-slate-700 hover:text-brand">
                  Profile
                </NavLink>
                <NavLink to="/inbox" className="relative inline-flex items-center text-slate-700 hover:text-brand">
                  <span>Inbox</span>
                  {unread > 0 && (
                    <span className="ml-2 rounded-full bg-brand text-white text-xs px-2 py-0.5">{unread}</span>
                  )}
                </NavLink>
              </>
            )}
            {!user ? (
              <NavLink to="/auth" className="btn btn-primary">
                Sign In
              </NavLink>
            ) : (
              <button className="btn btn-ghost" onClick={signOut}>
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} LikeMinds
        </div>
      </footer>
    </div>
  )
}


