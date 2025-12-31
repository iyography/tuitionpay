'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  TrendingUp,
  School,
  CreditCard,
  Users,
  Building,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface PlatformMetrics {
  totalSchools: number
  activeSchools: number
  pendingApplications: number
  totalPayments: number
  totalRevenue: number
  totalRevenueShare: number
  pendingPayments: number
  totalStudents: number
  activeCreditCards: number
}

interface RecentApplication {
  id: string
  school_name: string
  contact_email: string
  status: string
}

interface RecentSchool {
  id: string
  name: string
  address: { city: string; state: string }
  status: string
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [recentSchools, setRecentSchools] = useState<RecentSchool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Fetch schools
      const { data: schoolsData } = await supabase.from('schools').select('*')
      const schools = schoolsData || []

      // Fetch applications
      const { data: applicationsData } = await supabase.from('school_applications').select('*')
      const applications = applicationsData || []

      // Fetch payments
      const { data: paymentsData } = await supabase.from('payments').select('*')
      const payments = paymentsData || []

      // Fetch students
      const { data: studentsData } = await supabase.from('students').select('id')
      const students = studentsData || []

      // Fetch credit cards
      const { data: cardsData } = await supabase.from('credit_cards').select('*').eq('is_active', true)
      const cards = cardsData || []

      // Calculate metrics
      const completedPayments = payments.filter(p => p.status === 'completed')
      const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const totalRevenueShare = completedPayments.reduce((sum, p) => sum + Number(p.revenue_share_amount || 0), 0)

      setMetrics({
        totalSchools: schools.length,
        activeSchools: schools.filter(s => s.status === 'active').length,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        totalPayments: completedPayments.length,
        totalRevenue,
        totalRevenueShare,
        pendingPayments: payments.filter(p => p.status === 'pending' || p.status === 'processing').length,
        totalStudents: students.length,
        activeCreditCards: cards.length,
      })

      // Set recent applications
      setRecentApplications(
        applications
          .filter(a => a.status === 'pending')
          .slice(0, 3)
          .map(a => ({
            id: a.id,
            school_name: a.school_name,
            contact_email: a.contact_email,
            status: a.status,
          }))
      )

      // Set recent schools
      setRecentSchools(
        schools
          .filter(s => s.status === 'active')
          .slice(0, 3)
          .map(s => ({
            id: s.id,
            name: s.name,
            address: typeof s.address === 'string' ? JSON.parse(s.address) : s.address as { city: string; state: string },
            status: s.status,
          }))
      )
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
        <h1 className="text-3xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground">
          TuitionPay Admin Overview
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-white/70">
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
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Revenue Share</CardTitle>
              <TrendingUp className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.totalRevenueShare || 0)}
              </div>
              <p className="text-xs text-white/70">
                Platform earnings (1.5%)
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
              <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.activeSchools || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {metrics?.totalSchools || 0} total
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
              <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {metrics?.pendingApplications || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.pendingPayments || 0}</div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">Across all schools</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeCreditCards || 0}</div>
              <p className="text-xs text-muted-foreground">In recommendation engine</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Schools waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending applications</p>
                ) : (
                  recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{app.school_name}</p>
                        <p className="text-sm text-muted-foreground">{app.contact_email}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Pending
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Partner Schools</CardTitle>
              <CardDescription>Active schools on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSchools.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active schools</p>
                ) : (
                  recentSchools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-sm text-muted-foreground">{school.address?.city}, {school.address?.state}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
