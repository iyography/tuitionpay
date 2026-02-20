import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service client — webhooks have no user session, so anon key RLS would block inserts
  const supabase = await createServiceClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Extract metadata
        const {
          schoolId,
          studentName,
          studentIdentifier,
          parentEmail,
          tuitionAmount,
          processingFee,
        } = paymentIntent.metadata

        // Get card last4 from the latest charge
        let cardLastFour: string | null = null
        if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(
            typeof paymentIntent.latest_charge === 'string'
              ? paymentIntent.latest_charge
              : paymentIntent.latest_charge.id
          )
          cardLastFour = charge.payment_method_details?.card?.last4 ?? null
        }

        // Create or find existing student record
        let studentId: string
        const { data: student, error: studentError } = await supabase
          .from('students')
          .insert({
            school_id: schoolId,
            student_name: studentName,
            student_identifier: studentIdentifier || null,
            parent_email: parentEmail,
          })
          .select()
          .single()

        if (studentError) {
          if (studentError.message.includes('duplicate key')) {
            // Student already exists — look them up
            const { data: existing } = await supabase
              .from('students')
              .select('id')
              .eq('school_id', schoolId)
              .eq('parent_email', parentEmail)
              .single()
            if (!existing) {
              console.error('Could not find existing student after duplicate key error')
              break
            }
            studentId = existing.id
          } else {
            console.error('Error creating student:', studentError)
            break
          }
        } else {
          studentId = student.id
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            school_id: schoolId,
            student_id: studentId,
            amount: parseFloat(tuitionAmount),
            stripe_payment_intent_id: paymentIntent.id,
            card_last_four: cardLastFour,
            processing_fee: parseFloat(processingFee),
            revenue_share_amount: parseFloat(tuitionAmount) * 0.015,
            status: 'completed',
            payment_method: 'stripe',
          })

        if (paymentError) {
          console.error('Error creating payment record:', paymentError)
        }

        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed':
        console.error('Payment failed:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}