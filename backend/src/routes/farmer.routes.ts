import { Router } from 'express'
import * as profileController from '../controllers/profile.controller'
import * as listingController from '../controllers/listing.controller'
import * as purchaseRequestController from '../controllers/purchaseRequest.controller'
import * as orderController from '../controllers/order.controller'
import * as dashboardController from '../controllers/dashboard.controller'
import * as salesRecordController from '../controllers/salesRecord.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate, authorize('FARMER'))

router.get('/profile', profileController.getFarmerProfile)
router.put('/profile', profileController.updateFarmerProfile)

router.get('/listings', listingController.listFarmerListings)
router.post('/listings', listingController.createListing)
router.put('/listings/:id', listingController.updateListing)
router.delete('/listings/:id', listingController.deleteListing)

router.get('/purchase-requests', purchaseRequestController.listFarmerRequests)
router.post('/purchase-requests/:id/accept', purchaseRequestController.acceptRequest)
router.post('/purchase-requests/:id/reject', purchaseRequestController.rejectRequest)
router.post('/purchase-requests/:id/counter', purchaseRequestController.counterRequest)

router.get('/orders', orderController.listFarmerOrders)
router.get('/orders/:id', orderController.getFarmerOrder)
router.patch('/orders/:id/status', orderController.updateFarmerOrderStatus)

router.get('/dashboard', dashboardController.getFarmerDashboard)
router.get('/sales-records', salesRecordController.listFarmerSalesRecords)
router.get('/sales-records/export', salesRecordController.exportFarmerSalesRecords)

export default router
