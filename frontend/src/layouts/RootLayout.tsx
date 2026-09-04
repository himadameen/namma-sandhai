import { Outlet } from 'react-router-dom'
import { HelpdeskWidget } from '@/components/layout/HelpdeskWidget'

export function RootLayout() {
  return (
    <>
      <Outlet />
      <HelpdeskWidget />
    </>
  )
}
