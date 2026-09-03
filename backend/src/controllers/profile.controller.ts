import { Request, Response, NextFunction } from 'express'
import * as profileService from '../services/profile.service'
import {
  updateFarmerProfileSchema,
  updateBuyerProfileSchema,
} from '../validators/profile.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function getFarmerProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const profile = await profileService.getFarmerProfile(req.user.userId)
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}

export async function updateFarmerProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = updateFarmerProfileSchema.parse(req.body)
    const profile = await profileService.updateFarmerProfile(req.user.userId, input)
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}

export async function getBuyerProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const profile = await profileService.getBuyerProfile(req.user.userId)
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}

export async function updateBuyerProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = updateBuyerProfileSchema.parse(req.body)
    const profile = await profileService.updateBuyerProfile(req.user.userId, input)
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}
