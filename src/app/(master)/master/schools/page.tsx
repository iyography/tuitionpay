'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Search,
  Mail,
  DollarSign,
  Users,
} from 'lucide-react'
import type { School } from '@/types/database'

interface SchoolWithStats extends School {
  paymentCount: number
  totalRevenue: number
  studentCount: number
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: schoolsData } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: payments } = await supabase
        .from('payments')
        .select('school_id, amount, status')

      const { data: students } = await supabase
        .from('students')
        .select('school_id')

      const schoolsWithStats: SchoolWithStats[] = (schoolsData || []).map(school => {
        const schoolPayments = payments?.filter(p => p.school_id === school.id && p.status === 'completed') || []
        const schoolStudents = students?.filter(s => s.school_id === school.id) || []

        return {
          ...school,
          paymentCount: schoolPayments.length,
          totalRevenue: schoolPayments.reduce((sum, p) => sum + Number(p.amount), 0),
          studentCount: schoolStudents.length,
        }
      })

      setSchools(schoolsWithStats)
    } catch (error) {
      console.error('Error fetching schools:', error)
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Schools</h1>
        <p className="text-muted-foreground">
          Manage all schools on the platform
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Schools Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Schools ({filteredSchools.length})</CardTitle>
            <CardDescription>
              Overview of all registered schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSchools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No schools found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{getStatusBadge(school.status)}</TableCell>
                      <TableCell>
                        <a href={`mailto:${school.contact_email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                          <Mail className="h-3 w-3" />
                          {school.contact_email}
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        {formatCurrency(school.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">{school.paymentCount}</TableCell>
                      <TableCell className="text-right">{school.studentCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(school.created_at)}
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
