import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

const UserFloating: React.FC = () => {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()

  // keep hook calls at the top-level (always called in the same order)
  const [showImage, setShowImage] = useState<boolean>(Boolean(user && (user as any).photoURL))

  if (!user) return null

  const displayName = user.displayName || user.email || ''
  const initials = displayName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() || (user.email ? user.email[0].toUpperCase() : '')

  const handleSignOut = async () => {
    try {
      await signOut()
      addToast('Signed out', 'info')
    } catch (e: any) {
      console.debug('Failed to sign out', e)
      addToast('Failed to sign out', 'error')
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50" role="region" aria-label="User profile">
      <div className="bg-white/95 backdrop-blur border rounded-lg shadow-md p-2 flex items-center gap-3" tabIndex={0}>
        <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-semibold overflow-hidden">
          {showImage && user.photoURL ? (
            <img src={user.photoURL} alt={`${displayName} avatar`} className="w-full h-full object-cover" onError={() => setShowImage(false)} />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </div>
        <div className="flex flex-col text-xs">
          <span className="font-medium leading-none">{displayName}</span>
          <span className="text-gray-500">{user.email}</span>
        </div>
        <div className="pl-3">
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserFloating
