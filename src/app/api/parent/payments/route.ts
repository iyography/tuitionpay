import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const studentId = searchParams.get('student_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'] as const
      if (validStatuses.includes(status as typeof validStatuses[number])) {
        query = query.eq('status', status as typeof validStatuses[number])
      }
    }

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data: payments, error, count } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    // Get student and school info separately
    const studentIds = [...new Set(payments?.map(p => p.student_id) || [])]
    let studentMap = new Map<string, { name: string; identifier: string | null; school_id: string }>()
    let schoolMap = new Map<string, { id: string; name: string }>()

    if (studentIds.length > 0) {
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, student_name, student_identifier, school_id')
        .in('id', studentIds)

      const schoolIds = [...new Set(studentsData?.map(s => s.school_id) || [])]
      const { data: schoolsData } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds)

      studentMap = new Map(studentsData?.map(s => [s.id, { name: s.student_name, identifier: s.student_identifier, school_id: s.school_id }]) || [])
      schoolMap = new Map(schoolsData?.map(s => [s.id, { id: s.id, name: s.name }]) || [])
    }

    // Transform data for easier consumption
    const transformedPayments = payments?.map(p => {
      const student = studentMap.get(p.student_id)
      return {
        id: p.id,
        amount: p.amount,
        processing_fee: p.processing_fee,
        revenue_share_amount: p.revenue_share_amount,
        status: p.status,
        card_last_four: p.card_last_four,
        helcim_transaction_id: p.helcim_transaction_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
        student: student ? {
          id: p.student_id,
          name: student.name,
          identifier: student.identifier,
          school: schoolMap.get(student.school_id) || null,
        } : null,
      }
    }) || []

    return NextResponse.json({
      payments: transformedPayments,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
