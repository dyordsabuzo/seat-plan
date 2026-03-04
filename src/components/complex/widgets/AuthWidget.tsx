import { useAuth } from '../../../context/AuthContext'

export default function AuthWidget() {
  const { user, loading, signInWithGoogle, signOut, roles } = useAuth()

  if (loading) return <div className="px-2 py-1">Loading...</div>

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={signInWithGoogle} className="px-2 py-1 bg-sky-500 text-white rounded">Sign in</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {user.photoURL ? (
        <img src={user.photoURL} alt={user.displayName ?? 'avatar'} className="w-8 h-8 rounded-full" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-gray-600">{(user.displayName || user.email || '').charAt(0).toUpperCase()}</div>
      )}
      <div className="flex flex-col">
        <div className="text-sm text-gray-700">{user.displayName ?? user.email}</div>
        <div className="text-xs text-gray-400">{roles?.join(', ')}</div>
      </div>
      <button onClick={signOut} className="px-2 py-1 bg-red-400 text-white rounded">Sign out</button>
    </div>
  )
}
