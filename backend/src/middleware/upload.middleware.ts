import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import multer from 'multer'

export const LISTINGS_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'listings')
export const PROFILES_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'profiles')
export const KYC_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'kyc')

fs.mkdirSync(LISTINGS_UPLOAD_DIR, { recursive: true })
fs.mkdirSync(PROFILES_UPLOAD_DIR, { recursive: true })
fs.mkdirSync(KYC_UPLOAD_DIR, { recursive: true })

function createStorage(directory: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, directory)
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${randomUUID()}${ext}`)
    },
  })
}

export const listingMediaUpload = multer({
  storage: createStorage(LISTINGS_UPLOAD_DIR),
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

export const profileImageUpload = multer({
  storage: createStorage(PROFILES_UPLOAD_DIR),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
      return
    }
    cb(new Error('Only image files are allowed for profile photo'))
  },
})

export const kycDocumentUpload = multer({
  storage: createStorage(KYC_UPLOAD_DIR),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/octet-stream'
    if (allowed) {
      cb(null, true)
      return
    }
    cb(new Error('Only image or PDF files are allowed for KYC documents'))
  },
})
