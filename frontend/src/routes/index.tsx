import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { FarmerLayout, BuyerLayout, AdminLayout } from '@/layouts/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage, RegisterPage } from '@/pages/auth/AuthPages'
import { AdminPanelPage } from '@/pages/admin/AdminPanelPage'
import { FarmerProfilePage } from '@/pages/farmer/FarmerProfilePage'
import { BuyerProfilePage } from '@/pages/buyer/BuyerProfilePage'
import { MarketplacePage } from '@/pages/marketplace/MarketplacePage'
import { ListingDetailPage } from '@/pages/marketplace/ListingDetailPage'
import { FarmerListingsPage } from '@/pages/farmer/FarmerListingsPage'
import { FarmerRequestsPage } from '@/pages/farmer/FarmerRequestsPage'
import { FarmerOrdersPage } from '@/pages/farmer/FarmerOrdersPage'
import { BuyerRequestsPage } from '@/pages/buyer/BuyerRequestsPage'
import { BuyerOrdersPage } from '@/pages/buyer/BuyerOrdersPage'
import { FarmerDashboardPage } from '@/pages/farmer/FarmerDashboardPage'
import { FarmerSalesPage } from '@/pages/farmer/FarmerSalesPage'
import { BuyerDashboardPage } from '@/pages/buyer/BuyerDashboardPage'
import { MarketPricesPage } from '@/pages/farmer/MarketPricesPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          {
            path: '/marketplace',
            element: <MarketplacePage />,
          },
          {
            path: '/marketplace/:id',
            element: <ListingDetailPage />,
          },
        ],
      },
      {
        element: (
          <ProtectedRoute roles={['FARMER']}>
            <FarmerLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/farmer/dashboard', element: <FarmerDashboardPage /> },
          { path: '/farmer/listings', element: <FarmerListingsPage /> },
          { path: '/farmer/market-prices', element: <MarketPricesPage /> },
          { path: '/farmer/requests', element: <FarmerRequestsPage /> },
          { path: '/farmer/orders', element: <FarmerOrdersPage /> },
          { path: '/farmer/sales', element: <FarmerSalesPage /> },
          { path: '/farmer/profile', element: <FarmerProfilePage /> },
        ],
      },
      {
        element: (
          <ProtectedRoute roles={['BUYER']}>
            <BuyerLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/buyer/dashboard', element: <BuyerDashboardPage /> },
          { path: '/buyer/orders', element: <BuyerOrdersPage /> },
          { path: '/buyer/requests', element: <BuyerRequestsPage /> },
          { path: '/buyer/profile', element: <BuyerProfilePage /> },
        ],
      },
      {
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/admin', element: <AdminPanelPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
