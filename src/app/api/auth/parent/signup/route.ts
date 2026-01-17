import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for simplicity, set to false if you want email verification
      user_metadata: {
        full_name: fullName,
        user_type: 'parent',
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create parent record in our parents table
    const { error: parentError } = await supabase
      .from('parents')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName || null,
      })

    if (parentError) {
      console.error('Parent record error:', parentError)
      // User was created but parent record failed - log but continue
      // The parent record can be created on first login
    }

    // Auto-link any existing students with matching parent email
    const { data: existingStudents } = await supabase
      .from('students')
      .select('id')
      .eq('parent_email', email)

    if (existingStudents && existingStudents.length > 0) {
      const studentLinks = existingStudents.map((student, index) => ({
        parent_id: authData.user!.id,
        student_id: student.id,
        is_primary: index === 0,
        relationship: 'parent',
      }))

      const { error: linkError } = await supabase
        .from('parent_students')
        .insert(studentLinks)

      if (linkError) {
        console.error('Student linking error:', linkError)
        // Non-critical error, students can be linked later
      }
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      studentsLinked: existingStudents?.length || 0,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
