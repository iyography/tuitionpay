import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/helcim/checkout'
import { v4 as uuidv4 } from 'uuid'
import {
  checkRateLimit,
  checkIdempotency,
  storeIdempotencyResponse,
  generatePaymentIdempotencyKey,
  getClientIp,
} from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 10 requests per minute per IP
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(clientIp, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body = await request.json()
    const {
      schoolId,
      studentName,
      studentIdentifier,
      parentEmail,
      amount,
    } = body

    // Validate required fields
    if (!schoolId || !studentName || !parentEmail || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Amount must be at least $1' },
        { status: 400 }
      )
    }

    // Idempotency check - prevent duplicate payment initializations
    const idempotencyKey = generatePaymentIdempotencyKey({
      schoolId,
      studentName,
      parentEmail,
      amount,
    })

    const idempotencyCheck = checkIdempotency(idempotencyKey)
    if (idempotencyCheck.duplicate) {
      return NextResponse.json(idempotencyCheck.cachedResponse, {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      })
    }

    const supabase = await createClient()

    // Get school info
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

    // Calculate fees
    const processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100
    const totalAmount = amount + processingFee
    const revenueShare = Math.round((amount * (school.revenue_share_percentage / 100)) * 100) / 100

    // Generate invoice number for tracking
    const invoiceNumber = `TP-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`

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

    // Create pending payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        amount,
        processing_fee: processingFee,
        revenue_share_amount: revenueShare,
        status: 'pending',
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

    // Initialize Helcim checkout session
    try {
      const checkoutSession = await createCheckoutSession({
        amount: totalAmount,
        currency: 'USD',
        paymentType: 'purchase',
        invoiceNumber,
        companyName: school.name,
        customerName: studentName,
        customerEmail: parentEmail,
      })

      const responseData = {
        checkoutToken: checkoutSession.checkoutToken,
        secretToken: checkoutSession.secretToken,
        paymentId: payment.id,
        invoiceNumber,
        amount,
        processingFee,
        totalAmount,
        schoolName: school.name,
        studentName,
      }

      // Store for idempotency
      storeIdempotencyResponse(idempotencyKey, responseData)

      return NextResponse.json(responseData, {
        headers: {
          'X-Idempotency-Key': idempotencyKey,
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      })
    } catch (helcimError) {
      // Mark payment as failed if Helcim initialization fails
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      console.error('Helcim checkout error:', helcimError)
      return NextResponse.json(
        { error: 'Failed to initialize payment session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Checkout initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
