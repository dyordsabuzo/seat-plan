import { useEffect, useRef } from 'react'

const FOCUSABLE =
    'a[href], area[href], input:not([disabled]):not([type="hidden"]), ' +
    'select:not([disabled]), textarea:not([disabled]), button:not([disabled]), ' +
    'iframe, [tabindex]:not([tabindex="-1"])'

/**
 * When `active` is true:
 * - Locks body scroll (preserving scroll position)
 * - Traps keyboard focus inside `containerRef`
 * - Closes the overlay on Escape via `onClose`
 * - Restores focus to the previously active element on deactivation
 */
export function useScrollLock(
    active: boolean,
    containerRef: React.RefObject<HTMLElement | null>,
    onClose: () => void,
) {
    const prevFocusRef = useRef<HTMLElement | null>(null)
    const scrollYRef = useRef(0)

    useEffect(() => {
        if (!active) return

        const container = containerRef.current
        prevFocusRef.current = document.activeElement as HTMLElement | null

        // Lock body scroll
        scrollYRef.current = window.scrollY
        document.body.style.cssText = `
            position: fixed;
            top: -${scrollYRef.current}px;
            left: 0; right: 0; width: 100%; overflow: hidden;
        `.trim()

        // Move focus into the container
        const getFocusable = () =>
            container
                ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
                      (el) => el.offsetParent !== null || el === document.activeElement,
                  )
                : []

        const nodes = getFocusable()
        if (nodes.length) nodes[0].focus()
        else if (container) { container.tabIndex = -1; container.focus() }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
            if (e.key !== 'Tab') return

            const nodes = getFocusable()
            if (!nodes.length) return
            const first = nodes[0]
            const last = nodes[nodes.length - 1]
            const active = document.activeElement as HTMLElement | null

            if (e.shiftKey ? (active === first || active === container) : active === last) {
                e.preventDefault()
                ;(e.shiftKey ? last : first).focus()
            }
        }

        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.cssText = ''
            window.scrollTo(0, scrollYRef.current)
            try { prevFocusRef.current?.focus() } catch { /* noop */ }
        }
    }, [active, containerRef, onClose])
}
