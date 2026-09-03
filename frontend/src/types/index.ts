export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  isVerified: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface NavItem {
  labelKey: string
  href: string
  icon?: string
}
