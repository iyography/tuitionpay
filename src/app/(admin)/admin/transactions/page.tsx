'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Search, Filter } from 'lucide-react'
import { DEMO_MODE, getDemoTransactionsForSchool, demoAdmin } from '@/lib/demo-data'

interface TransactionWithStudent {
  id: string
  student_name?: string
  student_identifier?: string | null
  parent_email?: string
  amount: number
  helcim_transaction_id?: string | null
  card_last_four?: string | null
  processing_fee?: number | null
  status: string
  created_at: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithStudent[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter, dateFilter])

  const fetchTransactions = async () => {
    try {
      if (DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600))
        const demoTxns = getDemoTransactionsForSchool(demoAdmin.school_id)
        setTransactions(demoTxns.map(t => ({
          id: t.id,
          student_name: t.student_name,
          parent_email: t.parent_email,
          amount: t.amount,
          helcim_transaction_id: t.helcim_transaction_id,
          card_last_four: t.card_last_four,
          processing_fee: t.processing_fee,
          status: t.status,
          created_at: t.created_at
        })))
        setIsLoading(false)
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: adminData } = await supabase
        .from('school_admins')
        .select('school_id')
        .eq('id', user.id)
        .single()

      if (!adminData) return

      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('school_id', adminData.school_id)
        .order('created_at', { ascending: false })

      if (data) {
        const studentIds = [...new Set(data.map(p => p.student_id))]
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, student_name, student_identifier, parent_email')
          .in('id', studentIds)

        const studentMap = new Map(studentsData?.map(s => [s.id, s]) || [])

        setTransactions(data.map(p => ({
          id: p.id,
          student_name: studentMap.get(p.student_id)?.student_name || 'Unknown',
          student_identifier: studentMap.get(p.student_id)?.student_identifier || null,
          parent_email: studentMap.get(p.student_id)?.parent_email || '',
          amount: Number(p.amount),
          helcim_transaction_id: p.helcim_transaction_id,
          card_last_four: p.card_last_four,
          processing_fee: p.processing_fee ? Number(p.processing_fee) : null,
          status: p.status,
          created_at: p.created_at
        })))
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.student_name?.toLowerCase().includes(search) ||
          t.student_identifier?.toLowerCase().includes(search) ||
          t.parent_email?.toLowerCase().includes(search) ||
          t.helcim_transaction_id?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.created_at)
        switch (dateFilter) {
          case 'today':
            return txDate.toDateString() === now.toDateString()
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return txDate >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return txDate >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredTransactions(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Student', 'Student ID', 'Email', 'Amount', 'Fee', 'Status']
    const rows = filteredTransactions.map((t) => [
      new Date(t.created_at).toISOString(),
      t.helcim_transaction_id || '',
      t.student_name || '',
      t.student_identifier || '',
      t.parent_email || '',
      t.amount,
      t.processing_fee || 0,
      t.status,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
      hour: '2-digit',
      minute: '2-digit',
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
      case 'refunded':
        return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View and export all payment transactions
          </p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.helcim_transaction_id || '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {tx.student_name || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {tx.student_identifier || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.parent_email || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(tx.processing_fee || 0)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {tx.card_last_four ? `****${tx.card_last_four}` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
