import type { UserRole } from '@/types'

export function formatDisplayId(id?: string, role?: UserRole): string {
  if (!id) {
    if (role === 'BUYER') return 'NSB0101'
    if (role === 'ADMIN') return 'NSA0101'
    return 'NSF0101'
  }

  const prefix = role === 'BUYER' ? 'NSB' : role === 'ADMIN' ? 'NSA' : 'NSF'
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 10000
  }
  return `${prefix}${String(hash).padStart(4, '0')}`
}
