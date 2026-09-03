import { Request, Response, NextFunction } from 'express'
import * as orderService from '../services/order.service'
import { updateOrderStatusSchema } from '../validators/order.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function listFarmerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const orders = await orderService.getFarmerOrders(req.user.userId)
    res.json(successResponse(orders))
  } catch (error) {
    next(error)
  }
}

export async function getFarmerOrder(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const order = await orderService.getOrderForUser(req.user.userId, 'FARMER', String(req.params.id))
    res.json(successResponse(order))
  } catch (error) {
    next(error)
  }
}

export async function updateFarmerOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = updateOrderStatusSchema.parse(req.body)
    const order = await orderService.updateOrderStatus(
      req.user.userId,
      'FARMER',
      String(req.params.id),
      input
    )
    res.json(successResponse(order))
  } catch (error) {
    next(error)
  }
}

export async function listBuyerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const orders = await orderService.getBuyerOrders(req.user.userId)
    res.json(successResponse(orders))
  } catch (error) {
    next(error)
  }
}

export async function getBuyerOrder(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const order = await orderService.getOrderForUser(req.user.userId, 'BUYER', String(req.params.id))
    res.json(successResponse(order))
  } catch (error) {
    next(error)
  }
}

export async function updateBuyerOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = updateOrderStatusSchema.parse(req.body)
    const order = await orderService.updateOrderStatus(
      req.user.userId,
      'BUYER',
      String(req.params.id),
      input
    )
    res.json(successResponse(order))
  } catch (error) {
    next(error)
  }
}
