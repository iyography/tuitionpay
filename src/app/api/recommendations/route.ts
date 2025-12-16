import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateRecommendations } from '@/lib/matching/card-engine'
import type { CardMatchingCriteria } from '@/types/cards'
import { assessmentSchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = assessmentSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid assessment data', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const {
      sessionId,
      schoolId,
      studentName,
      studentIdentifier,
      tuitionAmount,
      creditScoreRange,
      currentCards,
      monthlySpendCapacity,
      preferredRewardsType,
      openToBusinessCards,
    } = body

    const supabase = await createClient()

    // Fetch active credit cards from database
    const { data: cards, error: cardsError } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('is_active', true)

    if (cardsError) {
      console.error('Error fetching cards:', cardsError)
      return NextResponse.json(
        { error: 'Failed to fetch credit cards' },
        { status: 500 }
      )
    }

    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'No credit cards available' },
        { status: 404 }
      )
    }

    // Build matching criteria
    const criteria: CardMatchingCriteria = {
      creditScoreRange,
      currentCards: currentCards || [],
      monthlySpendCapacity,
      preferredRewardsType,
      openToBusinessCards,
      tuitionAmount,
    }

    // Calculate recommendations
    const recommendations = calculateRecommendations(cards, criteria)

    // Store assessment response in database
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessment_responses')
      .insert({
        session_id: sessionId || `session_${Date.now()}`,
        school_id: schoolId,
        student_name: studentName,
        student_identifier: studentIdentifier,
        tuition_amount: tuitionAmount,
        credit_score_range: creditScoreRange,
        current_cards: currentCards,
        monthly_spend_capacity: monthlySpendCapacity,
        preferred_rewards_type: preferredRewardsType,
        open_to_business_cards: openToBusinessCards,
      })
      .select()
      .single()

    if (assessmentError) {
      console.error('Error storing assessment:', assessmentError)
      // Don't fail the request, just log the error
    }

    // Store recommendations if assessment was saved
    if (assessment) {
      const recommendationsToStore = recommendations.map(rec => ({
        assessment_id: assessment.id,
        card_id: rec.card.id,
        card_name: rec.card.card_name,
        estimated_savings: rec.estimatedSavings,
        rank: rec.rank,
        was_selected: false,
      }))

      const { error: recError } = await supabase
        .from('card_recommendations')
        .insert(recommendationsToStore)

      if (recError) {
        console.error('Error storing recommendations:', recError)
      }
    }

    return NextResponse.json({
      recommendations,
      assessmentId: assessment?.id,
    })
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
