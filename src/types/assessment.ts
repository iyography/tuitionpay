export type CreditScoreRange =
  | 'excellent' // 750+
  | 'good'      // 700-749
  | 'fair'      // 650-699
  | 'below'     // Below 650

export type RewardsPreference =
  | 'cash_back'
  | 'travel_points'
  | 'statement_credits'
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
  statement_credits: 'Statement Credits',
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

export interface AssessmentData {
  // Step 1: School Selection
  schoolId: string
  schoolName: string

  // Step 2: Student Info
  studentName: string
  studentIdentifier?: string
  parentEmail: string

  // Step 3: Tuition Amount
  tuitionAmount: number

  // Step 4: Credit Score
  creditScoreRange: CreditScoreRange

  // Step 5: Recent Card Applications (last 24 months)
  recentCardApplications: RecentCardApplications

  // Step 6: Current Cards
  currentCards: string[]

  // Step 7: Monthly Spend Capacity
  monthlySpendCapacity: number

  // Step 8: Rewards Preference
  preferredRewardsType: RewardsPreference
  preferredAirlines?: string[]
  preferredHotels?: string[]

  // Step 9: Business Cards
  openToBusinessCards: boolean
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
  { id: 4, title: 'Credit Score', description: 'Your credit score range' },
  { id: 5, title: 'Recent Applications', description: 'Cards in last 24 months' },
  { id: 6, title: 'Current Cards', description: 'Cards you already have' },
  { id: 7, title: 'Spend Capacity', description: 'Monthly spending ability' },
  { id: 8, title: 'Rewards Type', description: 'Your reward preference' },
  { id: 9, title: 'Business Cards', description: 'Open to business cards?' },
]

export const WIZARD_TOTAL_STEPS = 9
