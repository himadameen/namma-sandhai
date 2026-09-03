import { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboard.service'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function getFarmerDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const data = await dashboardService.getFarmerDashboard(req.user.userId)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function getBuyerDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const data = await dashboardService.getBuyerDashboard(req.user.userId)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}
