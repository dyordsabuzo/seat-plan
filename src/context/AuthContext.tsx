import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { auth, db } from '../firebase'

type AuthContextValue = {
  user: FirebaseUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  registerWithEmail: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  sendEmailVerificationToUser: () => Promise<void>
  roles: string[]
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const ref = doc(db, 'users', u.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data()
            setRoles((data?.roles as string[]) || [])
          } else {
            // create a user doc with default role
            await setDoc(ref, { email: u.email ?? null, roles: ['user'] })
            setRoles(['user'])
          }
        } catch (e) {
          console.debug('Failed to fetch user roles', e)
          setRoles([])
        }
      } else {
        setRoles([])
      }
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const registerWithEmail = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // create a user doc with default role
    try {
      const ref = doc(db, 'users', cred.user.uid)
      await setDoc(ref, { email: cred.user.email ?? null, roles: ['user'] })
      setRoles(['user'])
      try {
        // send verification email
        await sendEmailVerification(cred.user)
      } catch (e) {
        console.debug('Failed to send verification email', e)
      }
    } catch (e) {
      console.debug('Failed to create user doc after register', e)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const sendEmailVerificationToUser = async () => {
    const u = auth.currentUser
    if (!u) throw new Error('No authenticated user')
    await sendEmailVerification(u)
  }

  return (
    <AuthContext.Provider value={{user, loading, signInWithGoogle, signOut, registerWithEmail, signInWithEmail, sendPasswordReset, sendEmailVerificationToUser, roles}}>
      {children}
    </AuthContext.Provider>
  )
}

// Component to protect routes
export const RequireAuth: React.FC<{children: React.ReactNode, redirectTo?: string, requiredRoles?: string[]}> = ({children, redirectTo = '/login', requiredRoles}) => {
  const {user, loading, roles} = useAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to={redirectTo} state={{ from: location }} replace />
  if (requiredRoles && requiredRoles.length) {
    const has = requiredRoles.every(r => roles.includes(r))
    if (!has) return <div>Unauthorized</div>
  }

  return <>{children}</>
}

export default AuthContext
