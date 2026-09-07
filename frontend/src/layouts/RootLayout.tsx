import { Outlet } from 'react-router-dom'
import { HelpdeskWidget } from '@/components/layout/HelpdeskWidget'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

export function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <HelpdeskWidget />
    </>
  )
}
