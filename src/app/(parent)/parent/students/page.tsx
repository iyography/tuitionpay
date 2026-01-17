'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  CreditCard,
  School,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  student_name: string
  student_identifier: string | null
  school_id: string
  school_name: string
  is_primary: boolean
  relationship: string
  total_paid: number
  payment_count: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get linked students
      const { data: linkedStudents } = await supabase
        .from('parent_students')
        .select('student_id, is_primary, relationship')
        .eq('parent_id', user.id)

      if (linkedStudents && linkedStudents.length > 0) {
        const studentIds = linkedStudents.map(ls => ls.student_id)

        // Get student details
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, student_name, student_identifier, school_id')
          .in('id', studentIds)

        // Get school info
        const schoolIds = [...new Set(studentsData?.map(s => s.school_id) || [])]
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', schoolIds)

        const schoolMap = new Map(schoolsData?.map(s => [s.id, s.name]) || [])

        // Get payment totals for each student
        const { data: payments } = await supabase
          .from('payments')
          .select('student_id, amount, status')
          .in('student_id', studentIds)
          .eq('status', 'completed')

        // Calculate totals per student
        const paymentTotals = new Map<string, { total: number; count: number }>()
        payments?.forEach(p => {
          const existing = paymentTotals.get(p.student_id) || { total: 0, count: 0 }
          paymentTotals.set(p.student_id, {
            total: existing.total + Number(p.amount),
            count: existing.count + 1,
          })
        })

        // Create link map for is_primary and relationship
        const linkMap = new Map(linkedStudents.map(ls => [ls.student_id, { is_primary: ls.is_primary, relationship: ls.relationship }]))

        const studentsList = (studentsData || []).map(student => {
          const link = linkMap.get(student.id) || { is_primary: false, relationship: 'parent' }
          const totals = paymentTotals.get(student.id) || { total: 0, count: 0 }
          return {
            id: student.id,
            student_name: student.student_name,
            student_identifier: student.student_identifier,
            school_id: student.school_id,
            school_name: schoolMap.get(student.school_id) || 'Unknown School',
            is_primary: link.is_primary,
            relationship: link.relationship,
            total_paid: totals.total,
            payment_count: totals.count,
          }
        })
        setStudents(studentsList)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

  const totalStudents = students.length
  const totalPaid = students.reduce((sum, s) => sum + s.total_paid, 0)

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Students</h1>
          <p className="text-muted-foreground">
            Manage students linked to your account
          </p>
        </div>
        <Button asChild>
          <Link href="/pay">
            <CreditCard className="mr-2 h-4 w-4" />
            Make a Payment
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Linked to your account
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">
                Across all students
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              Students are automatically linked when you make a payment with your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students linked yet</p>
                <p className="text-sm">When you make a payment, students will be automatically linked to your account</p>
                <Button className="mt-4" asChild>
                  <Link href="/pay">Make a Payment</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {student.student_name}
                          {student.is_primary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.student_identifier || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-muted-foreground" />
                          {student.school_name}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {student.relationship}
                      </TableCell>
                      <TableCell>{formatCurrency(student.total_paid)}</TableCell>
                      <TableCell>{student.payment_count}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/pay?student=${student.id}`}>
                            Pay Now
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
