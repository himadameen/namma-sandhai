import { AdminPermission } from '@prisma/client'
import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { ALL_ADMIN_PERMISSIONS } from '../constants/adminPermissions'

export async function getAdminPermissions(userId: string): Promise<AdminPermission[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { adminRole: true },
  })
  if (!user) throw new AppError(401, 'Session expired. Please sign in again.')
  if (user.role !== 'ADMIN') return []
  if (!user.adminRoleId || !user.adminRole) return ALL_ADMIN_PERMISSIONS
  return user.adminRole.permissions
}

export function requireAdminPermission(...permissions: AdminPermission[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'Authentication required')
      const userPerms = await getAdminPermissions(req.user.userId)
      const hasAll = permissions.every((p) => userPerms.includes(p))
      if (!hasAll) throw new AppError(403, 'Insufficient admin permissions')
      next()
    } catch (error) {
      next(error)
    }
  }
}

export function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1)
}

export function computeGrowth(current: number, previous: number) {
  if (current === 0 && previous === 0) {
    return { growthPercent: 0, direction: 'stable' as const, label: 'stable' as const }
  }
  if (previous === 0 && current > 0) {
    return { growthPercent: null, direction: 'up' as const, label: 'new' as const }
  }
  if (previous > 0 && current === 0) {
    return { growthPercent: -100, direction: 'down' as const, label: 'no_activity' as const }
  }
  const percent = Math.round(((current - previous) / previous) * 1000) / 10
  return {
    growthPercent: percent,
    direction: percent > 0 ? 'up' : percent < 0 ? 'down' : ('stable' as const),
    label: 'change' as const,
  }
}
