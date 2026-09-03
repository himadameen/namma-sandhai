import { Router } from 'express'
import { successResponse } from '../utils/apiResponse'
import authRoutes from './auth.routes'
import farmerRoutes from './farmer.routes'
import buyerRoutes from './buyer.routes'
import marketRoutes from './market.routes'
import listingRoutes from './listing.routes'
import adminRoutes from './admin.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json(
    successResponse({
      status: 'ok',
      service: 'namma-sandhai-api',
      timestamp: new Date().toISOString(),
    })
  )
})

router.use('/auth', authRoutes)
router.use('/farmers', farmerRoutes)
router.use('/buyers', buyerRoutes)
router.use('/listings', listingRoutes)
router.use('/admin', adminRoutes)
router.use('/', marketRoutes)

export default router
