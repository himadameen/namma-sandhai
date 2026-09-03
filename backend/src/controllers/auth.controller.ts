import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { registerSchema, loginSchema } from '../validators/auth.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body)
    const result = await authService.registerUser(input)
    res.status(201).json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body)
    const result = await authService.loginUser(input)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required')
    }
    const user = await authService.getCurrentUser(req.user.userId)
    res.json(successResponse(user))
  } catch (error) {
    next(error)
  }
}
