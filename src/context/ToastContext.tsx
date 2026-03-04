import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Toast = { id: string; message: string; type?: 'success' | 'error' | 'info'; duration?: number }

type ToastContextValue = {
  addToast: (message: string, type?: Toast['type'], duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7)
    const t: Toast = { id, message, type, duration }
    setToasts(prev => [...prev, t])
  }, [])

  useEffect(() => {
    const timers: Record<string, number> = {}
    toasts.forEach(t => {
      if (!timers[t.id]) {
        timers[t.id] = window.setTimeout(() => {
          setToasts(prev => prev.filter(x => x.id !== t.id))
        }, t.duration)
      }
    })
    return () => {
      Object.values(timers).forEach(id => clearTimeout(id))
    }
  }, [toasts])

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-xs w-full px-4 py-2 rounded shadow-lg text-sm text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-sky-600'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastContext
