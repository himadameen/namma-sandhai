import { apiClient } from './client'

export interface FarmerProfile {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  district: string
  state: string
  farmSize: string | null
  cropsGrown: string | null
  address: string | null
  language: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface BuyerProfile {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  organization: string | null
  district: string
  state: string
  buyerType: string
  address: string | null
  language: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export type UpdateFarmerProfilePayload = {
  name: string
  phone: string
  district: string
  state?: string
  farmSize?: string
  cropsGrown?: string
  address?: string
  language?: 'en' | 'ta'
}

export type UpdateBuyerProfilePayload = {
  name: string
  phone: string
  organization: string
  district: string
  state?: string
  buyerType: string
  address?: string
  language?: 'en' | 'ta'
}

export const profileApi = {
  getFarmerProfile: () => apiClient<FarmerProfile>('/farmers/profile'),
  updateFarmerProfile: (data: UpdateFarmerProfilePayload) =>
    apiClient<FarmerProfile>('/farmers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getBuyerProfile: () => apiClient<BuyerProfile>('/buyers/profile'),
  updateBuyerProfile: (data: UpdateBuyerProfilePayload) =>
    apiClient<BuyerProfile>('/buyers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
