import app from './app'
import { env } from './config/env'

app.listen(env.PORT, () => {
  console.log(`🌾 Namma Sandhai API running on port ${env.PORT}`)
  console.log(`   Environment: ${env.NODE_ENV}`)
  console.log(`   Client URL:  ${env.CLIENT_URL}`)
})
