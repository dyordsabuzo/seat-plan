import { useEffect, useState } from 'react'

/**
 * Returns true when the viewport is narrower than Tailwind's `md` breakpoint (768 px).
 * Subscribes to the MediaQueryList so it stays in sync with resizes.
 */
export function useSmallScreen(): boolean {
    const [isSmall, setIsSmall] = useState(() => {
        if (typeof window === 'undefined') return false
        return !window.matchMedia('(min-width: 768px)').matches
    })

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)')
        const update = (e: MediaQueryListEvent) => setIsSmall(!e.matches)
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    return isSmall
}
