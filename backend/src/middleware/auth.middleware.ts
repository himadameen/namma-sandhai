import { Request, Response, NextFunction } from 'express'
import { UserRole } from '@prisma/client'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { AppError } from './errorHandler'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'))
  }

  const token = authHeader.slice(7)
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    next(new AppError(401, 'Invalid or expired token'))
  }
}

export function authenticateOptional(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.slice(7)
  try {
    req.user = verifyToken(token)
  } catch {
    // Ignore invalid token for optional auth
  }
  next()
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to access this resource'))
    }
    next()
  }
}
