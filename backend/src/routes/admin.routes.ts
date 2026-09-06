import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { authenticate, authorize, authenticateOptional } from '../middleware/auth.middleware'
import { profileImageUpload } from '../middleware/upload.middleware'
import { requireAdminPermission } from '../utils/adminHelpers'
import { AdminPermission } from '@prisma/client'

const router = Router()

router.post('/enquiries', authenticateOptional, adminController.createEnquiry)

router.use(authenticate, authorize('ADMIN'))

router.get('/profile', adminController.getAdminProfile)
router.put('/profile', adminController.updateAdminProfile)
router.post('/profile/avatar', profileImageUpload.single('file'), adminController.uploadAdminProfileImage)

router.get('/dashboard', requireAdminPermission(AdminPermission.ANALYTICS_VIEW), adminController.getDashboard)
router.get('/analytics', requireAdminPermission(AdminPermission.ANALYTICS_VIEW), adminController.getAnalytics)
router.get('/top-selling', requireAdminPermission(AdminPermission.ANALYTICS_VIEW), adminController.getTopSelling)
router.get('/stock-changes', requireAdminPermission(AdminPermission.ANALYTICS_VIEW), adminController.getStockChanges)

router.get('/farmers', requireAdminPermission(AdminPermission.USERS_MANAGE), adminController.listFarmers)
router.get('/buyers', requireAdminPermission(AdminPermission.USERS_MANAGE), adminController.listBuyers)
router.patch('/farmers/:id/verify', requireAdminPermission(AdminPermission.USERS_MANAGE), adminController.verifyFarmer)
router.patch('/buyers/:id/verify', requireAdminPermission(AdminPermission.USERS_MANAGE), adminController.verifyBuyer)
router.patch('/users/:userId/status', requireAdminPermission(AdminPermission.USERS_MANAGE), adminController.setUserStatus)

router.get('/kyc/pending', requireAdminPermission(AdminPermission.KYC_REVIEW), adminController.listPendingKyc)
router.get('/kyc/:userId', requireAdminPermission(AdminPermission.KYC_REVIEW), adminController.getUserKyc)
router.patch('/kyc/documents/:id', requireAdminPermission(AdminPermission.KYC_REVIEW), adminController.reviewKycDocument)

router.get('/listings/grouped', requireAdminPermission(AdminPermission.LISTINGS_MANAGE), adminController.listListingsGrouped)
router.get('/listings', requireAdminPermission(AdminPermission.LISTINGS_MANAGE), adminController.listListings)

router.get('/transactions', requireAdminPermission(AdminPermission.TRANSACTIONS_VIEW), adminController.listTransactions)

router.get('/enquiries', requireAdminPermission(AdminPermission.ENQUIRIES_MANAGE), adminController.listEnquiries)
router.patch('/enquiries/:id', requireAdminPermission(AdminPermission.ENQUIRIES_MANAGE), adminController.updateEnquiry)

router.get('/reports/transactions/export', requireAdminPermission(AdminPermission.REPORTS_EXPORT), adminController.exportTransactions)
router.get('/reports/revenue/export', requireAdminPermission(AdminPermission.REPORTS_EXPORT), adminController.exportRevenue)
router.get('/reports/users/export', requireAdminPermission(AdminPermission.REPORTS_EXPORT), adminController.exportUsers)
router.get('/reports/listings/export', requireAdminPermission(AdminPermission.REPORTS_EXPORT), adminController.exportListings)

router.get('/roles/permissions', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.getPermissionsCatalog)
router.get('/roles', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.listRoles)
router.post('/roles', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.createRole)
router.patch('/roles/:id', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.updateRole)
router.delete('/roles/:id', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.deleteRole)
router.get('/admins', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.listAdminUsers)
router.patch('/admins/:userId/role', requireAdminPermission(AdminPermission.ROLES_MANAGE), adminController.assignRole)

export default router
