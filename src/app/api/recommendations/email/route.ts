import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateRecommendations, calculateSplitStrategies } from '@/lib/matching/card-engine'
import type { CardMatchingCriteria } from '@/types/cards'
import { sendRecommendationEmail } from '@/lib/email/send-recommendations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      schoolName,
      studentName,
      parentEmail,
      tuitionAmount,
      creditScoreRange,
      currentCards,
      monthlySpendCapacity,
      preferredRewardsType,
      openToBusinessCards,
      recentCardApplications,
      amexHistoryCards,
      preferredAirlines,
      preferredHotels,
    } = body

    if (!parentEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: cards, error: cardsError } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('is_active', true)

    if (cardsError || !cards || cards.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    const criteria: CardMatchingCriteria = {
      creditScoreRange,
      currentCards: currentCards || [],
      monthlySpendCapacity,
      preferredRewardsType,
      openToBusinessCards,
      tuitionAmount,
      recentCardApplications: recentCardApplications || '0',
      amexHistoryCards: amexHistoryCards || [],
      preferredAirlines: preferredAirlines || [],
      preferredHotels: preferredHotels || [],
    }

    const recommendations = calculateRecommendations(cards, criteria)
    const splitStrategy = calculateSplitStrategies(cards, criteria)

    const emailRecommendations = recommendations.map(rec => ({
      cardName: rec.card.card_name,
      issuer: rec.card.issuer,
      signupBonusValue: rec.breakdown.signupBonusValue,
      signupBonusRequirement: rec.card.signup_bonus_requirement || '',
      signupBonusTimeframe: rec.card.signup_bonus_timeframe || '3 months',
      annualFee: rec.card.annual_fee,
      firstYearWaived: rec.card.first_year_waived,
      rewardsRate: rec.card.rewards_rate,
      estimatedSavings: rec.estimatedSavings,
      benefits: rec.card.benefits,
      isBusinessCard: rec.card.is_business_card,
      rewardsType: rec.card.rewards_type,
      processingFee: rec.breakdown.processingFee,
    }))

    const emailSplitStrategy = splitStrategy && splitStrategy.totalSavings > (recommendations[0]?.estimatedSavings || 0)
      ? {
          cards: splitStrategy.cards.map(c => ({
            cardName: c.card.card_name,
            allocatedAmount: c.allocatedAmount,
            savings: c.breakdown.netFirstYearValue,
          })),
          totalSavings: splitStrategy.totalSavings,
        }
      : undefined

    await sendRecommendationEmail({
      to: parentEmail,
      studentName,
      schoolName: schoolName || 'your school',
      tuitionAmount,
      recommendations: emailRecommendations,
      splitStrategy: emailSplitStrategy,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
