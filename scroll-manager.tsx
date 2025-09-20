"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    // Disable scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    // Prevent unwanted scrolling on route changes
    const handleRouteChange = () => {
      // Don't scroll to top on route changes
      window.scrollTo({ top: window.pageYOffset, behavior: "auto" })
    }

    // Prevent focus-induced scrolling
    const handleFocus = (e: FocusEvent) => {
      if (e.target && typeof (e.target as any).focus === "function") {
        ;(e.target as any).focus({ preventScroll: true })
      }
    }

    // Prevent form submission scrolling
    const handleSubmit = (e: Event) => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop
      setTimeout(() => {
        window.scrollTo({ top: currentScroll, behavior: "auto" })
      }, 0)
    }

    // Prevent button click scrolling
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === "BUTTON" || target.closest("button"))) {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop
        setTimeout(() => {
          window.scrollTo({ top: currentScroll, behavior: "auto" })
        }, 0)
      }
    }

    document.addEventListener("focusin", handleFocus, true)
    document.addEventListener("submit", handleSubmit)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("focusin", handleFocus, true)
      document.removeEventListener("submit", handleSubmit)
      document.removeEventListener("click", handleClick)
    }
  }, [pathname])

  return null
}
