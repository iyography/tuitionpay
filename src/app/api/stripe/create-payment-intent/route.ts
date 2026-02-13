import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, schoolId, studentName, studentIdentifier, parentEmail } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least $0.50' },
        { status: 400 }
      )
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    // Calculate processing fee (3%)
    const processingFeeInCents = Math.round(amountInCents * 0.03)
    const totalAmountInCents = amountInCents + processingFeeInCents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        schoolId,
        studentName,
        studentIdentifier: studentIdentifier || '',
        parentEmail,
        tuitionAmount: amount.toString(),
        processingFee: (processingFeeInCents / 100).toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount: totalAmountInCents / 100,
      processingFee: processingFeeInCents / 100,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}