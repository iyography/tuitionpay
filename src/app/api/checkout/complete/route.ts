import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTransaction } from '@/lib/helcim/checkout'
import { sendPaymentConfirmation } from '@/lib/email/send-confirmation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, transactionId } = body

    if (!paymentId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Get related school and student data
    const [schoolResult, studentResult] = await Promise.all([
      supabase
        .from('schools')
        .select('name, contact_email')
        .eq('id', payment.school_id)
        .single(),
      supabase
        .from('students')
        .select('student_name, parent_email')
        .eq('id', payment.student_id)
        .single(),
    ])

    const school = schoolResult.data
    const student = studentResult.data

    // Verify the transaction with Helcim
    let transactionDetails
    try {
      transactionDetails = await verifyTransaction(transactionId)
    } catch (verifyError) {
      console.error('Transaction verification failed:', verifyError)
      // Continue with the transaction ID we received - webhook will handle verification
      transactionDetails = null
    }

    const status = transactionDetails?.status === 'approved' ? 'completed' : 'failed'
    const cardLastFour = transactionDetails?.cardLastFour || '****'

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        helcim_transaction_id: transactionId,
        card_last_four: cardLastFour,
        status,
      })
      .eq('id', paymentId)

    if (updateError) {
      console.error('Error updating payment:', updateError)
    }

    // Send confirmation email
    const processingFee = payment.processing_fee ?? 0
    const paymentAmount = payment.amount ?? 0

    if (student?.parent_email) {
      try {
        await sendPaymentConfirmation({
          to: student.parent_email,
          studentName: student.student_name,
          schoolName: school?.name || 'School',
          amount: paymentAmount,
          processingFee,
          totalAmount: paymentAmount + processingFee,
          transactionId,
          cardLastFour,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      transactionId,
      status,
      amount: paymentAmount,
      totalCharged: paymentAmount + processingFee,
    })
  } catch (error) {
    console.error('Checkout completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
