import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

const CreateLoginLinkSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    const parseResult = CreateLoginLinkSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { schoolId } = parseResult.data

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

    // Create a login link for the Express dashboard
    const loginLink = await stripe.accounts.createLoginLink(school.stripe_account_id)

    return NextResponse.json({
      url: loginLink.url,
    })
  } catch (error) {
    console.error('Error creating Stripe login link:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to create Stripe dashboard login link' },
      { status: 500 }
    )
  }
}
