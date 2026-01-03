import type { CreditCard } from './database'

export interface CardRecommendationResult {
  card: CreditCard
  estimatedSavings: number
  breakdown: SavingsBreakdown
  rank: number
}

export interface SavingsBreakdown {
  signupBonusValue: number
  rewardsEarned: number
  annualFeeImpact: number
  netFirstYearValue: number
}

export interface CardMatchingCriteria {
  creditScoreRange?: string
  currentCards: string[] // Now stores specific card names
  monthlySpendCapacity?: number
  preferredRewardsType: string
  openToBusinessCards: boolean
  tuitionAmount: number
  recentCardApplications: string // '0', '1-2', '3-4', '5+'
  amexHistoryCards: string[] // Which AMEX cards user has had
}

export function getCreditScoreMinimum(range: string): number {
  switch (range) {
    case 'excellent':
      return 750
    case 'good':
      return 700
    case 'fair':
      return 650
    case 'below':
      return 300
    default:
      return 0
  }
}
