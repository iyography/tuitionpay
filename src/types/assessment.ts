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

export const MAJOR_CARD_ISSUERS = [
  'Chase',
  'American Express',
  'Capital One',
  'Citi',
  'Bank of America',
  'Wells Fargo',
  'Discover',
  'US Bank',
  'Barclays',
] as const

export interface AssessmentData {
  // Step 1: School Selection
  schoolId: string
  schoolName: string

  // Step 2: Student Info
  studentName: string
  studentIdentifier?: string

  // Step 3: Tuition Amount
  tuitionAmount: number

  // Step 4: Credit Score
  creditScoreRange: CreditScoreRange

  // Step 5: Current Cards
  currentCards: string[]

  // Step 6: Monthly Spend Capacity
  monthlySpendCapacity: number

  // Step 7: Rewards Preference
  preferredRewardsType: RewardsPreference

  // Step 8: Business Cards
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
  { id: 5, title: 'Current Cards', description: 'Cards you already have' },
  { id: 6, title: 'Spend Capacity', description: 'Monthly spending ability' },
  { id: 7, title: 'Rewards Type', description: 'Your reward preference' },
  { id: 8, title: 'Business Cards', description: 'Open to business cards?' },
]

export const WIZARD_TOTAL_STEPS = 8
