import { useEffect, useRef } from 'react'

/** Locks body scroll and closes on Escape while a modal is open. */
export function useModalBehavior(open: boolean, onClose: () => void) {
    const onCloseRef = useRef(onClose)

    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    useEffect(() => {
        if (!open) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCloseRef.current()
        }

        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.body.style.overflow = ''
            document.removeEventListener('keydown', handleEscape)
        }
    }, [open])
}
