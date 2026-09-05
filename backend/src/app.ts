import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { LISTINGS_UPLOAD_DIR, PROFILES_UPLOAD_DIR, KYC_UPLOAD_DIR } from './middleware/upload.middleware'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
  cors({
    origin:
      env.NODE_ENV === 'development'
        ? (origin, callback) => {
            if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
              callback(null, true)
            } else {
              callback(null, env.CLIENT_URL)
            }
          }
        : env.CLIENT_URL,
    credentials: true,
  })
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads/listings', express.static(LISTINGS_UPLOAD_DIR))
app.use('/uploads/profiles', express.static(PROFILES_UPLOAD_DIR))
app.use('/uploads/kyc', express.static(KYC_UPLOAD_DIR))

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
