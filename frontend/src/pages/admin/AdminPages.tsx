import { AdminPageLayout } from '@/components/admin/AdminPageLayout'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminKyc } from '@/components/admin/AdminKyc'
import { AdminListings } from '@/components/admin/AdminListings'
import { AdminTransactions } from '@/components/admin/AdminTransactions'
import { AdminEnquiries } from '@/components/admin/AdminEnquiries'
import { AdminAnalytics } from '@/components/admin/AdminAnalytics'
import { AdminStock } from '@/components/admin/AdminStock'
import { AdminReports } from '@/components/admin/AdminReports'
import { AdminRoles } from '@/components/admin/AdminRoles'
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage'

export function AdminOverviewPage() {
  return <AdminOverview />
}

export function AdminUsersPage() {
  return (
    <AdminPageLayout titleKey="admin.users" descriptionKey="admin.manageFarmersDesc">
      <AdminUsers />
    </AdminPageLayout>
  )
}

export function AdminKycPage() {
  return (
    <AdminPageLayout titleKey="admin.kycReview" descriptionKey="admin.kycReviewDesc">
      <AdminKyc />
    </AdminPageLayout>
  )
}

export function AdminListingsPage() {
  return (
    <AdminPageLayout titleKey="admin.productListings" descriptionKey="admin.productListingsDesc">
      <AdminListings />
    </AdminPageLayout>
  )
}

export function AdminTransactionsPage() {
  return (
    <AdminPageLayout titleKey="admin.transactions" descriptionKey="admin.transactionsDesc">
      <AdminTransactions />
    </AdminPageLayout>
  )
}

export function AdminEnquiriesPage() {
  return (
    <AdminPageLayout titleKey="admin.enquiries" descriptionKey="admin.enquiriesDesc">
      <AdminEnquiries />
    </AdminPageLayout>
  )
}

export function AdminAnalyticsPage() {
  return (
    <AdminPageLayout titleKey="admin.analytics" descriptionKey="admin.topSellingItemsDesc">
      <AdminAnalytics />
    </AdminPageLayout>
  )
}

export function AdminStockPage() {
  return (
    <AdminPageLayout titleKey="admin.stockChanges" descriptionKey="admin.stockChangesDesc">
      <AdminStock />
    </AdminPageLayout>
  )
}

export function AdminReportsPage() {
  return (
    <AdminPageLayout titleKey="admin.reports" descriptionKey="admin.reportExportCenterDesc">
      <AdminReports />
    </AdminPageLayout>
  )
}

export function AdminRolesPage() {
  return (
    <AdminPageLayout titleKey="admin.roles" descriptionKey="admin.createRoleDesc">
      <AdminRoles />
    </AdminPageLayout>
  )
}

export { AdminProfilePage }
