import type { CreditCard } from '@/types/database'
import type { CardRecommendationResult, CardMatchingCriteria, SavingsBreakdown } from '@/types/cards'
import { getCreditScoreMinimum } from '@/types/cards'

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

// Check if user can likely meet the signup bonus requirement
function canMeetSpendRequirement(
  card: CreditCard,
  monthlySpendCapacity: number,
  tuitionAmount: number
): boolean {
  if (!card.signup_bonus_requirement) return true

  // Parse the spend requirement (e.g., "Spend $4,000 in 3 months")
  const requirementMatch = card.signup_bonus_requirement.match(/\$?([\d,]+)/);
  if (!requirementMatch) return true

  const requiredSpend = parseInt(requirementMatch[1].replace(/,/g, ''), 10)

  // Assume 3 month timeframe if not specified
  const timeframeMatch = card.signup_bonus_timeframe?.match(/(\d+)\s*month/i)
  const months = timeframeMatch ? parseInt(timeframeMatch[1], 10) : 3

  // Total available spend = tuition + (monthly capacity * months)
  const totalAvailableSpend = tuitionAmount + (monthlySpendCapacity * months)

  return totalAvailableSpend >= requiredSpend
}

// Filter cards based on criteria
function filterCards(
  cards: CreditCard[],
  criteria: CardMatchingCriteria
): CreditCard[] {
  const userMinScore = getCreditScoreMinimum(criteria.creditScoreRange)

  return cards.filter(card => {
    // Filter by credit score
    if (card.min_credit_score && card.min_credit_score > userMinScore) {
      return false
    }

    // Filter by business card preference
    if (card.is_business_card && !criteria.openToBusinessCards) {
      return false
    }

    // Exclude cards user already has (case-insensitive match on issuer)
    const userCardsLower = criteria.currentCards.map(c => c.toLowerCase())
    if (userCardsLower.some(issuer =>
      card.issuer.toLowerCase().includes(issuer) ||
      issuer.includes(card.issuer.toLowerCase())
    )) {
      // Only exclude if it's likely the same specific card
      // For now, we don't exclude just because they have a card from the same issuer
    }

    // Check if spend requirement is achievable
    if (!canMeetSpendRequirement(card, criteria.monthlySpendCapacity, criteria.tuitionAmount)) {
      // Don't completely exclude, but it will rank lower
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
    case 'statement_credits':
      if (rewardsType.includes('credit') || rewardsType.includes('statement')) return 1.2
      break
    case 'flexible':
      return 1.0 // No preference bonus
  }

  return 1.0
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

    // Adjust for spend requirement achievability
    const canMeetBonus = canMeetSpendRequirement(
      card,
      criteria.monthlySpendCapacity,
      criteria.tuitionAmount
    )

    // If can't meet bonus, reduce the signup bonus value in calculation
    const adjustedSavings = canMeetBonus
      ? breakdown.netFirstYearValue * preferenceMultiplier
      : (breakdown.rewardsEarned + breakdown.annualFeeImpact) * preferenceMultiplier

    return {
      card,
      estimatedSavings: Math.round(adjustedSavings * 100) / 100,
      breakdown: canMeetBonus ? breakdown : {
        ...breakdown,
        signupBonusValue: 0, // Don't show bonus they can't achieve
        netFirstYearValue: Math.round((breakdown.rewardsEarned + breakdown.annualFeeImpact) * 100) / 100,
      },
      rank: 0, // Will be set after sorting
    }
  })

  // Step 3: Sort by estimated savings (descending)
  cardResults.sort((a, b) => b.estimatedSavings - a.estimatedSavings)

  // Step 4: Assign ranks and return top 3
  return cardResults.slice(0, 3).map((result, index) => ({
    ...result,
    rank: index + 1,
  }))
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
