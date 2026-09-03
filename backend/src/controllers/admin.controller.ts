import { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import { verifyUserSchema } from '../validators/admin.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const data = await adminService.getAdminDashboard()
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listFarmers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const farmers = await adminService.listFarmers()
    res.json(successResponse(farmers))
  } catch (error) {
    next(error)
  }
}

export async function listBuyers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const buyers = await adminService.listBuyers()
    res.json(successResponse(buyers))
  } catch (error) {
    next(error)
  }
}

export async function verifyFarmer(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = verifyUserSchema.parse(req.body)
    const result = await adminService.setFarmerVerified(String(req.params.id), input.isVerified)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function verifyBuyer(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = verifyUserSchema.parse(req.body)
    const result = await adminService.setBuyerVerified(String(req.params.id), input.isVerified)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}
