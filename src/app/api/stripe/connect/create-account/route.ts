import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

const CreateAccountSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  schoolName: z.string().min(1, 'School name is required'),
  contactEmail: z.string().email('Invalid email format'),
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

    const parseResult = CreateAccountSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { schoolId, schoolName, contactEmail } = parseResult.data

    const supabase = await createServiceClient()

    // Verify school exists
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

    // If school already has a Stripe account, create a new account link for re-onboarding
    if (school.stripe_account_id) {
      const accountLink = await stripe.accountLinks.create({
        account: school.stripe_account_id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tuitionpay.ai'}/admin/stripe-setup`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tuitionpay.ai'}/admin/stripe-setup`,
        type: 'account_onboarding',
      })

      return NextResponse.json({
        url: accountLink.url,
        accountId: school.stripe_account_id,
      })
    }

    // Create a new Stripe Express connected account
    const account = await stripe.accounts.create({
      type: 'express',
      email: contactEmail,
      business_profile: {
        name: schoolName,
        mcc: '8211', // Elementary and secondary schools
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        schoolId,
      },
    })

    // Store the Stripe account ID in the schools table
    const { error: updateError } = await supabase
      .from('schools')
      .update({ stripe_account_id: account.id })
      .eq('id', schoolId)

    if (updateError) {
      console.error('Failed to store Stripe account ID:', updateError)
      // Clean up the Stripe account since we couldn't save the reference
      await stripe.accounts.del(account.id).catch((err) =>
        console.error('Failed to clean up Stripe account:', err)
      )
      return NextResponse.json(
        { error: 'Failed to save Stripe account information' },
        { status: 500 }
      )
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tuitionpay.ai'}/admin/stripe-setup`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tuitionpay.ai'}/admin/stripe-setup`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    })
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect account' },
      { status: 500 }
    )
  }
}
