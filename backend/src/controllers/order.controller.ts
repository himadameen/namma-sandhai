import { Request, Response, NextFunction } from 'express'
import * as orderService from '../services/order.service'
import { updateOrderStatusSchema, farmerOrdersQuerySchema, buyerOrdersQuerySchema } from '../validators/order.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function listFarmerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const query = farmerOrdersQuerySchema.parse(req.query)
    const result = await orderService.getFarmerOrders(req.user.userId, query)
    res.json(successResponse(result))
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
    const query = buyerOrdersQuerySchema.parse(req.query)
    const result = await orderService.getBuyerOrders(req.user.userId, query)
    res.json(successResponse(result))
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
