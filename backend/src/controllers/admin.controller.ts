import { Request, Response, NextFunction } from 'express'
import * as adminService from '../services/admin.service'
import * as adminRolesService from '../services/adminRoles.service'
import * as adminProfileService from '../services/adminProfile.service'
import {
  assignRoleSchema,
  buyersQuerySchema,
  createEnquirySchema,
  createRoleSchema,
  enquiriesQuerySchema,
  farmersQuerySchema,
  kycReviewSchema,
  listingsQuerySchema,
  paginationSchema,
  stockChangesQuerySchema,
  topSellingPeriodSchema,
  transactionsQuerySchema,
  updateEnquirySchema,
  updateRoleSchema,
  userStatusSchema,
  verifyUserSchema,
} from '../validators/admin.validator'
import { updateAdminProfileSchema } from '../validators/profile.validator'
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

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getAnalytics()
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listFarmers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = farmersQuerySchema.parse(req.query)
    const data = await adminService.listFarmers(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listBuyers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = buyersQuerySchema.parse(req.query)
    const data = await adminService.listBuyers(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function verifyFarmer(req: Request, res: Response, next: NextFunction) {
  try {
    const input = verifyUserSchema.parse(req.body)
    const result = await adminService.setFarmerVerified(String(req.params.id), input.isVerified)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function verifyBuyer(req: Request, res: Response, next: NextFunction) {
  try {
    const input = verifyUserSchema.parse(req.body)
    const result = await adminService.setBuyerVerified(String(req.params.id), input.isVerified)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function setUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const input = userStatusSchema.parse(req.body)
    const result = await adminService.setUserActive(String(req.params.userId), input.isActive)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function listPendingKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listPendingKyc()
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function getUserKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getUserKyc(String(req.params.userId))
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function reviewKycDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = kycReviewSchema.parse(req.body)
    const result = await adminService.reviewKycDocument(
      String(req.params.id),
      input.status,
      input.reviewNote,
      req.user.userId
    )
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function listListings(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listingsQuerySchema.parse(req.query)
    const data = await adminService.listAdminListings(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listListingsGrouped(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listingsQuerySchema.parse(req.query)
    const data = await adminService.listAdminListingsGrouped(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const query = transactionsQuerySchema.parse(req.query)
    const data = await adminService.listTransactions(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listEnquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const query = enquiriesQuerySchema.parse(req.query)
    const data = await adminService.listEnquiries(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function createEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createEnquirySchema.parse(req.body)
    const data = await adminService.createEnquiry(input, req.user?.userId)
    res.status(201).json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function updateEnquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateEnquirySchema.parse(req.body)
    const data = await adminService.updateEnquiry(String(req.params.id), input)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function getStockChanges(req: Request, res: Response, next: NextFunction) {
  try {
    const query = stockChangesQuerySchema.parse(req.query)
    const data = await adminService.getStockChanges(query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function exportTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const query = transactionsQuerySchema.parse(req.query)
    const csv = await adminService.exportTransactionsCsv(query)
    const periodParts: string[] = []
    if (query.from) {
      const fromDate = new Date(query.from)
      periodParts.push(String(fromDate.getFullYear()))
      if (query.to) {
        const toDate = new Date(query.to)
        if (
          fromDate.getFullYear() === toDate.getFullYear() &&
          fromDate.getMonth() === toDate.getMonth()
        ) {
          periodParts.push(String(fromDate.getMonth() + 1).padStart(2, '0'))
        }
      }
    }
    const suffix = periodParts.length ? `-${periodParts.join('-')}` : ''
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="namma-sandhai-transactions${suffix}.csv"`)
    res.send(csv)
  } catch (error) {
    next(error)
  }
}

export async function exportRevenue(req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await adminService.exportRevenueCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="namma-sandhai-revenue.csv"')
    res.send(csv)
  } catch (error) {
    next(error)
  }
}

export async function exportUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await adminService.exportUsersCsv()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="namma-sandhai-users.csv"')
    res.send(csv)
  } catch (error) {
    next(error)
  }
}

export async function exportListings(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listingsQuerySchema.parse(req.query)
    const csv = await adminService.exportListingsCsv(query)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="namma-sandhai-listings.csv"')
    res.send(csv)
  } catch (error) {
    next(error)
  }
}

export async function listRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminRolesService.listRoles()
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createRoleSchema.parse(req.body)
    const data = await adminRolesService.createRole(input)
    res.status(201).json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateRoleSchema.parse(req.body)
    const data = await adminRolesService.updateRole(String(req.params.id), input)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminRolesService.deleteRole(String(req.params.id))
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function assignRole(req: Request, res: Response, next: NextFunction) {
  try {
    const input = assignRoleSchema.parse(req.body)
    const data = await adminRolesService.assignRoleToUser(String(req.params.userId), input.adminRoleId)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function listAdminUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminRolesService.listAdminUsers()
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function getPermissionsCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminRolesService.getPermissionsCatalog()
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function getTopSelling(req: Request, res: Response, next: NextFunction) {
  try {
    const { period } = topSellingPeriodSchema.parse(req.query)
    const now = new Date()
    let from: Date
    if (period === 'day') from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    else if (period === 'month') from = new Date(now.getFullYear(), now.getMonth(), 1)
    else from = new Date(now.getFullYear(), 0, 1)

    const analytics = await adminService.getAnalytics()
    const items =
      period === 'day'
        ? analytics.topSelling.day
        : period === 'month'
          ? analytics.topSelling.month
          : analytics.topSelling.year
    res.json(successResponse({ period, items }))
  } catch (error) {
    next(error)
  }
}

export async function getAdminProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const data = await adminProfileService.getAdminProfile(req.user.userId)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function updateAdminProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = updateAdminProfileSchema.parse(req.body)
    const data = await adminProfileService.updateAdminProfile(req.user.userId, input)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function uploadAdminProfileImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    if (!req.file) throw new AppError(400, 'Profile image is required')
    const data = await adminProfileService.uploadAdminProfileImage(req.user.userId, req.file.filename)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}
