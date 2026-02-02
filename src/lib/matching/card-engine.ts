import type { CreditCard } from '@/types/database'
import type { CardRecommendationResult, CardMatchingCriteria, SavingsBreakdown, PartnerValuation } from '@/types/cards'
import { getCreditScoreMinimum } from '@/types/cards'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PROCESSING_FEE_RATE = 0.03
const MIN_TUITION_FOR_SPLIT = 6000
const DEFAULT_CREDIT_SCORE = 700
const MAX_CARDS_TO_PROCESS = 500
const MAX_SPLIT_CANDIDATES = 10
const MAX_INPUT_STRING_LENGTH = 200
const CATEGORY_PREFERENCE_MULTIPLIER = 1.2
const PREFERRED_PARTNER_MULTIPLIER = 1.4

// Travel partner multipliers (from revision doc)
const TRAVEL_MULTIPLIERS = {
  delta: 1.2,
  southwest: 1.5,
  hyatt: 2.2,
  united: 1.2,
  aa: 1.3,
  marriott: 0.7,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const CardMatchingCriteriaSchema = z.object({
  tuitionAmount: z.number()
    .min(100, 'Tuition must be at least $100')
    .max(500000, 'Tuition cannot exceed $500,000'),
  creditScoreRange: z.string().optional(),
  preferredRewardsType: z.enum(['cash_back', 'travel_points', 'flexible']),
  currentCards: z.array(z.string()).default([]),
  amexHistoryCards: z.array(z.string()).default([]),
  preferredAirlines: z.array(z.string()).optional(),
  preferredHotels: z.array(z.string()).optional(),
  openToBusinessCards: z.boolean().default(false),
  recentCardApplications: z.string().default('0'),
  monthlySpendCapacity: z.number().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

function isValidCreditCard(card: unknown): card is CreditCard {
  if (!card || typeof card !== 'object') return false
  const c = card as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.card_name === 'string' &&
    typeof c.issuer === 'string'
  )
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMOIZATION & CACHING
// ═══════════════════════════════════════════════════════════════════════════

const spendRequirementCache = new Map<string, number>()

interface CardMetadata {
  normalizedName: string
  issuerLower: string
  isAmex: boolean
  isChase: boolean
  isPersonalPlatinum: boolean
  isPersonalGold: boolean
  isBusinessPlatinum: boolean
  isBusinessGold: boolean
  isChaseInk: boolean
  spendRequirement: number
  category: 'cash_back' | 'travel'
  primaryAirline: string | null
  primaryHotel: string | null
  isFlexiblePointsCard: boolean
}

const cardMetadataCache = new WeakMap<CreditCard, CardMetadata>()

// Clear spend requirement cache if it gets too large
function maintainCache(): void {
  if (spendRequirementCache.size > 500) {
    spendRequirementCache.clear()
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function safeRound(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

/**
 * Parse spend requirement from card description
 * @example "Spend $4,000 in 3 months" -> 4000
 */
function parseSpendRequirement(requirement: string | null): number {
  if (!requirement) return 0

  // Check cache
  const cached = spendRequirementCache.get(requirement)
  if (cached !== undefined) return cached

  try {
    // Limit input length for security
    const sanitized = requirement.slice(0, MAX_INPUT_STRING_LENGTH)
    const match = sanitized.match(/\$?([\d,]+)/)

    if (!match?.[1]) {
      spendRequirementCache.set(requirement, 0)
      return 0
    }

    const parsed = Number(match[1].replace(/,/g, ''))
    const result = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0

    spendRequirementCache.set(requirement, result)
    return result
  } catch (error) {
    console.error('[card-engine] Failed to parse spend requirement:', { requirement, error })
    spendRequirementCache.set(requirement, 0)
    return 0
  }
}

/**
 * Pre-compute card metadata for efficient filtering
 */
function getCardMetadata(card: CreditCard): CardMetadata {
  const cached = cardMetadataCache.get(card)
  if (cached) return cached

  const cardNameLower = card.card_name.toLowerCase()
  const issuerLower = card.issuer.toLowerCase()

  const metadata: CardMetadata = {
    normalizedName: cardNameLower,
    issuerLower,
    isAmex: issuerLower.includes('amex') || issuerLower.includes('american express'),
    isChase: issuerLower.includes('chase'),
    isPersonalPlatinum: cardNameLower.includes('platinum') && !cardNameLower.includes('business'),
    isPersonalGold: cardNameLower.includes('gold') && !cardNameLower.includes('business'),
    isBusinessPlatinum: cardNameLower.includes('platinum') && cardNameLower.includes('business'),
    isBusinessGold: cardNameLower.includes('gold') && cardNameLower.includes('business'),
    isChaseInk: cardNameLower.includes('ink') && issuerLower.includes('chase'),
    spendRequirement: parseSpendRequirement(card.signup_bonus_requirement),
    category: getCardCategory(card),
    primaryAirline: getCardPrimaryAirline(cardNameLower),
    primaryHotel: getCardPrimaryHotel(cardNameLower),
    isFlexiblePointsCard: checkIsFlexiblePointsCard(cardNameLower, issuerLower),
  }

  cardMetadataCache.set(card, metadata)
  return metadata
}

function getCardCategory(card: CreditCard): 'cash_back' | 'travel' {
  const rewardsType = card.rewards_type?.toLowerCase() ?? ''
  const cardName = card.card_name.toLowerCase()

  if (
    rewardsType.includes('cash') ||
    cardName.includes('cash') ||
    cardName.includes('quicksilver') ||
    cardName.includes('double cash')
  ) {
    return 'cash_back'
  }
  return 'travel'
}

function getCardPrimaryAirline(cardNameLower: string): string | null {
  if (cardNameLower.includes('delta')) return 'Delta'
  if (cardNameLower.includes('united')) return 'United'
  if (cardNameLower.includes('southwest')) return 'Southwest'
  if (cardNameLower.includes('aadvantage') || cardNameLower.includes('american airlines')) return 'American Airlines'
  return null
}

function getCardPrimaryHotel(cardNameLower: string): string | null {
  if (cardNameLower.includes('hyatt')) return 'Hyatt'
  if (cardNameLower.includes('marriott') || cardNameLower.includes('bonvoy')) return 'Marriott'
  if (cardNameLower.includes('hilton')) return 'Hilton'
  return null
}

function checkIsFlexiblePointsCard(cardNameLower: string, issuerLower: string): boolean {
  return (
    cardNameLower.includes('sapphire') ||
    cardNameLower.includes('venture x') ||
    cardNameLower.includes('venture') ||
    (cardNameLower.includes('gold') && issuerLower.includes('amex')) ||
    (cardNameLower.includes('platinum') && issuerLower.includes('amex')) ||
    cardNameLower.includes('membership rewards')
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVINGS CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate savings breakdown for a card
 */
function calculateSavingsBreakdown(
  card: CreditCard,
  tuitionAmount: number
): SavingsBreakdown {
  try {
    const signupBonusValue = card.signup_bonus_value ?? 0
    const rewardsRate = (card.rewards_rate ?? 1) / 100
    const rewardsEarned = tuitionAmount * rewardsRate
    const annualFeeImpact = card.first_year_waived ? 0 : -(card.annual_fee ?? 0)
    const processingFee = tuitionAmount * PROCESSING_FEE_RATE
    const netFirstYearValue = signupBonusValue + rewardsEarned + annualFeeImpact - processingFee

    return {
      signupBonusValue,
      rewardsEarned: safeRound(rewardsEarned),
      annualFeeImpact,
      processingFee: safeRound(processingFee),
      netFirstYearValue: safeRound(netFirstYearValue),
    }
  } catch (error) {
    console.error('[card-engine] Failed to calculate savings:', { cardId: card.id, error })
    return {
      signupBonusValue: 0,
      rewardsEarned: 0,
      annualFeeImpact: 0,
      processingFee: safeRound(tuitionAmount * PROCESSING_FEE_RATE),
      netFirstYearValue: 0,
    }
  }
}

/**
 * Get partner-specific valuations for a card
 */
export function getPartnerValuations(card: CreditCard): PartnerValuation[] {
  if (!isValidCreditCard(card)) return []

  try {
    const valuations: PartnerValuation[] = []
    const pointCashValue = card.point_cash_value ?? 1

    if (card.cash_value) {
      valuations.push({ partner: 'Cash Back', value: card.cash_value, centsPerPoint: pointCashValue })
    }
    if (card.hyatt_value) {
      valuations.push({ partner: 'Hyatt', value: card.hyatt_value, centsPerPoint: TRAVEL_MULTIPLIERS.hyatt })
    }
    if (card.delta_value) {
      valuations.push({ partner: 'Delta', value: card.delta_value, centsPerPoint: TRAVEL_MULTIPLIERS.delta })
    }
    if (card.marriott_value) {
      valuations.push({ partner: 'Marriott', value: card.marriott_value, centsPerPoint: TRAVEL_MULTIPLIERS.marriott })
    }
    if (card.southwest_value) {
      valuations.push({ partner: 'Southwest', value: card.southwest_value, centsPerPoint: TRAVEL_MULTIPLIERS.southwest })
    }
    if (card.united_value) {
      valuations.push({ partner: 'United', value: card.united_value, centsPerPoint: TRAVEL_MULTIPLIERS.united })
    }
    if (card.aa_value) {
      valuations.push({ partner: 'American Airlines', value: card.aa_value, centsPerPoint: TRAVEL_MULTIPLIERS.aa })
    }

    return valuations
  } catch (error) {
    console.error('[card-engine] Failed to get partner valuations:', { cardId: card.id, error })
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTERING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if card should be excluded based on AMEX history
 */
function shouldExcludeBasedOnAmexHistory(
  meta: CardMetadata,
  amexHistoryCards: string[]
): boolean {
  if (!amexHistoryCards.length) return false
  if (amexHistoryCards.includes('None of the above')) return false
  if (!meta.isAmex) return false

  const historySet = new Set(amexHistoryCards)

  // Personal Platinum history excludes both Personal Gold and Platinum
  if (historySet.has('AMEX Personal Platinum')) {
    if (meta.isPersonalPlatinum || meta.isPersonalGold) return true
  }

  // Personal Gold history excludes only Personal Gold
  if (historySet.has('AMEX Personal Gold')) {
    if (meta.isPersonalGold) return true
  }

  // Business Platinum history excludes both Business Gold and Platinum
  if (historySet.has('AMEX Business Platinum')) {
    if (meta.isBusinessPlatinum || meta.isBusinessGold) return true
  }

  // Business Gold history excludes only Business Gold
  if (historySet.has('AMEX Business Gold')) {
    if (meta.isBusinessGold) return true
  }

  return false
}

/**
 * Check if user already has this card
 */
function userHasCard(meta: CardMetadata, currentCards: string[]): boolean {
  if (!currentCards.length) return false

  for (const userCard of currentCards) {
    const userCardLower = userCard.toLowerCase()
    if (
      meta.normalizedName.includes(userCardLower) ||
      userCardLower.includes(meta.normalizedName) ||
      meta.normalizedName.replace('chase ', '').includes(userCardLower.replace('chase ', '')) ||
      meta.normalizedName.replace('amex ', '').includes(userCardLower.replace('amex ', ''))
    ) {
      return true
    }
  }
  return false
}

/**
 * Check if card should be excluded based on partner preferences
 */
function shouldExcludeByPartnerPreference(
  meta: CardMetadata,
  preferredAirlines?: string[],
  preferredHotels?: string[]
): boolean {
  if (meta.isFlexiblePointsCard) return false

  if (meta.primaryAirline && preferredAirlines?.length) {
    const hasSpecificPref = preferredAirlines.some(a => !a.includes('Any'))
    if (hasSpecificPref && !preferredAirlines.some(a => a.includes(meta.primaryAirline!))) {
      return true
    }
  }

  if (meta.primaryHotel && preferredHotels?.length) {
    const hasSpecificPref = preferredHotels.some(h => !h.includes('Any'))
    if (hasSpecificPref && !preferredHotels.some(h => h.includes(meta.primaryHotel!))) {
      return true
    }
  }

  return false
}

/**
 * Filter cards based on criteria
 */
function filterCards(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CreditCard[] {
  const userMinScore = criteria.creditScoreRange
    ? getCreditScoreMinimum(criteria.creditScoreRange)
    : DEFAULT_CREDIT_SCORE

  // Limit cards for performance
  const limitedCards = cards.slice(0, MAX_CARDS_TO_PROCESS)

  return limitedCards.filter(card => {
    if (!isValidCreditCard(card)) return false

    const meta = getCardMetadata(card)

    // Credit score check
    if (card.min_credit_score && card.min_credit_score > userMinScore) {
      return false
    }

    // Business card preference
    if (card.is_business_card && !criteria.openToBusinessCards) {
      return false
    }

    // Already owned
    if (userHasCard(meta, criteria.currentCards)) {
      return false
    }

    // Chase 5/24 rule
    if (criteria.recentCardApplications === '5+' && meta.isChase) {
      return false
    }

    // AMEX history
    if (shouldExcludeBasedOnAmexHistory(meta, criteria.amexHistoryCards)) {
      return false
    }

    // Spend requirement must be <= tuition
    if (meta.spendRequirement > criteria.tuitionAmount) {
      return false
    }

    // Partner preferences
    if (shouldExcludeByPartnerPreference(meta, criteria.preferredAirlines, criteria.preferredHotels)) {
      return false
    }

    return true
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Score card based on user preferences
 */
function scoreByPreference(
  card: CreditCard,
  preferredRewardsType: string,
  preferredAirlines?: string[],
  preferredHotels?: string[]
): number {
  const rewardsType = card.rewards_type?.toLowerCase() ?? ''
  const meta = getCardMetadata(card)

  switch (preferredRewardsType) {
    case 'cash_back':
      if (rewardsType.includes('cash')) return CATEGORY_PREFERENCE_MULTIPLIER
      break
    case 'travel_points': {
      if (rewardsType.includes('travel') || rewardsType.includes('points') || rewardsType.includes('miles')) {
        let multiplier = CATEGORY_PREFERENCE_MULTIPLIER

        if (meta.primaryAirline && preferredAirlines?.some(a => a.includes(meta.primaryAirline!))) {
          multiplier = PREFERRED_PARTNER_MULTIPLIER
        }
        if (meta.primaryHotel && preferredHotels?.some(h => h.includes(meta.primaryHotel!))) {
          multiplier = PREFERRED_PARTNER_MULTIPLIER
        }

        return multiplier
      }
      break
    }
    case 'flexible': {
      // Flexible preference: give equal boost to both cash back and travel cards
      // Still apply partner preferences for travel cards if user specified airlines/hotels
      if (rewardsType.includes('cash')) {
        return CATEGORY_PREFERENCE_MULTIPLIER
      }
      if (rewardsType.includes('travel') || rewardsType.includes('points') || rewardsType.includes('miles')) {
        let multiplier = CATEGORY_PREFERENCE_MULTIPLIER

        if (meta.primaryAirline && preferredAirlines?.some(a => a.includes(meta.primaryAirline!))) {
          multiplier = PREFERRED_PARTNER_MULTIPLIER
        }
        if (meta.primaryHotel && preferredHotels?.some(h => h.includes(meta.primaryHotel!))) {
          multiplier = PREFERRED_PARTNER_MULTIPLIER
        }

        return multiplier
      }
      return 1.0
    }
  }

  return 1.0
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN RECOMMENDATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determine display type for card rewards
 */
export function getRewardsDisplayType(card: CreditCard): 'cash_back' | 'travel_points' | 'airline_miles' | 'hotel_points' {
  const rewardsType = card.rewards_type?.toLowerCase() ?? ''
  if (rewardsType.includes('airline') || rewardsType.includes('miles')) return 'airline_miles'
  if (rewardsType.includes('hotel')) return 'hotel_points'
  if (rewardsType.includes('cash')) return 'cash_back'
  if (rewardsType.includes('travel') || rewardsType.includes('points')) return 'travel_points'
  return 'cash_back'
}

/**
 * Calculate card recommendations
 */
export function calculateRecommendations(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CardRecommendationResult[] {
  try {
    maintainCache()

    // Validate criteria
    const validationResult = CardMatchingCriteriaSchema.safeParse(criteria)
    if (!validationResult.success) {
      const issues = validationResult.error.issues
      console.error('[card-engine] Invalid criteria:', issues)
      throw new Error(`Invalid criteria: ${issues.map(e => e.message).join(', ')}`)
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      console.warn('[card-engine] No cards provided')
      return []
    }

    // Filter eligible cards
    const eligibleCards = filterCards(cards, criteria)

    if (eligibleCards.length === 0) {
      console.info('[card-engine] No eligible cards found')
      return []
    }

    // Calculate savings for each card
    const cardResults: CardRecommendationResult[] = eligibleCards.map(card => {
      const breakdown = calculateSavingsBreakdown(card, criteria.tuitionAmount)
      const preferenceMultiplier = scoreByPreference(
        card,
        criteria.preferredRewardsType,
        criteria.preferredAirlines,
        criteria.preferredHotels
      )

      const adjustedSavings = breakdown.netFirstYearValue * preferenceMultiplier

      return {
        card,
        estimatedSavings: safeRound(adjustedSavings),
        breakdown,
        rank: 0,
      }
    })

    // Sort by savings descending
    cardResults.sort((a, b) => b.estimatedSavings - a.estimatedSavings)

    // Get top recommendations with category diversity
    const topCards = cardResults.slice(0, 3)

    if (criteria.preferredRewardsType === 'flexible') {
      // For flexible preference: ensure we have both cash back AND travel cards
      const hasCashBack = topCards.some(r => getCardMetadata(r.card).category === 'cash_back')
      const hasTravel = topCards.some(r => getCardMetadata(r.card).category === 'travel')

      const results = [...topCards]

      // Add best cash back if missing
      if (!hasCashBack) {
        const cashBackCard = cardResults.find(r => {
          const meta = getCardMetadata(r.card)
          const notInTop3 = !topCards.some(t => t.card.id === r.card.id)
          return meta.category === 'cash_back' && notInTop3
        })
        if (cashBackCard) results.push(cashBackCard)
      }

      // Add best travel if missing
      if (!hasTravel) {
        const travelCard = cardResults.find(r => {
          const meta = getCardMetadata(r.card)
          const notInTop3 = !topCards.some(t => t.card.id === r.card.id)
          return meta.category === 'travel' && notInTop3
        })
        if (travelCard) results.push(travelCard)
      }

      // Assign ranks
      return results.map((result, index) => ({
        ...result,
        rank: index + 1,
      }))
    }

    // For cash_back or travel_points preference: add alternate category card
    const userCategory = criteria.preferredRewardsType === 'cash_back' ? 'cash_back' : 'travel'
    const alternateCategory = userCategory === 'cash_back' ? 'travel' : 'cash_back'

    // Find alternate category card if not already in top 3
    const alternateCard = cardResults.find(r => {
      const meta = getCardMetadata(r.card)
      const notInTop3 = !topCards.some(t => t.card.id === r.card.id)
      return meta.category === alternateCategory && notInTop3
    })

    const results = [...topCards]
    if (alternateCard) {
      results.push(alternateCard)
    }

    // Assign ranks
    return results.map((result, index) => ({
      ...result,
      rank: index + 1,
    }))

  } catch (error) {
    console.error('[card-engine] Failed to calculate recommendations:', error)
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid criteria: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPLIT STRATEGY
// ═══════════════════════════════════════════════════════════════════════════

export interface SplitStrategy {
  cards: {
    card: CreditCard
    allocatedAmount: number
    breakdown: SavingsBreakdown
  }[]
  totalSavings: number
  totalTuition: number
  savingsPercentage: number
}

/**
 * Calculate split payment strategies for higher tuition amounts
 */
export function calculateSplitStrategies(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): SplitStrategy | null {
  try {
    const tuitionAmount = criteria.tuitionAmount

    // Only suggest split for larger tuition amounts
    if (tuitionAmount < MIN_TUITION_FOR_SPLIT) return null

    // Get eligible cards sorted by signup bonus
    const eligibleCards = filterCards(cards, criteria)
      .filter(card => isFinitePositive(card.signup_bonus_value))
      .sort((a, b) => (b.signup_bonus_value ?? 0) - (a.signup_bonus_value ?? 0))
      .slice(0, MAX_SPLIT_CANDIDATES) // Limit for performance

    if (eligibleCards.length < 2) return null

    const strategies: SplitStrategy[] = []

    // Find best 2-card combinations
    for (let i = 0; i < eligibleCards.length; i++) {
      for (let j = i + 1; j < eligibleCards.length; j++) {
        const card1 = eligibleCards[i]
        const card2 = eligibleCards[j]

        const meta1 = getCardMetadata(card1)
        const meta2 = getCardMetadata(card2)

        // One card per bank rule: cannot have two cards from the same issuer
        if (meta1.issuerLower === meta2.issuerLower) continue

        const req1 = meta1.spendRequirement
        const req2 = meta2.spendRequirement

        // Skip if combined requirements exceed tuition
        if (req1 + req2 > tuitionAmount * 1.5) continue

        // Allocate tuition between cards
        let allocation1 = Math.min(req1, tuitionAmount)
        let allocation2 = tuitionAmount - allocation1

        // Adjust if card2 needs more
        if (allocation2 < req2 && allocation1 > req1) {
          const excess = allocation1 - req1
          const needed = req2 - allocation2
          const transfer = Math.min(excess, needed)
          allocation1 -= transfer
          allocation2 += transfer
        }

        const canMeet1 = allocation1 >= req1
        const canMeet2 = allocation2 >= req2

        const breakdown1 = calculateSavingsBreakdown(card1, allocation1)
        const breakdown2 = calculateSavingsBreakdown(card2, allocation2)

        const totalSavings =
          (canMeet1 ? breakdown1.signupBonusValue : 0) +
          (canMeet2 ? breakdown2.signupBonusValue : 0) +
          breakdown1.rewardsEarned +
          breakdown2.rewardsEarned +
          breakdown1.annualFeeImpact +
          breakdown2.annualFeeImpact -
          breakdown1.processingFee -
          breakdown2.processingFee

        strategies.push({
          cards: [
            {
              card: card1,
              allocatedAmount: allocation1,
              breakdown: canMeet1 ? breakdown1 : { ...breakdown1, signupBonusValue: 0 },
            },
            {
              card: card2,
              allocatedAmount: allocation2,
              breakdown: canMeet2 ? breakdown2 : { ...breakdown2, signupBonusValue: 0 },
            },
          ],
          totalSavings: safeRound(totalSavings),
          totalTuition: tuitionAmount,
          savingsPercentage: Math.round((totalSavings / tuitionAmount) * 100),
        })
      }
    }

    if (strategies.length === 0) return null

    // Return best strategy
    strategies.sort((a, b) => b.totalSavings - a.totalSavings)
    return strategies[0]

  } catch (error) {
    console.error('[card-engine] Failed to calculate split strategies:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$0'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(rate: number): string {
  if (!Number.isFinite(rate)) return '0%'
  return `${rate}%`
}

export function generateSavingsExplanation(
  result: CardRecommendationResult,
  tuitionAmount: number
): string {
  try {
    const { breakdown, card } = result
    const lines: string[] = []

    if (breakdown.signupBonusValue > 0) {
      lines.push(
        `Signup bonus: ${formatCurrency(breakdown.signupBonusValue)} ` +
        `(${card.signup_bonus_requirement ?? 'Meet spend requirement'})`
      )
    }

    lines.push(
      `Rewards on ${formatCurrency(tuitionAmount)} tuition: ` +
      `${formatCurrency(breakdown.rewardsEarned)} ` +
      `(${card.rewards_rate ?? 1}% back)`
    )

    if (breakdown.annualFeeImpact < 0) {
      lines.push(`Annual fee: -${formatCurrency(Math.abs(breakdown.annualFeeImpact))}`)
    } else if (card.annual_fee && card.annual_fee > 0 && card.first_year_waived) {
      lines.push(`Annual fee: ${formatCurrency(card.annual_fee)} (waived first year)`)
    }

    lines.push(`Processing fee (3%): -${formatCurrency(breakdown.processingFee)}`)
    lines.push(`Net first-year value: ${formatCurrency(breakdown.netFirstYearValue)}`)

    return lines.join('\n')
  } catch (error) {
    console.error('[card-engine] Failed to generate explanation:', error)
    return 'Unable to generate savings explanation'
  }
}
