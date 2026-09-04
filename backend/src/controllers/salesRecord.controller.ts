import { Request, Response, NextFunction } from 'express'
import * as salesRecordService from '../services/salesRecord.service'
import { farmerSalesQuerySchema } from '../validators/salesRecord.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function listFarmerSalesRecords(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const query = farmerSalesQuerySchema.parse(req.query)
    const data = await salesRecordService.getFarmerSalesRecords(req.user.userId, query)
    res.json(successResponse(data))
  } catch (error) {
    next(error)
  }
}

export async function exportFarmerSalesRecords(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const { filename, content } = await salesRecordService.exportFarmerSalesCsv(req.user.userId)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(content)
  } catch (error) {
    next(error)
  }
}
