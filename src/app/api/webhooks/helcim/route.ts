import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/helcim/client'
import type { HelcimWebhookPayload } from '@/lib/helcim/types'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-helcim-signature') || ''
    const webhookSecret = process.env.HELCIM_WEBHOOK_SECRET || ''

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const webhookData: HelcimWebhookPayload = JSON.parse(payload)
    const { event, transactionId, amount, status } = webhookData

    const supabase = await createServiceClient()

    switch (event) {
      case 'payment.completed': {
        // Update payment status
        const { error } = await supabase
          .from('payments')
          .update({
            status: 'completed',
          })
          .eq('helcim_transaction_id', transactionId)

        if (error) {
          console.error('Error updating payment on completion:', error)
        }
        break
      }

      case 'payment.failed': {
        const { error } = await supabase
          .from('payments')
          .update({
            status: 'failed',
          })
          .eq('helcim_transaction_id', transactionId)

        if (error) {
          console.error('Error updating payment on failure:', error)
        }
        break
      }

      case 'payment.refunded': {
        const { error } = await supabase
          .from('payments')
          .update({
            status: 'refunded',
          })
          .eq('helcim_transaction_id', transactionId)

        if (error) {
          console.error('Error updating payment on refund:', error)
        }
        break
      }

      case 'settlement.completed': {
        // Log settlement for reconciliation
        console.log(`Settlement completed for transaction ${transactionId}`)
        // Could update a settlements table here
        break
      }

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
