import { Router } from 'express'
import * as profileController from '../controllers/profile.controller'
import * as purchaseRequestController from '../controllers/purchaseRequest.controller'
import * as orderController from '../controllers/order.controller'
import * as dashboardController from '../controllers/dashboard.controller'
import { profileImageUpload, kycDocumentUpload } from '../middleware/upload.middleware'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate, authorize('BUYER'))

router.get('/profile', profileController.getBuyerProfile)
router.put('/profile', profileController.updateBuyerProfile)
router.post('/profile/avatar', profileImageUpload.single('file'), profileController.uploadBuyerProfileImage)
router.post('/profile/documents', kycDocumentUpload.single('file'), profileController.uploadBuyerKycDocument)

router.get('/purchase-requests', purchaseRequestController.listBuyerRequests)
router.post('/purchase-requests', purchaseRequestController.createRequest)

router.get('/orders', orderController.listBuyerOrders)
router.get('/orders/:id', orderController.getBuyerOrder)
router.patch('/orders/:id/status', orderController.updateBuyerOrderStatus)

router.get('/dashboard', dashboardController.getBuyerDashboard)

export default router
