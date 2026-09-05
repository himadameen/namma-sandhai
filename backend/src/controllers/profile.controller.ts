import { Request, Response, NextFunction } from 'express'
import * as profileService from '../services/profile.service'
import {
  updateFarmerProfileSchema,
  updateBuyerProfileSchema,
  uploadKycDocumentSchema,
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

export async function uploadFarmerProfileImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const file = req.file
    if (!file) throw new AppError(400, 'No profile image uploaded')

    const profile = await profileService.uploadFarmerProfileImage(req.user.userId, file.filename)
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}

export async function uploadFarmerKycDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const file = req.file
    if (!file) throw new AppError(400, 'No document uploaded')

    const input = uploadKycDocumentSchema.parse(req.body)
    const profile = await profileService.uploadKycDocument(
      req.user.userId,
      'FARMER',
      input,
      file.filename,
      file.originalname
    )
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

export async function uploadBuyerProfileImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const file = req.file
    if (!file) throw new AppError(400, 'No profile image uploaded')

    const profile = await profileService.uploadBuyerProfileImage(req.user.userId, file.filename)
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}

export async function uploadBuyerKycDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const file = req.file
    if (!file) throw new AppError(400, 'No document uploaded')

    const input = uploadKycDocumentSchema.parse(req.body)
    const profile = await profileService.uploadKycDocument(
      req.user.userId,
      'BUYER',
      input,
      file.filename,
      file.originalname
    )
    res.json(successResponse(profile))
  } catch (error) {
    next(error)
  }
}
