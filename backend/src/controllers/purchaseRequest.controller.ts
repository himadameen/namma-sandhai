import { Request, Response, NextFunction } from 'express'
import * as purchaseRequestService from '../services/purchaseRequest.service'
import {
  createPurchaseRequestSchema,
  counterOfferSchema,
} from '../validators/purchaseRequest.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = createPurchaseRequestSchema.parse(req.body)
    const result = await purchaseRequestService.createPurchaseRequest(req.user.userId, input)
    res.status(201).json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function listBuyerRequests(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const result = await purchaseRequestService.getBuyerPurchaseRequests(req.user.userId)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function listFarmerRequests(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const result = await purchaseRequestService.getFarmerPurchaseRequests(req.user.userId)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function acceptRequest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const id = String(req.params.id)
    const result = await purchaseRequestService.acceptPurchaseRequest(req.user.userId, id)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function rejectRequest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const id = String(req.params.id)
    const result = await purchaseRequestService.rejectPurchaseRequest(req.user.userId, id)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function counterRequest(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const id = String(req.params.id)
    const input = counterOfferSchema.parse(req.body)
    const result = await purchaseRequestService.counterPurchaseRequest(req.user.userId, id, input)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}
