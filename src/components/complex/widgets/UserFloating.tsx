import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'

const UserFloating: React.FC = () => {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()

  // keep hook calls at the top-level (always called in the same order)
  const [showImage, setShowImage] = useState<boolean>(Boolean(user && (user as any).photoURL))
  const [expanded, setExpanded] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hideTranslate, setHideTranslate] = useState<number>(260)
  const avatarWidth = 40 // px; approximate visible avatar width when collapsed

  useEffect(() => {
    // When expanded, close if clicking outside the container
    if (!expanded) return undefined
    const handler = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [expanded])

  // measure container width to compute translate distance for smooth hide/show
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      const w = el.getBoundingClientRect().width || 0
      const translate = Math.max(0, w - avatarWidth)
      setHideTranslate(translate)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

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

  // Toggle expansion when avatar is clicked. Stop propagation so document listener doesn't immediately close it.
  const handleAvatarClick = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpanded(prev => !prev)
  }

  return (
    <div
      role="region"
      aria-label="User profile"
      className="fixed top-1 right-4 z-50"
      style={{
        transform: expanded ? 'translateX(0)' : `translateX(${hideTranslate}px)`,
        transition: 'transform 320ms cubic-bezier(0.2,0.8,0.2,1)',
        willChange: 'transform'
      }}
    >
      <div
        ref={containerRef}
        className={`
            bg-white/95 backdrop-blur border rounded-l-lg shadow-md p-2 flex 
            items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out 
            w-[320px]
            `}
            tabIndex={0}
      >
          {/* ${expanded ? 'w-[320px]' : 'w-14'} */}
        <div
          onClick={handleAvatarClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAvatarClick() } }}
          role="button"
          tabIndex={0}
          aria-label={expanded ? 'Collapse user profile' : 'Open user profile'}
          className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-semibold overflow-hidden shrink-0 cursor-pointer"
        >
          {showImage && user.photoURL ? (
            <img src={user.photoURL} alt={`${displayName} avatar`} className="w-full h-full object-cover" onError={() => setShowImage(false)} />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </div>

        {/* Details area - hidden when collapsed due to parent width and overflow-hidden */}
        <div className="flex flex-col text-xs truncate">
          <span className="font-medium leading-none truncate">{displayName}</span>
          <span className="text-gray-500 truncate">{user.email}</span>
        </div>

        <div className="pl-3">
          <button
            onClick={handleSignOut}
            className="px-2 py-1 bg-red-500 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
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
