import { apiClient } from './client'
import type { UserRole } from '@/types'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  phone: string
  district: string
  state: string
  isVerified: boolean
  language: string
  farmerId?: string
  buyerId?: string
  farmSize?: string | null
  cropsGrown?: string | null
  address?: string | null
  organization?: string | null
  buyerType?: string | null
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface RegisterPayload {
  email: string
  password: string
  role: 'FARMER' | 'BUYER'
  name: string
  phone: string
  district?: string
  organization?: string
  buyerType?: string
  language?: 'en' | 'ta'
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiClient<AuthUser>('/auth/me'),
}
