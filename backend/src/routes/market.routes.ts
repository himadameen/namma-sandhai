import { Router } from 'express'
import * as marketController from '../controllers/market.controller'
import { authenticateOptional } from '../middleware/auth.middleware'

const router = Router()

router.get('/crops', marketController.listCrops)
router.get('/market-prices', marketController.getMarketPrices)
router.get('/market-prices/trend', authenticateOptional, marketController.getMarketTrend)

export default router
