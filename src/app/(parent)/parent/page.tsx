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
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import type { Parent } from '@/types/database'

interface DashboardMetrics {
  totalPaid: number
  totalPayments: number
  pendingPayments: number
  studentCount: number
}

interface RecentPayment {
  id: string
  school_name: string
  student_name: string
  amount: number
  processing_fee: number | null
  status: string
  created_at: string
}

interface Student {
  id: string
  student_name: string
  school_name: string
}

export default function ParentDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [parent, setParent] = useState<Parent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get parent profile
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('id', user.id)
        .single()

      setParent(parentData)

      // Get linked students
      const { data: linkedStudents } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', user.id)

      if (linkedStudents && linkedStudents.length > 0) {
        const studentIds = linkedStudents.map(ls => ls.student_id)

        // Get student details with schools
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, student_name, school_id')
          .in('id', studentIds)

        if (studentsData) {
          // Get school names
          const schoolIds = [...new Set(studentsData.map(s => s.school_id))]
          const { data: schoolsData } = await supabase
            .from('schools')
            .select('id, name')
            .in('id', schoolIds)

          const schoolMap = new Map(schoolsData?.map(s => [s.id, s.name]) || [])

          const studentsList = studentsData.map(s => ({
            id: s.id,
            student_name: s.student_name,
            school_name: schoolMap.get(s.school_id) || 'Unknown School',
          }))
          setStudents(studentsList)
        }
      }

      // Get payments for this parent
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('parent_id', user.id)

      if (payments) {
        const completedPayments = payments.filter(p => p.status === 'completed')
        const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing')

        setMetrics({
          totalPaid: completedPayments.reduce((sum, p) => sum + Number(p.amount), 0),
          totalPayments: completedPayments.length,
          pendingPayments: pendingPayments.length,
          studentCount: linkedStudents?.length || 0,
        })

        // Get student and school info for payments
        const paymentStudentIds = [...new Set(payments.map(p => p.student_id))]
        const { data: paymentStudents } = await supabase
          .from('students')
          .select('id, student_name, school_id')
          .in('id', paymentStudentIds)

        const paymentSchoolIds = [...new Set(paymentStudents?.map(s => s.school_id) || [])]
        const { data: paymentSchools } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', paymentSchoolIds)

        const studentMap = new Map(paymentStudents?.map(s => [s.id, { name: s.student_name, school_id: s.school_id }]) || [])
        const schoolMap = new Map(paymentSchools?.map(s => [s.id, s.name]) || [])

        // Get recent 5 payments
        const recentList = payments
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(p => {
            const student = studentMap.get(p.student_id)
            return {
              id: p.id,
              school_name: student ? (schoolMap.get(student.school_id) || 'Unknown') : 'Unknown',
              student_name: student?.name || 'Unknown',
              amount: Number(p.amount),
              processing_fee: p.processing_fee ? Number(p.processing_fee) : null,
              status: p.status,
              created_at: p.created_at,
            }
          })
        setRecentPayments(recentList)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold">
            Welcome{parent?.full_name ? `, ${parent.full_name}` : ''}
          </h1>
          <p className="text-muted-foreground">
            View your payment history and manage students
          </p>
        </div>
        <Button asChild>
          <Link href="/pay">
            <CreditCard className="mr-2 h-4 w-4" />
            Make a Payment
          </Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.totalPaid || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {metrics?.totalPayments || 0} payments
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.pendingPayments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Payments in progress
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.studentCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Linked to your account
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalPayments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successful payments
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Students Section */}
      {students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Students</CardTitle>
                <CardDescription>
                  Students linked to your account
                </CardDescription>
              </div>
              <Button variant="outline" asChild size="sm">
                <Link href="/parent/students">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {students.slice(0, 4).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{student.student_name}</p>
                      <p className="text-xs text-muted-foreground">{student.school_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                Your latest payment activity
              </CardDescription>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link href="/parent/payments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payments yet</p>
                <p className="text-sm">Your payment history will appear here</p>
                <Button className="mt-4" asChild>
                  <Link href="/pay">Make Your First Payment</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell>{payment.student_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.school_name}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
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
