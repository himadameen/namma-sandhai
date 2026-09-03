import { Router } from 'express'
import * as listingController from '../controllers/listing.controller'

const router = Router()

router.get('/', listingController.browseListings)
router.get('/:id', listingController.getListing)

export default router
