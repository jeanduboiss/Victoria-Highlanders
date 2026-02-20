'use client'

import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

/**
 * Lenis smooth scroll provider.
 * `prevent` callback tells Lenis to NOT intercept scroll events
 * inside elements with [data-lenis-prevent] or inside Radix overlays
 * (dialogs, sheets, popovers, etc.)
 */
export function LenisProvider({ children }: { children: ReactNode }) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.1,
                duration: 1.5,
                smoothWheel: true,
                prevent: (node) => {
                    // Don't hijack scroll inside Radix overlays (Sheet, Dialog, etc.)
                    if (node.closest('[data-radix-popper-content-wrapper]')) return true
                    if (node.closest('[role="dialog"]')) return true
                    if (node.closest('[data-sidebar="sidebar"]')) return true
                    if (node.closest('[data-lenis-prevent]')) return true
                    return false
                },
            }}
        >
            {children}
        </ReactLenis>
    )
}
