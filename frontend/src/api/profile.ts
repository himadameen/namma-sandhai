import { apiClient, API_BASE } from './client'

export type KycStatus = 'NOT_STARTED' | 'INCOMPLETE' | 'SUBMITTED' | 'VERIFIED'

export type DocumentType = 'GOVT_ID' | 'LAND_RECORD' | 'BANK_PROOF' | 'GST_CERT'

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ProfileDocument {
  id: string
  type: DocumentType
  fileUrl: string
  fileName: string
  status: DocumentStatus
  submittedAt: string
  updatedAt: string
}

export interface KycSummary {
  status: KycStatus
  requiredDocuments: { type: DocumentType; uploaded: boolean }[]
  uploadedCount: number
  requiredCount: number
}

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
  profileImageUrl: string | null
  createdAt: string
  updatedAt: string
  documents: ProfileDocument[]
  kyc: KycSummary
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
  profileImageUrl: string | null
  createdAt: string
  updatedAt: string
  documents: ProfileDocument[]
  kyc: KycSummary
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

export interface AdminProfile {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  language: string
  profileImageUrl: string | null
  adminRoleName: string | null
  createdAt: string
  updatedAt: string
}

export type UpdateAdminProfilePayload = {
  name: string
  phone?: string
  language?: 'en' | 'ta'
}

async function uploadProfileFile(
  endpoint: string,
  file: File,
  extraFields?: Record<string, string>
) {
  const token = localStorage.getItem('namma-sandhai-token')
  const formData = new FormData()
  formData.append('file', file)
  if (extraFields) {
    Object.entries(extraFields).forEach(([key, value]) => formData.append(key, value))
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Upload failed')
  }
  return data.data
}

export const profileApi = {
  getFarmerProfile: () => apiClient<FarmerProfile>('/farmers/profile'),
  updateFarmerProfile: (data: UpdateFarmerProfilePayload) =>
    apiClient<FarmerProfile>('/farmers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadFarmerAvatar: (file: File) =>
    uploadProfileFile('/farmers/profile/avatar', file) as Promise<FarmerProfile>,
  uploadFarmerDocument: (file: File, type: DocumentType) =>
    uploadProfileFile('/farmers/profile/documents', file, { type }) as Promise<FarmerProfile>,

  getBuyerProfile: () => apiClient<BuyerProfile>('/buyers/profile'),
  updateBuyerProfile: (data: UpdateBuyerProfilePayload) =>
    apiClient<BuyerProfile>('/buyers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadBuyerAvatar: (file: File) =>
    uploadProfileFile('/buyers/profile/avatar', file) as Promise<BuyerProfile>,
  uploadBuyerDocument: (file: File, type: DocumentType) =>
    uploadProfileFile('/buyers/profile/documents', file, { type }) as Promise<BuyerProfile>,

  getAdminProfile: () => apiClient<AdminProfile>('/admin/profile'),
  updateAdminProfile: (data: UpdateAdminProfilePayload) =>
    apiClient<AdminProfile>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  uploadAdminAvatar: (file: File) =>
    uploadProfileFile('/admin/profile/avatar', file) as Promise<AdminProfile>,
}

export const FARMER_DOCUMENT_TYPES: DocumentType[] = ['GOVT_ID', 'LAND_RECORD', 'BANK_PROOF']
export const BUYER_DOCUMENT_TYPES: DocumentType[] = ['GOVT_ID', 'BANK_PROOF', 'GST_CERT']

export function defaultKycSummary(types: DocumentType[]): KycSummary {
  return {
    status: 'NOT_STARTED',
    requiredDocuments: types.map((type) => ({ type, uploaded: false })),
    uploadedCount: 0,
    requiredCount: types.length,
  }
}
