import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type Stripe from 'stripe'

const paymentMetadataSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  studentName: z.string().min(1, 'Student name is required'),
  studentIdentifier: z.string().optional(),
  parentEmail: z.string().email('Invalid parent email format'),
  tuitionAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid tuition amount'),
  processingFee: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid processing fee'),
})

type PaymentMetadata = z.infer<typeof paymentMetadataSchema>
type SupabaseServiceClient = Awaited<ReturnType<typeof createServiceClient>>

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Service client bypasses RLS — webhooks have no user session
  const supabase = await createServiceClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'payment_intent.payment_failed': {
        const failed = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', {
          id: failed.id,
          error: failed.last_payment_error?.message,
        })
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : error,
    })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: SupabaseServiceClient
) {
  const result = paymentMetadataSchema.safeParse(paymentIntent.metadata)

  if (!result.success) {
    console.error('Invalid payment metadata:', {
      paymentIntentId: paymentIntent.id,
      errors: result.error.issues,
    })
    throw new Error('Invalid payment intent metadata')
  }

  const metadata = result.data

  const cardLastFour = await getCardLastFour(paymentIntent)
  const studentId = await findOrCreateStudent(metadata, supabase)
  await createPaymentRecord({ metadata, paymentIntent, studentId, cardLastFour, supabase })

  console.log('Payment recorded:', { id: paymentIntent.id, studentId, amount: metadata.tuitionAmount })
}

async function getCardLastFour(paymentIntent: Stripe.PaymentIntent): Promise<string | null> {
  if (!paymentIntent.latest_charge) return null

  try {
    const chargeId = typeof paymentIntent.latest_charge === 'string'
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge.id
    const charge = await stripe.charges.retrieve(chargeId)
    return charge.payment_method_details?.card?.last4 ?? null
  } catch (err) {
    console.error('Failed to retrieve card details:', err instanceof Error ? err.message : err)
    return null
  }
}

async function findOrCreateStudent(
  metadata: PaymentMetadata,
  supabase: SupabaseServiceClient
): Promise<string> {
  // Check for existing student first
  const { data: existing } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', metadata.schoolId)
    .eq('parent_email', metadata.parentEmail)
    .single()

  if (existing) return existing.id

  // Create new student
  const { data: created, error } = await supabase
    .from('students')
    .insert({
      school_id: metadata.schoolId,
      student_name: metadata.studentName,
      student_identifier: metadata.studentIdentifier || null,
      parent_email: metadata.parentEmail,
    })
    .select('id')
    .single()

  if (error) {
    // Handle race condition: another request created the student between our check and insert
    if (error.code === '23505') {
      const { data: raceResult } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', metadata.schoolId)
        .eq('parent_email', metadata.parentEmail)
        .single()

      if (raceResult) return raceResult.id
    }

    throw new Error(`Failed to create student: ${error.message}`)
  }

  return created.id
}

async function createPaymentRecord({
  metadata,
  paymentIntent,
  studentId,
  cardLastFour,
  supabase,
}: {
  metadata: PaymentMetadata
  paymentIntent: Stripe.PaymentIntent
  studentId: string
  cardLastFour: string | null
  supabase: SupabaseServiceClient
}) {
  const tuitionAmount = parseFloat(metadata.tuitionAmount)
  const processingFee = parseFloat(metadata.processingFee)
  const revenueShare = Math.round(tuitionAmount * 0.015 * 100) / 100

  const { error } = await supabase
    .from('payments')
    .insert({
      school_id: metadata.schoolId,
      student_id: studentId,
      amount: tuitionAmount,
      stripe_payment_intent_id: paymentIntent.id,
      card_last_four: cardLastFour,
      processing_fee: processingFee,
      revenue_share_amount: revenueShare,
      status: 'completed',
      payment_method: 'stripe',
    })

  if (error) {
    throw new Error(`Failed to create payment record: ${error.message}`)
  }
}
