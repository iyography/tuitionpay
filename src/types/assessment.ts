export type CreditScoreRange =
  | 'excellent' // 750+
  | 'good'      // 700-749
  | 'fair'      // 650-699
  | 'below'     // Below 650

export type RewardsPreference =
  | 'cash_back'
  | 'travel_points'
  | 'flexible'

export type RecentCardApplications =
  | '0'
  | '1-2'
  | '3-4'
  | '5+'

export const CREDIT_SCORE_RANGES: Record<CreditScoreRange, { label: string; min: number; max: number }> = {
  excellent: { label: 'Excellent (750+)', min: 750, max: 850 },
  good: { label: 'Good (700-749)', min: 700, max: 749 },
  fair: { label: 'Fair (650-699)', min: 650, max: 699 },
  below: { label: 'Below 650', min: 300, max: 649 },
}

export const REWARDS_PREFERENCES: Record<RewardsPreference, string> = {
  cash_back: 'Cash Back',
  travel_points: 'Travel Points',
  flexible: 'Flexible (Any)',
}

export const RECENT_CARD_OPTIONS: Record<RecentCardApplications, string> = {
  '0': 'None',
  '1-2': '1-2 cards',
  '3-4': '3-4 cards',
  '5+': '5 or more cards',
}

export const AIRLINE_PARTNERS = [
  'American Airlines',
  'Delta',
  'United',
  'Southwest',
  'Any / No Preference',
] as const

export const HOTEL_PARTNERS = [
  'Hyatt (Best Value)',
  'Marriott',
  'Any / No Preference',
] as const

// Only include issuers we have cards for
export const MAJOR_CARD_ISSUERS = [
  'Chase',
  'American Express',
  'Capital One',
  'Citi',
] as const

// AMEX cards to check for history (affects eligibility)
export const AMEX_HISTORY_CARDS = [
  'AMEX Personal Gold',
  'AMEX Personal Platinum',
  'AMEX Business Gold',
  'AMEX Business Platinum',
  'None of the above',
] as const

export type AmexHistoryCard = typeof AMEX_HISTORY_CARDS[number]

export interface AssessmentData {
  // Step 1: School Selection
  schoolId: string
  schoolName: string

  // Step 2: Parent Info
  studentName: string // Now used for parent's full name (kept field name for backward compat)
  studentIdentifier?: string // Removed from form but kept for backward compat
  parentEmail: string

  // Step 3: Tuition Amount
  tuitionAmount: number

  // Step 4: Recent Card Applications (last 24 months) + AMEX History
  recentCardApplications: RecentCardApplications
  amexHistoryCards: string[] // Which AMEX cards user has had

  // Step 5: Current Cards (specific cards they currently have)
  currentCards: string[] // Now stores specific card names, not just issuers

  // Step 6: Rewards Preference
  preferredRewardsType: RewardsPreference
  preferredAirlines?: string[]
  preferredHotels?: string[]

  // Step 7: Business Cards
  openToBusinessCards: boolean

  // Legacy fields (kept for compatibility but not used in new flow)
  creditScoreRange?: CreditScoreRange
  monthlySpendCapacity?: number
}

export interface AssessmentStep {
  id: number
  title: string
  description: string
}

export const ASSESSMENT_STEPS: AssessmentStep[] = [
  { id: 1, title: 'Select School', description: 'Choose your school' },
  { id: 2, title: 'Student Info', description: 'Enter student details' },
  { id: 3, title: 'Tuition Amount', description: 'How much are you paying?' },
  { id: 4, title: 'Card History', description: 'Personal cards in last 24 months' },
  { id: 5, title: 'Current Cards', description: 'Cards you already have' },
  { id: 6, title: 'Rewards Type', description: 'Your reward preference' },
  { id: 7, title: 'Business Cards', description: 'Open to business cards?' },
]

export const WIZARD_TOTAL_STEPS = 7
