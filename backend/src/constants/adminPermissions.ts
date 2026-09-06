import { AdminPermission } from '@prisma/client'

export const ALL_ADMIN_PERMISSIONS = Object.values(AdminPermission)

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  USERS_MANAGE: 'Manage users (activate/deactivate, verify)',
  KYC_REVIEW: 'Review KYC documents',
  LISTINGS_MANAGE: 'View and manage product listings',
  TRANSACTIONS_VIEW: 'View transaction tracking',
  ENQUIRIES_MANAGE: 'Manage customer enquiries',
  REPORTS_VIEW: 'View platform reports',
  REPORTS_EXPORT: 'Download reports',
  ROLES_MANAGE: 'Create and assign admin roles',
  ANALYTICS_VIEW: 'View analytics and rankings',
}
