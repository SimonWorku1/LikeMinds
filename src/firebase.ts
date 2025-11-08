import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDgUR7vKqJtEEvGzwV-N5Bz9iHTmhck',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'likeminds-56247.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'likeminds-56247',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'likeminds-56247.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '272717843033',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:272717843033:web:470e2d5c481caf5878545a',
}

// Basic guard to help catch missing env at runtime during dev
// Optional: warn only if we didn't fall back (development aid)
// eslint-disable-next-line no-console
if (!import.meta.env.VITE_FIREBASE_API_KEY) console.warn('[firebase] Using fallback Firebase config; add .env.local to override.')

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
export const db = getFirestore(app)
export const storage = getStorage(app)


