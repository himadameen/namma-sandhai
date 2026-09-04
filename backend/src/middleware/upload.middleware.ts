import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import multer from 'multer'

export const LISTINGS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'listings')

fs.mkdirSync(LISTINGS_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, LISTINGS_UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

export const listingMediaUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true)
      return
    }
    cb(new Error('Only image and video files are allowed'))
  },
})
