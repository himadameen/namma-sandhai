import { Request, Response, NextFunction } from 'express'
import * as listingService from '../services/listing.service'
import {
  marketplaceQuerySchema,
  createListingSchema,
  updateListingSchema,
} from '../validators/listing.validator'
import { successResponse } from '../utils/apiResponse'
import { AppError } from '../middleware/errorHandler'

export async function browseListings(req: Request, res: Response, next: NextFunction) {
  try {
    const query = marketplaceQuerySchema.parse(req.query)
    const result = await listingService.getMarketplaceListings(query)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const listing = await listingService.getListingById(id)
    res.json(successResponse(listing))
  } catch (error) {
    next(error)
  }
}

export async function listFarmerListings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const listings = await listingService.getFarmerListings(req.user.userId)
    res.json(successResponse(listings))
  } catch (error) {
    next(error)
  }
}

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = createListingSchema.parse(req.body)
    const listing = await listingService.createListing(req.user.userId, input)
    res.status(201).json(successResponse(listing))
  } catch (error) {
    next(error)
  }
}

export async function updateListing(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const input = updateListingSchema.parse(req.body)
    const id = String(req.params.id)
    const listing = await listingService.updateListing(req.user.userId, id, input)
    res.json(successResponse(listing))
  } catch (error) {
    next(error)
  }
}

export async function deleteListing(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required')
    const id = String(req.params.id)
    const result = await listingService.deleteListing(req.user.userId, id)
    res.json(successResponse(result))
  } catch (error) {
    next(error)
  }
}
