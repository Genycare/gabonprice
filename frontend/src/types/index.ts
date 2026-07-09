export type PriceStatus = 'active' | 'flagged' | 'removed'
export type ReportStatus = 'pending' | 'reviewed'
export type UserLevel = 'Débutant' | 'Contributeur' | 'Confirmé' | 'Expert'

export interface User {
  id: string
  phone: string
  username: string
  karmaScore: number
  level: UserLevel
  preferredProvince: string | null
  isBanned: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  medianPrice: number | null
  priceTrend7d: number | null
  createdAt: string
}

export interface Price {
  id: string
  productId: string
  userId: string
  amount: number
  storeName: string
  province: string
  city: string
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  purchaseDate: string
  photoUrl: string | null
  status: PriceStatus
  isMedianOutlier: boolean
  helpfulVotes: number
  unhelpfulVotes: number
  createdAt: string
}

export interface PriceRating {
  id: string
  priceId: string
  userId: string
  rating: 1 | -1
}

export interface PriceReport {
  id: string
  priceId: string
  userId: string
  reason: string
  status: ReportStatus
}

export interface PriceHistoryPoint {
  id: string
  productId: string
  medianPrice: number
  recordedOn: string
}
