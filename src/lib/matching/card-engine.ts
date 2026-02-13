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

// ═══════════════════════════════════════════════════════════════════════════
// POINTS VALUATION MATRIX (Value per 100 points in dollars)
// Based on client specifications
// ═══════════════════════════════════════════════════════════════════════════

interface PointsValuation {
  cash: number
  delta: number | null
  southwest: number | null
  hyatt: number | null
  marriott: number | null
  united: number | null
  aa: number | null
}

const POINTS_VALUATION: Record<string, PointsValuation> = {
  // Generic issuer valuations
  chase: { cash: 1, delta: null, southwest: 1.5, hyatt: 2.2, marriott: null, united: 1.2, aa: null },
  amex: { cash: 0.6, delta: 1.2, southwest: null, hyatt: null, marriott: 0.7, united: null, aa: null },
  hilton: { cash: 1, delta: null, southwest: null, hyatt: null, marriott: 0.7, united: null, aa: null },
  citi: { cash: 1, delta: null, southwest: null, hyatt: null, marriott: null, united: null, aa: null },
  'us bank': { cash: 1, delta: null, southwest: null, hyatt: null, marriott: null, united: null, aa: null },
  'wells fargo': { cash: 1, delta: null, southwest: null, hyatt: null, marriott: null, united: null, aa: null },
  'capital one': { cash: 1, delta: null, southwest: null, hyatt: null, marriott: null, united: null, aa: null },

  // Branded card valuations (override generic)
  delta_amex: { cash: 0, delta: 1.2, southwest: null, hyatt: null, marriott: null, united: null, aa: null },
  southwest_chase: { cash: 0, delta: null, southwest: 1.5, hyatt: null, marriott: null, united: null, aa: null },
  united_chase: { cash: 0, delta: null, southwest: null, hyatt: null, marriott: null, united: 1.2, aa: null },
  citi_aa: { cash: 0, delta: null, southwest: null, hyatt: null, marriott: null, united: null, aa: 1.2 },
}

// Cards that allow Chase transfer partners (Sapphire/Ink Preferred unlock transfers for all Chase cards)
const CHASE_TRANSFER_ENABLERS = [
  'chase sapphire preferred',
  'chase sapphire reserve',
  'chase ink business preferred',
]

// Statement credit cards (bonus not multiplied by points valuation)
const STATEMENT_CREDIT_CARDS = [
  'amex blue cash everyday',
  'citi double cash',
]

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
// TYPE GUARDS & UTILITIES
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

function safeRound(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHING
// ═══════════════════════════════════════════════════════════════════════════

const spendRequirementCache = new Map<string, number>()

interface CardMetadata {
  normalizedName: string
  issuerLower: string
  isAmex: boolean
  isChase: boolean
  isCiti: boolean
  isCapitalOne: boolean
  isWellsFargo: boolean
  isUSBank: boolean
  isPersonalPlatinum: boolean
  isPersonalGold: boolean
  isBusinessPlatinum: boolean
  isBusinessGold: boolean
  spendRequirement: number
  category: 'cash_back' | 'travel'
  primaryAirline: string | null
  primaryHotel: string | null
  isFlexiblePointsCard: boolean
  isDeltaCard: boolean
  isSouthwestCard: boolean
  isUnitedCard: boolean
  isAACard: boolean
  isStatementCreditCard: boolean
  valuationKey: string
}

const cardMetadataCache = new WeakMap<CreditCard, CardMetadata>()

function maintainCache(): void {
  if (spendRequirementCache.size > 500) {
    spendRequirementCache.clear()
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPEND REQUIREMENT PARSING
// ═══════════════════════════════════════════════════════════════════════════

function parseSpendRequirement(requirement: string | null): number {
  if (!requirement) return 0

  const cached = spendRequirementCache.get(requirement)
  if (cached !== undefined) return cached

  try {
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
  } catch {
    spendRequirementCache.set(requirement, 0)
    return 0
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CARD METADATA EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function getCardMetadata(card: CreditCard): CardMetadata {
  const cached = cardMetadataCache.get(card)
  if (cached) return cached

  const cardNameLower = card.card_name.toLowerCase()
  const issuerLower = card.issuer.toLowerCase()

  const isAmex = issuerLower.includes('amex') || issuerLower.includes('american express')
  const isChase = issuerLower.includes('chase')
  const isCiti = issuerLower.includes('citi')
  const isCapitalOne = issuerLower.includes('capital one')
  const isWellsFargo = issuerLower.includes('wells fargo')
  const isUSBank = issuerLower.includes('us bank')

  const isDeltaCard = cardNameLower.includes('delta')
  const isSouthwestCard = cardNameLower.includes('southwest')
  const isUnitedCard = cardNameLower.includes('united')
  const isAACard = cardNameLower.includes('aadvantage') || cardNameLower.includes('american airlines')

  // Determine valuation key
  let valuationKey = issuerLower
  if (isDeltaCard && isAmex) valuationKey = 'delta_amex'
  else if (isSouthwestCard && isChase) valuationKey = 'southwest_chase'
  else if (isUnitedCard && isChase) valuationKey = 'united_chase'
  else if (isAACard && isCiti) valuationKey = 'citi_aa'

  const metadata: CardMetadata = {
    normalizedName: cardNameLower,
    issuerLower,
    isAmex,
    isChase,
    isCiti,
    isCapitalOne,
    isWellsFargo,
    isUSBank,
    isPersonalPlatinum: cardNameLower.includes('platinum') && !cardNameLower.includes('business'),
    isPersonalGold: cardNameLower.includes('gold') && !cardNameLower.includes('business'),
    isBusinessPlatinum: cardNameLower.includes('platinum') && cardNameLower.includes('business'),
    isBusinessGold: cardNameLower.includes('gold') && cardNameLower.includes('business'),
    spendRequirement: parseSpendRequirement(card.signup_bonus_requirement),
    category: getCardCategory(card),
    primaryAirline: getCardPrimaryAirline(cardNameLower),
    primaryHotel: getCardPrimaryHotel(cardNameLower),
    isFlexiblePointsCard: checkIsFlexiblePointsCard(cardNameLower, issuerLower),
    isDeltaCard,
    isSouthwestCard,
    isUnitedCard,
    isAACard,
    isStatementCreditCard: STATEMENT_CREDIT_CARDS.some(c => cardNameLower.includes(c)),
    valuationKey,
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
    cardNameLower.includes('ink business preferred') ||
    cardNameLower.includes('venture x') ||
    cardNameLower.includes('venture') ||
    (cardNameLower.includes('gold') && issuerLower.includes('amex')) ||
    (cardNameLower.includes('platinum') && issuerLower.includes('amex'))
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// POINTS VALUE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the best valuation multiplier for a card based on user preferences
 */
function getPointsValuation(
  card: CreditCard,
  meta: CardMetadata,
  preferredRewardsType: string,
  preferredAirlines?: string[],
  preferredHotels?: string[],
  userHasChaseTransferCard?: boolean
): { multiplier: number; partner: string } {
  const valuation = POINTS_VALUATION[meta.valuationKey] || POINTS_VALUATION[meta.issuerLower] || { cash: 1 }

  // Statement credit cards always use 1:1 cash value
  if (meta.isStatementCreditCard) {
    return { multiplier: 1, partner: 'Cash' }
  }

  // For cash back preference, use cash value
  if (preferredRewardsType === 'cash_back') {
    return { multiplier: valuation.cash || 1, partner: 'Cash' }
  }

  // For travel preference, find best travel partner
  let bestMultiplier = valuation.cash || 1
  let bestPartner = 'Cash'

  // Check if Chase card can use transfer partners
  const canUseChaseTransfers = meta.isChase && (
    meta.isFlexiblePointsCard ||
    userHasChaseTransferCard ||
    CHASE_TRANSFER_ENABLERS.some(c => meta.normalizedName.includes(c))
  )

  // Check preferred airlines
  if (preferredAirlines?.length) {
    if (preferredAirlines.some(a => a.includes('Delta')) && valuation.delta && valuation.delta > bestMultiplier) {
      bestMultiplier = valuation.delta
      bestPartner = 'Delta'
    }
    if (preferredAirlines.some(a => a.includes('Southwest')) && valuation.southwest && valuation.southwest > bestMultiplier) {
      bestMultiplier = valuation.southwest
      bestPartner = 'Southwest'
    }
    if (preferredAirlines.some(a => a.includes('United')) && valuation.united && valuation.united > bestMultiplier) {
      if (canUseChaseTransfers || meta.isUnitedCard) {
        bestMultiplier = valuation.united
        bestPartner = 'United'
      }
    }
    if (preferredAirlines.some(a => a.includes('American')) && valuation.aa && valuation.aa > bestMultiplier) {
      bestMultiplier = valuation.aa
      bestPartner = 'American Airlines'
    }
  }

  // Check preferred hotels
  if (preferredHotels?.length) {
    if (preferredHotels.some(h => h.includes('Hyatt')) && valuation.hyatt && valuation.hyatt > bestMultiplier) {
      if (canUseChaseTransfers) {
        bestMultiplier = valuation.hyatt
        bestPartner = 'Hyatt'
      }
    }
    if (preferredHotels.some(h => h.includes('Marriott')) && valuation.marriott && valuation.marriott > bestMultiplier) {
      bestMultiplier = valuation.marriott
      bestPartner = 'Marriott'
    }
  }

  // For flexible or if no specific preference matched, use best available
  if (preferredRewardsType === 'flexible' || bestPartner === 'Cash') {
    // Find highest value partner
    if (valuation.hyatt && valuation.hyatt > bestMultiplier && canUseChaseTransfers) {
      bestMultiplier = valuation.hyatt
      bestPartner = 'Hyatt'
    }
    if (valuation.southwest && valuation.southwest > bestMultiplier) {
      bestMultiplier = valuation.southwest
      bestPartner = 'Southwest'
    }
    if (valuation.delta && valuation.delta > bestMultiplier) {
      bestMultiplier = valuation.delta
      bestPartner = 'Delta'
    }
    if (valuation.united && valuation.united > bestMultiplier && (canUseChaseTransfers || meta.isUnitedCard)) {
      bestMultiplier = valuation.united
      bestPartner = 'United'
    }
  }

  return { multiplier: bestMultiplier, partner: bestPartner }
}

/**
 * Calculate the dollar value of points
 */
function calculatePointsValue(points: number, multiplier: number): number {
  // Points are stored as raw count (e.g., 75000)
  // Multiplier is cents per point (e.g., 1 = 1 cent, 2.2 = 2.2 cents)
  return safeRound((points * multiplier) / 100)
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVINGS CALCULATION (NEW - Points-based with ACH)
// ═══════════════════════════════════════════════════════════════════════════

export interface EnhancedSavingsBreakdown extends SavingsBreakdown {
  payOnCard: number              // Amount to charge on card (tuition portion)
  payOnCardWithFee: number       // Amount including processing fee
  tuitionOnACH: number           // Remainder to pay via ACH
  signupBonusPoints: number      // Raw points from signup bonus
  rewardsPoints: number          // Raw points from spending
  totalPoints: number            // Total points earned
  pointsValuation: number        // Multiplier used (cents per point)
  valuationPartner: string       // Partner used for valuation
  savingsPercentage: number      // Net savings as % of tuition portion
  fullTuitionPercentage: number  // Net savings as % of full tuition amount
  isTravel: boolean              // Whether this uses travel valuation
}

/**
 * Calculate savings for a card with ACH recommendation
 * Key rule: Never charge more than the spend requirement on the card
 */
function calculateEnhancedSavings(
  card: CreditCard,
  tuitionAmount: number,
  preferredRewardsType: string,
  preferredAirlines?: string[],
  preferredHotels?: string[],
  userHasChaseTransferCard?: boolean
): EnhancedSavingsBreakdown {
  const meta = getCardMetadata(card)
  const spendReq = meta.spendRequirement

  // Key rule: Only put up to the spend requirement on the card
  const payOnCard = Math.min(spendReq, tuitionAmount)
  const tuitionOnACH = Math.max(0, tuitionAmount - payOnCard)

  // Processing fee only applies to card payment
  const processingFee = safeRound(payOnCard * PROCESSING_FEE_RATE)
  const payOnCardWithFee = safeRound(payOnCard + processingFee)

  // Get points valuation
  const { multiplier, partner } = getPointsValuation(
    card, meta, preferredRewardsType, preferredAirlines, preferredHotels, userHasChaseTransferCard
  )

  // Calculate points earned
  const signupBonusPoints = card.signup_bonus_value ?? 0
  const rewardsRate = (card.rewards_rate ?? 1) / 100
  // Rewards earned on total charge (including fee) as that's what earns points
  const rewardsPoints = Math.round(payOnCardWithFee * rewardsRate * 100) // Convert to points
  const totalPoints = signupBonusPoints + rewardsPoints

  // Calculate dollar values
  const signupBonusValue = calculatePointsValue(signupBonusPoints, multiplier)
  const rewardsEarned = calculatePointsValue(rewardsPoints, multiplier)

  // Annual fee (only if not waived)
  const annualFeeImpact = card.first_year_waived ? 0 : -(card.annual_fee ?? 0)

  // Net value = bonus + rewards - processing fee - annual fee
  const netFirstYearValue = safeRound(signupBonusValue + rewardsEarned + annualFeeImpact - processingFee)

  // Savings percentage based on FULL tuition amount (not just card spend)
  const savingsPercentage = tuitionAmount > 0 ? safeRound((netFirstYearValue / tuitionAmount) * 100) : 0
  
  // Full tuition percentage - same as savings percentage now
  const fullTuitionPercentage = savingsPercentage

  const isTravel = partner !== 'Cash' && meta.category === 'travel'

  return {
    signupBonusValue,
    rewardsEarned,
    annualFeeImpact,
    processingFee,
    netFirstYearValue,
    payOnCard,
    payOnCardWithFee,
    tuitionOnACH,
    signupBonusPoints,
    rewardsPoints,
    totalPoints,
    pointsValuation: multiplier,
    valuationPartner: partner,
    savingsPercentage,
    fullTuitionPercentage,
    isTravel,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTERING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

function shouldExcludeBasedOnAmexHistory(
  meta: CardMetadata,
  amexHistoryCards: string[]
): boolean {
  if (!amexHistoryCards.length) return false
  if (amexHistoryCards.includes('None of the above')) return false
  if (!meta.isAmex) return false

  const historySet = new Set(amexHistoryCards)

  if (historySet.has('AMEX Personal Platinum')) {
    if (meta.isPersonalPlatinum || meta.isPersonalGold) return true
  }
  if (historySet.has('AMEX Personal Gold')) {
    if (meta.isPersonalGold) return true
  }
  if (historySet.has('AMEX Business Platinum')) {
    if (meta.isBusinessPlatinum || meta.isBusinessGold) return true
  }
  if (historySet.has('AMEX Business Gold')) {
    if (meta.isBusinessGold) return true
  }

  return false
}

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
 * Check if user has a Chase card that enables transfer partners
 */
function checkUserHasChaseTransferCard(currentCards: string[]): boolean {
  return currentCards.some(card =>
    CHASE_TRANSFER_ENABLERS.some(enabler => card.toLowerCase().includes(enabler))
  )
}

function filterCards(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CreditCard[] {
  const userMinScore = criteria.creditScoreRange
    ? getCreditScoreMinimum(criteria.creditScoreRange)
    : DEFAULT_CREDIT_SCORE

  const limitedCards = cards.slice(0, MAX_CARDS_TO_PROCESS)

  return limitedCards.filter(card => {
    if (!isValidCreditCard(card)) return false

    const meta = getCardMetadata(card)

    if (card.min_credit_score && card.min_credit_score > userMinScore) {
      return false
    }

    if (card.is_business_card && !criteria.openToBusinessCards) {
      return false
    }

    if (userHasCard(meta, criteria.currentCards)) {
      return false
    }

    if (criteria.recentCardApplications === '5+' && meta.isChase) {
      return false
    }

    if (shouldExcludeBasedOnAmexHistory(meta, criteria.amexHistoryCards)) {
      return false
    }

    // Card must have a spend requirement we can meet with tuition
    if (meta.spendRequirement > criteria.tuitionAmount) {
      return false
    }

    // Cash back filtering: exclude travel-only cards that cannot be redeemed for cash
    if (criteria.preferredRewardsType === 'cash_back') {
      // Exclude specific branded cards that cannot be redeemed for cash back
      if (meta.isDeltaCard || meta.isSouthwestCard || meta.isUnitedCard || meta.isAACard) {
        return false
      }
      
      // Exclude cards that have zero cash valuation (travel-only)
      const valuation = POINTS_VALUATION[meta.valuationKey] || POINTS_VALUATION[meta.issuerLower]
      if (valuation && valuation.cash === 0) {
        return false
      }
    }

    // Travel partner filtering: if user has specific airline/hotel preferences, 
    // exclude branded cards that don't match their preferences
    if (criteria.preferredAirlines?.length && criteria.preferredRewardsType === 'travel_points') {
      const hasPreferredAirlines = criteria.preferredAirlines
      
      // If it's an airline-specific card, check if it matches preferences
      if (meta.isDeltaCard && !hasPreferredAirlines.some(a => a.includes('Delta'))) {
        return false
      }
      if (meta.isSouthwestCard && !hasPreferredAirlines.some(a => a.includes('Southwest'))) {
        return false
      }
      if (meta.isUnitedCard && !hasPreferredAirlines.some(a => a.includes('United'))) {
        return false
      }
      if (meta.isAACard && !hasPreferredAirlines.some(a => a.includes('American'))) {
        return false
      }
    }

    return true
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN RECOMMENDATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function getRewardsDisplayType(card: CreditCard): 'cash_back' | 'travel_points' | 'airline_miles' | 'hotel_points' {
  const rewardsType = card.rewards_type?.toLowerCase() ?? ''
  if (rewardsType.includes('airline') || rewardsType.includes('miles')) return 'airline_miles'
  if (rewardsType.includes('hotel')) return 'hotel_points'
  if (rewardsType.includes('cash')) return 'cash_back'
  if (rewardsType.includes('travel') || rewardsType.includes('points')) return 'travel_points'
  return 'cash_back'
}

export interface EnhancedCardRecommendation extends CardRecommendationResult {
  breakdown: EnhancedSavingsBreakdown
  recommendationType: 'simple' | 'maximum_value' | 'alternative'
  label: string
}

/**
 * Calculate card recommendations with new structure:
 * 1. Simple & Straightforward (single best card)
 * 2. Maximum Value (two-card split if beneficial)
 * 3. Alternative options
 */
export function calculateRecommendations(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CardRecommendationResult[] {
  try {
    maintainCache()

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

    const eligibleCards = filterCards(cards, criteria)
    if (eligibleCards.length === 0) {
      console.info('[card-engine] No eligible cards found')
      return []
    }

    const userHasChaseTransferCard = checkUserHasChaseTransferCard(criteria.currentCards)

    // Calculate enhanced savings for each card
    const cardResults = eligibleCards.map(card => {
      const breakdown = calculateEnhancedSavings(
        card,
        criteria.tuitionAmount,
        criteria.preferredRewardsType,
        criteria.preferredAirlines,
        criteria.preferredHotels,
        userHasChaseTransferCard
      )

      return {
        card,
        estimatedSavings: breakdown.netFirstYearValue,
        breakdown,
        rank: 0,
      }
    })

    // Sort by net savings
    cardResults.sort((a, b) => b.estimatedSavings - a.estimatedSavings)

    // Get top single card (Simple & Straightforward)
    const topCard = cardResults[0]

    // Get remaining cards for alternatives
    const remainingCards = cardResults.slice(1, 5)

    // For flexible preference, ensure we have both cash back and travel options
    if (criteria.preferredRewardsType === 'flexible') {
      const topIsCashBack = getCardMetadata(topCard.card).category === 'cash_back'
      const alternateCategory = topIsCashBack ? 'travel' : 'cash_back'

      const hasAlternate = remainingCards.some(r => getCardMetadata(r.card).category === alternateCategory)

      if (!hasAlternate) {
        const alternateCard = cardResults.find(r =>
          r.card.id !== topCard.card.id &&
          getCardMetadata(r.card).category === alternateCategory
        )
        if (alternateCard && !remainingCards.includes(alternateCard)) {
          remainingCards.push(alternateCard)
        }
      }
    } else if (criteria.preferredRewardsType === 'travel_points') {
      // For travel preference, filter out pure cash back cards
      const filteredResults = cardResults.filter(r => getCardMetadata(r.card).category === 'travel')
      return [
        filteredResults[0] ? { ...filteredResults[0], rank: 1 } : topCard,
        ...filteredResults.slice(1, 5).map((r, i) => ({ ...r, rank: i + 2 }))
      ].filter(Boolean)
    }

    // Build results array
    const results: CardRecommendationResult[] = [
      { ...topCard, rank: 1 },
      ...remainingCards.map((r, i) => ({ ...r, rank: i + 2 }))
    ]

    return results

  } catch (error) {
    console.error('[card-engine] Failed to calculate recommendations:', error)
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid criteria: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPLIT STRATEGY (Maximum Value - Two Card Option)
// ═══════════════════════════════════════════════════════════════════════════

export interface SplitStrategy {
  cards: {
    card: CreditCard
    allocatedAmount: number
    allocatedWithFee: number
    breakdown: EnhancedSavingsBreakdown
  }[]
  totalSavings: number
  totalTuition: number
  totalOnCards: number
  totalOnACH: number
  savingsPercentage: number
}

/**
 * Calculate split payment strategy
 * Key rules:
 * - Each card only charges up to its spend requirement
 * - Remainder goes to ACH
 * - Cards must be from different issuers
 */
export function calculateSplitStrategies(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): SplitStrategy | null {
  try {
    const tuitionAmount = criteria.tuitionAmount

    if (tuitionAmount < MIN_TUITION_FOR_SPLIT) return null

    const eligibleCards = filterCards(cards, criteria)
      .filter(card => (card.signup_bonus_value ?? 0) > 0)
      .sort((a, b) => (b.signup_bonus_value ?? 0) - (a.signup_bonus_value ?? 0))
      .slice(0, MAX_SPLIT_CANDIDATES)

    if (eligibleCards.length < 2) return null

    const userHasChaseTransferCard = checkUserHasChaseTransferCard(criteria.currentCards)
    const strategies: SplitStrategy[] = []

    for (let i = 0; i < eligibleCards.length; i++) {
      for (let j = i + 1; j < eligibleCards.length; j++) {
        const card1 = eligibleCards[i]
        const card2 = eligibleCards[j]

        const meta1 = getCardMetadata(card1)
        const meta2 = getCardMetadata(card2)

        // One card per bank rule
        if (meta1.issuerLower === meta2.issuerLower) continue

        const req1 = meta1.spendRequirement
        const req2 = meta2.spendRequirement

        // Both cards must have spend requirements
        if (req1 === 0 || req2 === 0) continue

        // Calculate allocations (each card gets up to its spend requirement)
        const allocation1 = Math.min(req1, tuitionAmount)
        const allocation2 = Math.min(req2, tuitionAmount - allocation1)

        // Skip if second card can't meet its requirement
        if (allocation2 < req2) continue

        const totalOnCards = allocation1 + allocation2
        const totalOnACH = tuitionAmount - totalOnCards

        // Calculate breakdowns
        const breakdown1 = calculateEnhancedSavings(
          card1, allocation1, criteria.preferredRewardsType,
          criteria.preferredAirlines, criteria.preferredHotels, userHasChaseTransferCard
        )
        const breakdown2 = calculateEnhancedSavings(
          card2, allocation2, criteria.preferredRewardsType,
          criteria.preferredAirlines, criteria.preferredHotels, userHasChaseTransferCard
        )

        const totalSavings = breakdown1.netFirstYearValue + breakdown2.netFirstYearValue

        strategies.push({
          cards: [
            {
              card: card1,
              allocatedAmount: allocation1,
              allocatedWithFee: breakdown1.payOnCardWithFee,
              breakdown: breakdown1,
            },
            {
              card: card2,
              allocatedAmount: allocation2,
              allocatedWithFee: breakdown2.payOnCardWithFee,
              breakdown: breakdown2,
            },
          ],
          totalSavings: safeRound(totalSavings),
          totalTuition: tuitionAmount,
          totalOnCards,
          totalOnACH,
          savingsPercentage: totalOnCards > 0 ? safeRound((totalSavings / totalOnCards) * 100) : 0,
        })
      }
    }

    if (strategies.length === 0) return null

    strategies.sort((a, b) => b.totalSavings - a.totalSavings)
    return strategies[0]

  } catch (error) {
    console.error('[card-engine] Failed to calculate split strategies:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTNER VALUATIONS (for display)
// ═══════════════════════════════════════════════════════════════════════════

export function getPartnerValuations(card: CreditCard): PartnerValuation[] {
  if (!isValidCreditCard(card)) return []

  const meta = getCardMetadata(card)
  const valuation = POINTS_VALUATION[meta.valuationKey] || POINTS_VALUATION[meta.issuerLower]

  if (!valuation) return []

  const bonusPoints = card.signup_bonus_value ?? 0
  const valuations: PartnerValuation[] = []

  if (valuation.cash && valuation.cash > 0) {
    valuations.push({
      partner: 'Cash Back',
      value: calculatePointsValue(bonusPoints, valuation.cash),
      centsPerPoint: valuation.cash,
      totalPoints: bonusPoints,
    })
  }
  if (valuation.delta) {
    valuations.push({
      partner: 'Delta',
      value: calculatePointsValue(bonusPoints, valuation.delta),
      centsPerPoint: valuation.delta,
      totalPoints: bonusPoints,
    })
  }
  if (valuation.southwest) {
    valuations.push({
      partner: 'Southwest',
      value: calculatePointsValue(bonusPoints, valuation.southwest),
      centsPerPoint: valuation.southwest,
      totalPoints: bonusPoints,
    })
  }
  if (valuation.hyatt) {
    valuations.push({
      partner: 'Hyatt',
      value: calculatePointsValue(bonusPoints, valuation.hyatt),
      centsPerPoint: valuation.hyatt,
      totalPoints: bonusPoints,
    })
  }
  if (valuation.united) {
    valuations.push({
      partner: 'United',
      value: calculatePointsValue(bonusPoints, valuation.united),
      centsPerPoint: valuation.united,
      totalPoints: bonusPoints,
    })
  }
  if (valuation.marriott) {
    valuations.push({
      partner: 'Marriott',
      value: calculatePointsValue(bonusPoints, valuation.marriott),
      centsPerPoint: valuation.marriott,
      totalPoints: bonusPoints,
    })
  }
  if (valuation.aa) {
    valuations.push({
      partner: 'American Airlines',
      value: calculatePointsValue(bonusPoints, valuation.aa),
      centsPerPoint: valuation.aa,
      totalPoints: bonusPoints,
    })
  }

  return valuations.sort((a, b) => b.value - a.value)
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
  const { breakdown, card } = result
  const enhanced = breakdown as EnhancedSavingsBreakdown
  const lines: string[] = []

  if (enhanced.payOnCard !== undefined) {
    lines.push(`Pay on card: ${formatCurrency(enhanced.payOnCardWithFee)}`)
    lines.push(`  (${formatCurrency(enhanced.payOnCard)} tuition + ${formatCurrency(enhanced.processingFee)} fee)`)

    if (enhanced.tuitionOnACH > 0) {
      lines.push(`Pay via ACH: ${formatCurrency(enhanced.tuitionOnACH)}`)
    }
  }

  if (enhanced.signupBonusValue > 0) {
    const label = enhanced.isTravel ? 'Signup bonus (travel value)' : 'Signup bonus'
    lines.push(`${label}: +${formatCurrency(enhanced.signupBonusValue)}`)
  }

  lines.push(`Rewards earned: +${formatCurrency(enhanced.rewardsEarned)} (${card.rewards_rate ?? 1}%)`)

  if (enhanced.annualFeeImpact < 0) {
    lines.push(`Annual fee: -${formatCurrency(Math.abs(enhanced.annualFeeImpact))}`)
  } else if (card.annual_fee && card.annual_fee > 0 && card.first_year_waived) {
    lines.push(`Annual fee: ${formatCurrency(card.annual_fee)} (waived Y1)`)
  }

  lines.push(`Processing fee (3%): -${formatCurrency(enhanced.processingFee)}`)

  const netLabel = enhanced.isTravel ? 'Net Travel Value' : 'Net Cash Back'
  lines.push(`${netLabel}: ${formatCurrency(enhanced.netFirstYearValue)}`)

  if (enhanced.savingsPercentage !== undefined) {
    const pctLabel = enhanced.isTravel ? '% Travel Value' : '% Savings'
    lines.push(`${pctLabel}: ${enhanced.savingsPercentage}%`)
  }

  return lines.join('\n')
}
