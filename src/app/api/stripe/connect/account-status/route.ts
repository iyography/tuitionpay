import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    if (!schoolId) {
      return NextResponse.json(
        { error: 'schoolId query parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    // Look up the school's stripe_account_id
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, stripe_account_id')
      .eq('id', schoolId)
      .single()

    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    if (!school.stripe_account_id) {
      return NextResponse.json(
        { error: 'School does not have a Stripe account' },
        { status: 404 }
      )
    }

    // Retrieve the account from Stripe
    const account = await stripe.accounts.retrieve(school.stripe_account_id)

    return NextResponse.json({
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
    })
  } catch (error) {
    console.error('Error fetching Stripe account status:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to fetch account status' },
      { status: 500 }
    )
  }
}
