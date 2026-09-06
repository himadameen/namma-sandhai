import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(root, '..', '.env')

for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (!match) continue
  const key = match[1].trim()
  const value = match[2].trim()
  if (!['DATABASE_URL', 'JWT_SECRET'].includes(key)) continue

  const result = spawnSync(
    'npx',
    ['vercel@latest', 'env', 'add', key, 'production', '--force'],
    { input: value, stdio: ['pipe', 'inherit', 'inherit'], cwd: path.join(root, '..'), shell: true }
  )

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('Production env vars updated. Redeploy with: npx vercel deploy --prod --yes')
