import { z } from 'zod'

// School selection schema
export const schoolSelectionSchema = z.object({
  schoolId: z.string().uuid('Please select a valid school'),
  schoolName: z.string().min(1, 'School name is required'),
})

// Student info schema
export const studentInfoSchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  studentIdentifier: z.string().optional(),
})

// Tuition amount schema
export const tuitionAmountSchema = z.object({
  tuitionAmount: z
    .number({ message: 'Tuition amount is required' })
    .min(100, 'Minimum tuition amount is $100')
    .max(100000, 'Maximum tuition amount is $100,000'),
})

// Credit score schema
export const creditScoreSchema = z.object({
  creditScoreRange: z.enum(['excellent', 'good', 'fair', 'below'], {
    message: 'Please select your credit score range',
  }),
})

// Current cards schema
export const currentCardsSchema = z.object({
  currentCards: z.array(z.string()).default([]),
})

// Monthly spend capacity schema
export const monthlySpendCapacitySchema = z.object({
  monthlySpendCapacity: z
    .number({ message: 'Monthly spend capacity is required' })
    .min(0, 'Spend capacity cannot be negative')
    .max(50000, 'Maximum monthly spend is $50,000'),
})

// Rewards preference schema
export const rewardsPreferenceSchema = z.object({
  preferredRewardsType: z.enum(['cash_back', 'travel_points', 'statement_credits', 'flexible'], {
    message: 'Please select your reward preference',
  }),
})

// Business cards schema
export const businessCardsSchema = z.object({
  openToBusinessCards: z.boolean().default(false),
})

// Complete assessment schema
export const assessmentSchema = z.object({
  schoolId: z.string().uuid(),
  schoolName: z.string().min(1),
  studentName: z.string().min(2),
  studentIdentifier: z.string().optional(),
  parentEmail: z.string().email().optional(),
  tuitionAmount: z.number().min(100).max(100000),
  creditScoreRange: z.enum(['excellent', 'good', 'fair', 'below']),
  currentCards: z.array(z.string()),
  monthlySpendCapacity: z.number().min(0).max(50000),
  preferredRewardsType: z.enum(['cash_back', 'travel_points', 'statement_credits', 'flexible']),
  openToBusinessCards: z.boolean(),
  preferredAirlines: z.array(z.string()).optional(),
  preferredHotels: z.array(z.string()).optional(),
})

// Payment form schema
export const paymentFormSchema = z.object({
  schoolId: z.string().uuid('Please select a valid school'),
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  studentIdentifier: z.string().optional(),
  parentEmail: z.string().email('Please enter a valid email address'),
  amount: z
    .number({ message: 'Payment amount is required' })
    .min(1, 'Minimum payment is $1')
    .max(100000, 'Maximum payment is $100,000'),
})

// Admin login schema
export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Credit card schema (for admin management)
export const creditCardSchema = z.object({
  card_name: z.string().min(2, 'Card name is required'),
  issuer: z.string().min(2, 'Issuer is required'),
  signup_bonus_value: z.number().nullable(),
  signup_bonus_requirement: z.string().nullable(),
  signup_bonus_timeframe: z.string().nullable(),
  annual_fee: z.number().default(0),
  first_year_waived: z.boolean().default(false),
  rewards_rate: z.number().nullable(),
  rewards_type: z.string().nullable(),
  min_credit_score: z.number().nullable(),
  is_business_card: z.boolean().default(false),
  application_url: z.string().url().nullable().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export type SchoolSelectionData = z.infer<typeof schoolSelectionSchema>
export type StudentInfoData = z.infer<typeof studentInfoSchema>
export type TuitionAmountData = z.infer<typeof tuitionAmountSchema>
export type CreditScoreData = z.infer<typeof creditScoreSchema>
export type CurrentCardsData = z.infer<typeof currentCardsSchema>
export type MonthlySpendCapacityData = z.infer<typeof monthlySpendCapacitySchema>
export type RewardsPreferenceData = z.infer<typeof rewardsPreferenceSchema>
export type BusinessCardsData = z.infer<typeof businessCardsSchema>
export type AssessmentData = z.infer<typeof assessmentSchema>
export type PaymentFormData = z.infer<typeof paymentFormSchema>
export type AdminLoginData = z.infer<typeof adminLoginSchema>
export type CreditCardFormData = z.infer<typeof creditCardSchema>
