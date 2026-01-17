'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react'

interface MonthlyData {
  month: string
  year: number
  revenue: number
  payments: number
  processingFees: number
  avgPayment: number
}

export default function RevenuePage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalFees: 0,
    totalPayments: 0,
    mrr: 0,
    previousMrr: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })

      // Group by month
      const monthlyMap: Record<string, MonthlyData> = {}
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      payments?.forEach(payment => {
        const date = new Date(payment.created_at)
        const key = `${date.getFullYear()}-${date.getMonth()}`

        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            month: months[date.getMonth()],
            year: date.getFullYear(),
            revenue: 0,
            payments: 0,
            processingFees: 0,
            avgPayment: 0,
          }
        }

        monthlyMap[key].revenue += Number(payment.amount)
        monthlyMap[key].payments += 1
        monthlyMap[key].processingFees += Number(payment.processing_fee || 0)
      })

      // Calculate averages
      Object.values(monthlyMap).forEach(data => {
        data.avgPayment = data.payments > 0 ? data.revenue / data.payments : 0
      })

      // Sort by date descending
      const sorted = Object.values(monthlyMap).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return months.indexOf(b.month) - months.indexOf(a.month)
      })

      setMonthlyData(sorted)

      // Calculate totals
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
      const totalFees = payments?.reduce((sum, p) => sum + Number(p.processing_fee || 0), 0) || 0
      const totalPayments = payments?.length || 0

      // MRR (current month)
      const now = new Date()
      const currentKey = `${now.getFullYear()}-${now.getMonth()}`
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
      const previousKey = `${lastYear}-${lastMonth}`

      setTotals({
        totalRevenue,
        totalFees,
        totalPayments,
        mrr: monthlyMap[currentKey]?.revenue || 0,
        previousMrr: monthlyMap[previousKey]?.revenue || 0,
      })

    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)

  const getMrrGrowth = () => {
    if (totals.previousMrr === 0) return null
    return ((totals.mrr - totals.previousMrr) / totals.previousMrr) * 100
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const mrrGrowth = getMrrGrowth()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Revenue & MRR</h1>
        <p className="text-muted-foreground">
          Track platform revenue and monthly recurring revenue
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
                {formatCurrency(totals.totalRevenue)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                All-time platform revenue
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
              <CardTitle className="text-sm font-medium">Monthly Revenue (MRR)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totals.mrr)}
              </div>
              {mrrGrowth !== null && (
                <p className={`text-xs flex items-center gap-1 ${mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {mrrGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(mrrGrowth).toFixed(1)}% from last month
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
              <CardTitle className="text-sm font-medium">Processing Fees (3%)</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totals.totalFees)}
              </div>
              <p className="text-xs text-muted-foreground">
                Your platform earnings
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
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.totalPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed transactions
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Breakdown</CardTitle>
            <CardDescription>
              Revenue and payment volume by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No revenue data yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Processing Fees</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Avg. Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {data.month} {data.year}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(data.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        {formatCurrency(data.processingFees)}
                      </TableCell>
                      <TableCell className="text-right">{data.payments}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(data.avgPayment)}
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
