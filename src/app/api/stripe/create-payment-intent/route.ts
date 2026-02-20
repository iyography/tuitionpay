import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

const CreatePaymentIntentSchema = z.object({
  amount: z.number().min(0.5, 'Amount must be at least $0.50'),
  schoolId: z.string().min(1, 'School ID is required'),
  studentName: z.string().min(1, 'Student name is required').max(100),
  studentIdentifier: z.string().max(50).optional(),
  parentEmail: z.string().email('Invalid email format'),
})

const PROCESSING_FEE_RATE = 0.03

function calculateAmounts(tuitionAmount: number) {
  const tuitionInCents = Math.round(tuitionAmount * 100)
  const processingFeeInCents = Math.round(tuitionInCents * PROCESSING_FEE_RATE)
  return {
    tuitionInCents,
    processingFeeInCents,
    totalInCents: tuitionInCents + processingFeeInCents,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    const parseResult = CreatePaymentIntentSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Verify school exists and is active
    const supabase = await createClient()
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, status')
      .eq('id', input.schoolId)
      .single()

    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    if (school.status !== 'active') {
      return NextResponse.json(
        { error: 'School is not currently accepting payments' },
        { status: 403 }
      )
    }

    const amounts = calculateAmounts(input.amount)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amounts.totalInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        schoolId: input.schoolId,
        studentName: input.studentName,
        studentIdentifier: input.studentIdentifier || '',
        parentEmail: input.parentEmail,
        tuitionAmount: input.amount.toString(),
        processingFee: (amounts.processingFeeInCents / 100).toString(),
      },
      description: `Tuition payment for ${input.studentName}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalAmount: amounts.totalInCents / 100,
      processingFee: amounts.processingFeeInCents / 100,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
