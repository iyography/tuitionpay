import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processPayment, calculateProcessingFee, calculateRevenueShare } from '@/lib/helcim/client'
import { paymentFormSchema } from '@/lib/validations/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const validationResult = paymentFormSchema.safeParse({
      schoolId: body.schoolId,
      studentName: body.studentName,
      studentIdentifier: body.studentIdentifier,
      parentEmail: body.parentEmail,
      amount: body.amount,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid payment data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const {
      schoolId,
      studentName,
      studentIdentifier,
      parentEmail,
      amount,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
    } = body

    const supabase = await createClient()

    // Get school info for merchant ID and revenue share
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single()

    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Create or find student record
    let studentId: string

    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('student_name', studentName)
      .eq('parent_email', parentEmail)
      .maybeSingle()

    if (existingStudent) {
      studentId = existingStudent.id
    } else {
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          school_id: schoolId,
          student_name: studentName,
          student_identifier: studentIdentifier || null,
          parent_email: parentEmail,
        })
        .select('id')
        .single()

      if (studentError || !newStudent) {
        console.error('Error creating student:', studentError)
        return NextResponse.json(
          { error: 'Failed to create student record' },
          { status: 500 }
        )
      }

      studentId = newStudent.id
    }

    // Calculate fees
    const processingFee = calculateProcessingFee(amount)
    const revenueShare = calculateRevenueShare(amount, school.revenue_share_percentage)

    // Create pending payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        amount,
        processing_fee: processingFee,
        revenue_share_amount: revenueShare,
        status: 'processing',
      })
      .select()
      .single()

    if (paymentError || !payment) {
      console.error('Error creating payment:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Process payment through Helcim (mocked)
    try {
      const helcimResponse = await processPayment({
        amount: amount + processingFee, // Total amount including fee
        currency: 'USD',
        merchantId: school.helcim_merchant_id || 'default_merchant',
        invoiceNumber: payment.id,
        comments: `Tuition payment for ${studentName} at ${school.name}`,
      })

      // Update payment record with transaction details
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          helcim_transaction_id: helcimResponse.transactionId,
          card_last_four: helcimResponse.cardLastFour,
          status: helcimResponse.status === 'approved' ? 'completed' : 'failed',
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Error updating payment:', updateError)
      }

      if (helcimResponse.status !== 'approved') {
        return NextResponse.json(
          {
            error: 'Payment declined',
            message: helcimResponse.responseMessage,
          },
          { status: 400 }
        )
      }

      // TODO: Send confirmation email to parent
      // TODO: Notify school via webhook

      return NextResponse.json({
        success: true,
        transactionId: helcimResponse.transactionId,
        amount: amount,
        totalCharged: amount + processingFee,
        status: 'completed',
      })
    } catch (paymentProcessError) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      console.error('Payment processing error:', paymentProcessError)
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
