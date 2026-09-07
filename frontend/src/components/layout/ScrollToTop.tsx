import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function resetScrollPosition() {
  const html = document.documentElement
  const previousBehavior = html.style.scrollBehavior

  // scroll-smooth on <html> can prevent an instant jump on route change (especially mobile).
  html.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  html.scrollTop = 0
  document.body.scrollTop = 0

  requestAnimationFrame(() => {
    html.style.scrollBehavior = previousBehavior
  })
}

/** Resets scroll to top on every route change (farmer, buyer, admin, public). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    resetScrollPosition()
  }, [pathname])

  return null
}

export { resetScrollPosition }
