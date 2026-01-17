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
  Building2,
  Users,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PlatformMetrics {
  totalRevenue: number
  totalPayments: number
  totalSchools: number
  activeSchools: number
  totalUsers: number
  totalAssessments: number
  pendingApplications: number
  monthlyRevenue: number
  previousMonthRevenue: number
  processingFees: number
}

interface RecentActivity {
  id: string
  type: 'payment' | 'assessment' | 'application'
  description: string
  amount?: number
  school_name?: string
  created_at: string
}

export default function MasterDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topSchools, setTopSchools] = useState<{ name: string; revenue: number; payments: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get all schools
      const { data: schools } = await supabase
        .from('schools')
        .select('*')

      // Get all payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      // Get all assessments
      const { data: assessments } = await supabase
        .from('assessment_responses')
        .select('*')
        .order('created_at', { ascending: false })

      // Get all applications
      const { data: applications } = await supabase
        .from('school_applications')
        .select('*')

      // Calculate metrics
      const completedPayments = payments?.filter(p => p.status === 'completed') || []
      const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const processingFees = completedPayments.reduce((sum, p) => sum + Number(p.processing_fee || 0), 0)

      // Calculate monthly revenue
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

      const thisMonthPayments = completedPayments.filter(p => {
        const date = new Date(p.created_at)
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear
      })

      const lastMonthPayments = completedPayments.filter(p => {
        const date = new Date(p.created_at)
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      })

      const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const previousMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)

      setMetrics({
        totalRevenue,
        totalPayments: completedPayments.length,
        totalSchools: schools?.length || 0,
        activeSchools: schools?.filter(s => s.status === 'active').length || 0,
        totalUsers: assessments?.length || 0,
        totalAssessments: assessments?.length || 0,
        pendingApplications: applications?.filter(a => a.status === 'pending').length || 0,
        monthlyRevenue,
        previousMonthRevenue,
        processingFees,
      })

      // Calculate top schools by revenue
      const schoolRevenue: Record<string, { name: string; revenue: number; payments: number }> = {}
      schools?.forEach(school => {
        schoolRevenue[school.id] = { name: school.name, revenue: 0, payments: 0 }
      })

      completedPayments.forEach(payment => {
        if (schoolRevenue[payment.school_id]) {
          schoolRevenue[payment.school_id].revenue += Number(payment.amount)
          schoolRevenue[payment.school_id].payments += 1
        }
      })

      const topSchoolsList = Object.values(schoolRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setTopSchools(topSchoolsList)

      // Build recent activity
      const activity: RecentActivity[] = []

      // Add recent payments
      payments?.slice(0, 5).forEach(payment => {
        const school = schools?.find(s => s.id === payment.school_id)
        activity.push({
          id: payment.id,
          type: 'payment',
          description: `Payment ${payment.status}`,
          amount: Number(payment.amount),
          school_name: school?.name || 'Unknown School',
          created_at: payment.created_at,
        })
      })

      // Add recent assessments
      assessments?.slice(0, 5).forEach(assessment => {
        const school = schools?.find(s => s.id === assessment.school_id)
        activity.push({
          id: assessment.id,
          type: 'assessment',
          description: 'New card assessment',
          school_name: school?.name || 'Unknown School',
          created_at: assessment.created_at,
        })
      })

      // Sort by date
      activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setRecentActivity(activity.slice(0, 10))

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getRevenueGrowth = () => {
    if (!metrics || metrics.previousMonthRevenue === 0) return null
    const growth = ((metrics.monthlyRevenue - metrics.previousMonthRevenue) / metrics.previousMonthRevenue) * 100
    return growth
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

  const revenueGrowth = getRevenueGrowth()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">
          Master dashboard for TuitionPay platform management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(metrics?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {metrics?.totalPayments || 0} completed payments
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
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.monthlyRevenue || 0)}
              </div>
              {revenueGrowth !== null && (
                <p className={`text-xs flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(revenueGrowth).toFixed(1)}% from last month
                </p>
              )}
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
              <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.activeSchools || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {metrics?.totalSchools || 0} total schools
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
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalAssessments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Card recommendations generated
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Fees Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(metrics?.processingFees || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              3% of payment volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.pendingApplications || 0}
            </div>
            <Link href="/master/applications">
              <Button variant="link" className="p-0 h-auto text-xs">
                Review applications →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Payment Size</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalPayments ? (metrics.totalRevenue / metrics.totalPayments) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Schools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Schools by Revenue</CardTitle>
              <CardDescription>
                Highest earning schools on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topSchools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No school data yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Payments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSchools.map((school, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(school.revenue)}</TableCell>
                        <TableCell className="text-right">{school.payments}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest platform activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          activity.type === 'payment' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.school_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="font-medium">{formatCurrency(activity.amount)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
