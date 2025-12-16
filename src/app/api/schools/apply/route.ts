import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schoolApplicationSchema = z.object({
  schoolName: z.string().min(2),
  schoolType: z.enum(['catholic', 'christian', 'private_secular', 'montessori', 'other']),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(5),
  contactName: z.string().min(2),
  contactTitle: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10),
  estimatedStudents: z.string().min(1),
  averageTuition: z.string().min(1),
  currentPaymentSystem: z.string().optional(),
  additionalNotes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = schoolApplicationSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid application data', details: validatedData.error.issues },
        { status: 400 }
      )
    }

    const {
      schoolName,
      schoolType,
      address,
      city,
      state,
      zipCode,
      contactName,
      contactTitle,
      contactEmail,
      contactPhone,
      estimatedStudents,
      averageTuition,
      currentPaymentSystem,
      additionalNotes,
    } = validatedData.data

    const supabase = await createClient()

    // Check if school already applied
    const { data: existingSchool } = await supabase
      .from('school_applications')
      .select('id')
      .eq('contact_email', contactEmail)
      .maybeSingle()

    if (existingSchool) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }

    // Create school application
    const { data: application, error: applicationError } = await supabase
      .from('school_applications')
      .insert({
        school_name: schoolName,
        school_type: schoolType,
        address: JSON.stringify({
          street: address,
          city,
          state,
          zipCode,
        }),
        contact_name: contactName,
        contact_title: contactTitle,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        estimated_students: estimatedStudents,
        average_tuition: averageTuition,
        current_payment_system: currentPaymentSystem || null,
        additional_notes: additionalNotes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (applicationError) {
      console.error('Error creating application:', applicationError)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to applicant

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('School application API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
