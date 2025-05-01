
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )
  
  React.useEffect(() => {
    // Initial check based on window width
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check immediately on mount
    checkIsMobile()
    
    // Use debounced resize handler to prevent excessive renders
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        checkIsMobile()
      }, 100)
    }
    
    window.addEventListener("resize", handleResize)
    
    // Media query listener as a fallback
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mediaQuery.addEventListener("change", checkIsMobile)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      mediaQuery.removeEventListener("change", checkIsMobile)
      clearTimeout(resizeTimer)
    }
  }, [])

  return isMobile
}
