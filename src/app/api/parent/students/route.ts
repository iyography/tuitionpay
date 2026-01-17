import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get linked students
    const { data: linkedStudents, error } = await supabase
      .from('parent_students')
      .select('id, student_id, is_primary, relationship, created_at')
      .eq('parent_id', user.id)

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    if (!linkedStudents || linkedStudents.length === 0) {
      return NextResponse.json([])
    }

    // Get student details
    const studentIds = linkedStudents.map(ls => ls.student_id)
    const { data: studentsData } = await supabase
      .from('students')
      .select('id, student_name, student_identifier, school_id, parent_email')
      .in('id', studentIds)

    // Get school info
    const schoolIds = [...new Set(studentsData?.map(s => s.school_id) || [])]
    const { data: schoolsData } = await supabase
      .from('schools')
      .select('id, name')
      .in('id', schoolIds)

    const studentMap = new Map(studentsData?.map(s => [s.id, s]) || [])
    const schoolMap = new Map(schoolsData?.map(s => [s.id, { id: s.id, name: s.name }]) || [])

    // Transform data for easier consumption
    const students = linkedStudents.map(ls => {
      const student = studentMap.get(ls.student_id)
      return {
        link_id: ls.id,
        is_primary: ls.is_primary,
        relationship: ls.relationship,
        linked_at: ls.created_at,
        id: student?.id || ls.student_id,
        student_name: student?.student_name || 'Unknown',
        student_identifier: student?.student_identifier || null,
        school_id: student?.school_id || '',
        parent_email: student?.parent_email || '',
        schools: student ? schoolMap.get(student.school_id) || null : null,
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { student_id, relationship = 'parent', is_primary = false } = body

    if (!student_id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Verify the student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', student_id)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Create the link
    const { data: link, error: linkError } = await supabase
      .from('parent_students')
      .insert({
        parent_id: user.id,
        student_id,
        relationship,
        is_primary,
      })
      .select()
      .single()

    if (linkError) {
      if (linkError.code === '23505') {
        return NextResponse.json(
          { error: 'Student is already linked to your account' },
          { status: 409 }
        )
      }
      console.error('Error linking student:', linkError)
      return NextResponse.json(
        { error: 'Failed to link student' },
        { status: 500 }
      )
    }

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Error linking student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
