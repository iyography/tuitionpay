import type { CreditCard } from '@/types/database'
import type { CardRecommendationResult, CardMatchingCriteria, SavingsBreakdown } from '@/types/cards'
import { getCreditScoreMinimum } from '@/types/cards'

// Parse spend requirement from card (e.g., "Spend $4,000 in 3 months" -> 4000)
function parseSpendRequirement(requirement: string | null): number {
  if (!requirement) return 0
  const match = requirement.match(/\$?([\d,]+)/)
  if (!match) return 0
  return parseInt(match[1].replace(/,/g, ''), 10)
}

// Calculate the savings breakdown for a specific card
function calculateSavingsBreakdown(
  card: CreditCard,
  tuitionAmount: number
): SavingsBreakdown {
  // Signup bonus value (if meeting spend requirement is feasible)
  const signupBonusValue = card.signup_bonus_value || 0

  // Calculate rewards earned on tuition payment
  // Use the base rewards rate (typically 1-2%)
  const rewardsRate = (card.rewards_rate || 1) / 100
  const rewardsEarned = tuitionAmount * rewardsRate

  // Annual fee impact (negative if fee applies, 0 if waived)
  const annualFeeImpact = card.first_year_waived ? 0 : -(card.annual_fee || 0)

  // Net first year value
  const netFirstYearValue = signupBonusValue + rewardsEarned + annualFeeImpact

  return {
    signupBonusValue,
    rewardsEarned: Math.round(rewardsEarned * 100) / 100,
    annualFeeImpact,
    netFirstYearValue: Math.round(netFirstYearValue * 100) / 100,
  }
}

// Check if this card should be excluded based on AMEX history
function shouldExcludeBasedOnAmexHistory(
  card: CreditCard,
  amexHistoryCards: string[]
): boolean {
  if (!amexHistoryCards || amexHistoryCards.length === 0) return false
  if (amexHistoryCards.includes('None of the above')) return false

  const cardNameLower = card.card_name.toLowerCase()
  const issuerLower = card.issuer.toLowerCase()

  // Only apply AMEX rules to AMEX cards
  if (!issuerLower.includes('amex') && !issuerLower.includes('american express')) {
    return false
  }

  // Check AMEX Personal Platinum history
  if (amexHistoryCards.includes('AMEX Personal Platinum')) {
    // Remove both Personal Gold and Personal Platinum
    if (
      (cardNameLower.includes('platinum') && !cardNameLower.includes('business')) ||
      (cardNameLower.includes('gold') && !cardNameLower.includes('business'))
    ) {
      return true
    }
  }

  // Check AMEX Personal Gold history
  if (amexHistoryCards.includes('AMEX Personal Gold')) {
    // Remove only Personal Gold
    if (cardNameLower.includes('gold') && !cardNameLower.includes('business')) {
      return true
    }
  }

  // Check AMEX Business Platinum history
  if (amexHistoryCards.includes('AMEX Business Platinum')) {
    // Remove both Business Gold and Business Platinum
    if (
      (cardNameLower.includes('platinum') && cardNameLower.includes('business')) ||
      (cardNameLower.includes('gold') && cardNameLower.includes('business'))
    ) {
      return true
    }
  }

  // Check AMEX Business Gold history
  if (amexHistoryCards.includes('AMEX Business Gold')) {
    // Remove only Business Gold
    if (cardNameLower.includes('gold') && cardNameLower.includes('business')) {
      return true
    }
  }

  return false
}

// Check if card matches user's current cards (case-insensitive partial match)
function userHasCard(card: CreditCard, currentCards: string[]): boolean {
  if (!currentCards || currentCards.length === 0) return false

  const cardNameLower = card.card_name.toLowerCase()

  for (const userCard of currentCards) {
    const userCardLower = userCard.toLowerCase()
    // Check for close match (card name contains user's card or vice versa)
    if (
      cardNameLower.includes(userCardLower) ||
      userCardLower.includes(cardNameLower) ||
      // Also check without common prefixes
      cardNameLower.replace('chase ', '').includes(userCardLower.replace('chase ', '')) ||
      cardNameLower.replace('amex ', '').includes(userCardLower.replace('amex ', ''))
    ) {
      return true
    }
  }
  return false
}

// Filter cards based on criteria
function filterCards(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CreditCard[] {
  const userMinScore = criteria.creditScoreRange
    ? getCreditScoreMinimum(criteria.creditScoreRange)
    : 700 // Default to "good" credit

  return cards.filter(card => {
    // Filter by credit score if provided
    if (criteria.creditScoreRange && card.min_credit_score && card.min_credit_score > userMinScore) {
      return false
    }

    // Filter by business card preference
    if (card.is_business_card && !criteria.openToBusinessCards) {
      return false
    }

    // Exclude cards user already has
    if (userHasCard(card, criteria.currentCards)) {
      return false
    }

    // Chase 5/24 rule: Remove ALL Chase cards if 5+ personal applications in last 24 months
    if (criteria.recentCardApplications === '5+') {
      if (card.issuer.toLowerCase().includes('chase')) {
        return false
      }
    }

    // AMEX exclusion based on history
    if (shouldExcludeBasedOnAmexHistory(card, criteria.amexHistoryCards)) {
      return false
    }

    // IMPORTANT: Don't recommend cards with spend requirements higher than tuition
    const spendRequirement = parseSpendRequirement(card.signup_bonus_requirement)
    if (spendRequirement > criteria.tuitionAmount) {
      return false
    }

    return true
  })
}

// Score cards based on rewards type preference
function scoreByPreference(
  card: CreditCard,
  preferredRewardsType: string
): number {
  const rewardsType = card.rewards_type?.toLowerCase() || ''

  switch (preferredRewardsType) {
    case 'cash_back':
      if (rewardsType.includes('cash')) return 1.2
      break
    case 'travel_points':
      if (rewardsType.includes('travel') || rewardsType.includes('points') || rewardsType.includes('miles')) return 1.2
      break
    case 'flexible':
      return 1.0 // No preference bonus
  }

  return 1.0
}

// Determine if a card is cash back or travel
function getCardCategory(card: CreditCard): 'cash_back' | 'travel' {
  const rewardsType = card.rewards_type?.toLowerCase() || ''
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

// Main recommendation function
export function calculateRecommendations(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CardRecommendationResult[] {
  // Step 1: Filter cards based on basic criteria
  const eligibleCards = filterCards(cards, criteria)

  // Step 2: Calculate savings for each card
  const cardResults: CardRecommendationResult[] = eligibleCards.map(card => {
    const breakdown = calculateSavingsBreakdown(card, criteria.tuitionAmount)
    const preferenceMultiplier = scoreByPreference(card, criteria.preferredRewardsType)

    // Since we've already filtered out cards with spend > tuition, all eligible cards can meet bonus
    const adjustedSavings = breakdown.netFirstYearValue * preferenceMultiplier

    return {
      card,
      estimatedSavings: Math.round(adjustedSavings * 100) / 100,
      breakdown,
      rank: 0, // Will be set after sorting
    }
  })

  // Step 3: Sort by estimated savings (descending)
  cardResults.sort((a, b) => b.estimatedSavings - a.estimatedSavings)

  // Step 4: Get top recommendations with alternatives
  const userCategory = criteria.preferredRewardsType === 'cash_back' ? 'cash_back' : 'travel'
  const alternateCategory = userCategory === 'cash_back' ? 'travel' : 'cash_back'

  // Get best cards overall
  const topCards = cardResults.slice(0, 3)

  // Find best card from the alternate category (if not already in top 3)
  const alternateCard = cardResults.find(r => {
    const cardCategory = getCardCategory(r.card)
    const notInTop3 = !topCards.some(t => t.card.id === r.card.id)
    return cardCategory === alternateCategory && notInTop3
  })

  // Combine results
  const results = [...topCards]
  if (alternateCard && criteria.preferredRewardsType !== 'flexible') {
    results.push(alternateCard)
  }

  // Assign ranks
  return results.map((result, index) => ({
    ...result,
    rank: index + 1,
  }))
}

// Calculate split payment strategies
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

// Check if a card is a Chase Ink business card
function isChaseInkCard(card: CreditCard): boolean {
  const cardNameLower = card.card_name.toLowerCase()
  return cardNameLower.includes('ink') && card.issuer.toLowerCase().includes('chase')
}

export function calculateSplitStrategies(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): SplitStrategy | null {
  const tuitionAmount = criteria.tuitionAmount

  // Only suggest split if tuition is $6,000+ (makes sense to split)
  if (tuitionAmount < 6000) return null

  // Get eligible cards sorted by signup bonus value
  const eligibleCards = filterCards(cards, criteria)
    .filter(card => card.signup_bonus_value && card.signup_bonus_value > 0)
    .sort((a, b) => (b.signup_bonus_value || 0) - (a.signup_bonus_value || 0))

  if (eligibleCards.length < 2) return null

  // Find best 2-card combination
  const strategies: SplitStrategy[] = []

  for (let i = 0; i < Math.min(eligibleCards.length, 5); i++) {
    for (let j = i + 1; j < Math.min(eligibleCards.length, 6); j++) {
      const card1 = eligibleCards[i]
      const card2 = eligibleCards[j]

      // CHASE INK RULE: Can only have one Chase Ink card in multi-card strategy
      if (isChaseInkCard(card1) && isChaseInkCard(card2)) {
        continue // Skip this combination
      }

      // Get spend requirements for each card
      const req1 = parseSpendRequirement(card1.signup_bonus_requirement)
      const req2 = parseSpendRequirement(card2.signup_bonus_requirement)

      // Both cards must have spend requirements <= tuition to be valid
      // (already filtered, but double-check combined)
      if (req1 + req2 > tuitionAmount * 1.5) continue // Allow some flexibility for split

      // Allocate tuition between cards (try to meet both bonuses)
      let allocation1 = Math.min(req1, tuitionAmount)
      let allocation2 = tuitionAmount - allocation1

      // Adjust if card2 needs more to meet its requirement
      if (allocation2 < req2 && allocation1 > req1) {
        const excess = allocation1 - req1
        const needed = req2 - allocation2
        const transfer = Math.min(excess, needed)
        allocation1 -= transfer
        allocation2 += transfer
      }

      // Check if allocations meet requirements
      const canMeet1 = allocation1 >= req1
      const canMeet2 = allocation2 >= req2

      // Calculate savings for this split
      const breakdown1 = calculateSavingsBreakdown(card1, allocation1)
      const breakdown2 = calculateSavingsBreakdown(card2, allocation2)

      const totalSavings =
        (canMeet1 ? breakdown1.signupBonusValue : 0) +
        (canMeet2 ? breakdown2.signupBonusValue : 0) +
        breakdown1.rewardsEarned +
        breakdown2.rewardsEarned +
        breakdown1.annualFeeImpact +
        breakdown2.annualFeeImpact

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
        totalSavings: Math.round(totalSavings * 100) / 100,
        totalTuition: tuitionAmount,
        savingsPercentage: Math.round((totalSavings / tuitionAmount) * 100),
      })
    }
  }

  // Return best split strategy
  if (strategies.length === 0) return null

  strategies.sort((a, b) => b.totalSavings - a.totalSavings)
  return strategies[0]
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format percentage for display
export function formatPercentage(rate: number): string {
  return `${rate}%`
}

// Generate explanation text for savings calculation
export function generateSavingsExplanation(
  result: CardRecommendationResult,
  tuitionAmount: number
): string {
  const { breakdown, card } = result
  const lines: string[] = []

  if (breakdown.signupBonusValue > 0) {
    lines.push(
      `Signup bonus: ${formatCurrency(breakdown.signupBonusValue)} ` +
      `(${card.signup_bonus_requirement || 'Meet spend requirement'})`
    )
  }

  lines.push(
    `Rewards on ${formatCurrency(tuitionAmount)} tuition: ` +
    `${formatCurrency(breakdown.rewardsEarned)} ` +
    `(${card.rewards_rate || 1}% back)`
  )

  if (breakdown.annualFeeImpact < 0) {
    lines.push(`Annual fee: -${formatCurrency(Math.abs(breakdown.annualFeeImpact))}`)
  } else if (card.annual_fee && card.annual_fee > 0 && card.first_year_waived) {
    lines.push(`Annual fee: ${formatCurrency(card.annual_fee)} (waived first year)`)
  }

  lines.push(`Net first-year value: ${formatCurrency(breakdown.netFirstYearValue)}`)

  return lines.join('\n')
}
