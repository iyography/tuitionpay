import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    // We'll need to add the webhook secret to environment variables
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

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        
        // Extract metadata
        const {
          schoolId,
          studentName,
          studentIdentifier,
          parentEmail,
          tuitionAmount,
          processingFee,
        } = paymentIntent.metadata

        // Create student record
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

        if (studentError && !studentError.message.includes('duplicate key')) {
          console.error('Error creating student:', studentError)
          break
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            school_id: schoolId,
            student_id: student?.id || null,
            amount: parseFloat(tuitionAmount),
            stripe_payment_intent_id: paymentIntent.id,
            card_last_four: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
            processing_fee: parseFloat(processingFee),
            revenue_share_amount: parseFloat(tuitionAmount) * 0.015, // 1.5% revenue share
            status: 'completed',
          })

        if (paymentError) {
          console.error('Error creating payment record:', paymentError)
        }

        console.log('Payment succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id)
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