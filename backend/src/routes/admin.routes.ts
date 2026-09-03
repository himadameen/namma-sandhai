import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/dashboard', adminController.getDashboard)
router.get('/farmers', adminController.listFarmers)
router.get('/buyers', adminController.listBuyers)
router.patch('/farmers/:id/verify', adminController.verifyFarmer)
router.patch('/buyers/:id/verify', adminController.verifyBuyer)

export default router
