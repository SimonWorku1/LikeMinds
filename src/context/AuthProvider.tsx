import { onAuthStateChanged, signOut as fbSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db, googleProvider } from '../firebase'

type Role = 'student' | 'tutor' | 'admin'

export type AppUser = {
  uid: string
  displayName: string | null
  email: string | null
  role?: Role
  verified?: boolean
  photoURL?: string | null
}

type AuthContextType = {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (params: { email: string; password: string; displayName: string; role: Exclude<Role, 'admin'> }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle redirect result (fallback when popups are blocked)
    getRedirectResult(auth).then(async (res) => {
      if (res?.user) {
        const userDocRef = doc(db, 'users', res.user.uid)
        try {
          const snap = await getDoc(userDocRef)
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              displayName: res.user.displayName,
              role: 'student',
              verified: true,
              subjects: [],
              topics: [],
              createdAt: serverTimestamp()
            })
          }
        } catch {
          // ignore; we'll still set a base user below via onAuthStateChanged
        }
      }
    }).catch(() => {
      // ignore redirect errors; onAuthStateChanged will still run
    })

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }
      const base = {
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL
      }
      try {
        const docRef = doc(db, 'users', fbUser.uid)
        const snap = await getDoc(docRef)
        const data = snap.data() || {}
        setUser({
          ...base,
          role: data.role,
          verified: data.verified
        })
      } catch {
        // If Firestore isn't initialized or rules block, still allow login
        setUser(base as AppUser)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    signUp: async ({ email, password, displayName, role }) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName,
        role,
        verified: role === 'tutor' ? false : true,
        subjects: [],
        topics: [],
        createdAt: serverTimestamp()
      }, { merge: true })
    },
    signInWithGoogle: async () => {
      try {
        const cred = await signInWithPopup(auth, googleProvider)
        const userDocRef = doc(db, 'users', cred.user.uid)
        const snap = await getDoc(userDocRef)
        if (!snap.exists()) {
          await setDoc(userDocRef, {
            displayName: cred.user.displayName,
            role: 'student',
            verified: true,
            subjects: [],
            topics: [],
            createdAt: serverTimestamp()
          })
        } else {
          await setDoc(userDocRef, {
            displayName: cred.user.displayName,
          }, { merge: true })
        }
      } catch (e: any) {
        const code = e?.code || ''
        if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
          // Fallback to redirect for environments where popups are blocked
          await signInWithRedirect(auth, googleProvider)
          return
        }
        if (code === 'auth/unauthorized-domain') {
          throw new Error('Add localhost to Firebase Auth > Settings > Authorized domains, and enable Google provider.')
        }
        throw e
      }
    },
    signOut: async () => {
      await fbSignOut(auth)
    }
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}


