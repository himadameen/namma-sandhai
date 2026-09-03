import { Request, Response, NextFunction } from 'express'
import * as cropService from '../services/crop.service'
import * as marketPriceService from '../services/marketPrice.service'
import { marketPriceQuerySchema, marketTrendQuerySchema } from '../validators/market.validator'
import { successResponse } from '../utils/apiResponse'

export async function listCrops(_req: Request, res: Response, next: NextFunction) {
  try {
    const crops = await cropService.getAllCrops()
    res.json(successResponse(crops))
  } catch (error) {
    next(error)
  }
}

export async function getMarketPrices(req: Request, res: Response, next: NextFunction) {
  try {
    const query = marketPriceQuerySchema.parse(req.query)
    const result = await marketPriceService.getMarketPrices(query)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function getMarketTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const query = marketTrendQuerySchema.parse(req.query)
    const farmerUserId = req.user?.role === 'FARMER' ? req.user.userId : undefined
    const result = await marketPriceService.getMarketTrend(query, farmerUserId)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}
