'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
} from 'lucide-react'
import { DEMO_MODE, getDemoSchool, getDemoMetrics, getDemoTransactionsForSchool, demoAdmin } from '@/lib/demo-data'
import type { School } from '@/types/database'

interface DashboardMetrics {
  totalPayments: number
  totalRevenue: number
  pendingPayments: number
  studentCount: number
}

interface RecentPayment {
  id: string
  student_name?: string
  amount: number
  processing_fee: number | null
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (DEMO_MODE) {
        // Use demo data
        await new Promise(resolve => setTimeout(resolve, 800))

        const schoolId = demoAdmin.school_id
        const demoSchool = getDemoSchool(schoolId)
        const demoMetrics = getDemoMetrics(schoolId)
        const transactions = getDemoTransactionsForSchool(schoolId)

        setSchool(demoSchool as School)
        setMetrics(demoMetrics)
        setRecentPayments(transactions.slice(0, 10).map(t => ({
          id: t.id,
          student_name: t.student_name,
          amount: t.amount,
          processing_fee: t.processing_fee,
          status: t.status,
          created_at: t.created_at
        })))
        setIsLoading(false)
        return
      }

      // Real Supabase fetch
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get current user and their school
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: adminData } = await supabase
        .from('school_admins')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (!adminData) return

      // Get school info
      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', adminData.school_id)
        .single()

      setSchool(schoolData)

      // Get payment metrics
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('school_id', adminData.school_id)

      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', adminData.school_id)

      if (payments) {
        const completedPayments = payments.filter(p => p.status === 'completed')
        const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing')

        setMetrics({
          totalPayments: completedPayments.length,
          totalRevenue: completedPayments.reduce((sum, p) => sum + Number(p.amount), 0),
          pendingPayments: pendingPayments.length,
          studentCount: students?.length || 0,
        })
      }

      // Get recent payments
      const { data: recentData } = await supabase
        .from('payments')
        .select('*')
        .eq('school_id', adminData.school_id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentData) {
        const studentIds = [...new Set(recentData.map(p => p.student_id))]
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, student_name')
          .in('id', studentIds)

        const studentMap = new Map(studentsData?.map(s => [s.id, s.student_name]) || [])

        setRecentPayments(recentData.map(p => ({
          id: p.id,
          student_name: studentMap.get(p.student_id) || 'Unknown',
          amount: Number(p.amount),
          processing_fee: p.processing_fee ? Number(p.processing_fee) : null,
          status: p.status,
          created_at: p.created_at
        })))
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
      <div>
        <h1 className="text-3xl font-bold">{school?.name || 'Dashboard'}</h1>
        <p className="text-muted-foreground">
          Welcome to your payment dashboard
          {DEMO_MODE && (
            <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>
          )}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.totalRevenue || 0)}
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
                Total students with payments
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest payment activity for your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Payments will appear here once received</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell>
                        {payment.student_name || 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(payment.processing_fee || 0)}
                      </TableCell>
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
