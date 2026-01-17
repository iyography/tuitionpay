'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  Users,
  Search,
  CreditCard,
  DollarSign,
} from 'lucide-react'
import type { AssessmentResponse } from '@/types/database'

interface AssessmentWithDetails extends AssessmentResponse {
  school_name?: string
  recommendations?: { card_name: string; estimated_savings: number }[]
}

export default function UsersPage() {
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: assessmentsData } = await supabase
        .from('assessment_responses')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: schools } = await supabase
        .from('schools')
        .select('id, name')

      const { data: recommendations } = await supabase
        .from('card_recommendations')
        .select('assessment_id, card_name, estimated_savings, rank')
        .order('rank', { ascending: true })

      const assessmentsWithDetails: AssessmentWithDetails[] = (assessmentsData || []).map(assessment => {
        const school = schools?.find(s => s.id === assessment.school_id)
        const recs = recommendations?.filter(r => r.assessment_id === assessment.id) || []

        return {
          ...assessment,
          school_name: school?.name,
          recommendations: recs.map(r => ({
            card_name: r.card_name,
            estimated_savings: r.estimated_savings || 0,
          })),
        }
      })

      setAssessments(assessmentsWithDetails)
    } catch (error) {
      console.error('Error fetching assessments:', error)
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
      hour: '2-digit',
      minute: '2-digit',
    })

  const filteredAssessments = assessments.filter(assessment =>
    assessment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.session_id.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-bold">Users & Assessments</h1>
        <p className="text-muted-foreground">
          View all card assessments and user data
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Est. Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(assessments.reduce((sum, a) => {
                const topRec = a.recommendations?.[0]
                return sum + (topRec?.estimated_savings || 0)
              }, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Tuition</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(assessments.length > 0
                ? assessments.reduce((sum, a) => sum + (a.tuition_amount || 0), 0) / assessments.length
                : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, school, or session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Assessments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Assessments ({filteredAssessments.length})</CardTitle>
            <CardDescription>
              Card recommendation assessments from all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assessments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-right">Tuition</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Business Cards</TableHead>
                    <TableHead>Top Recommendation</TableHead>
                    <TableHead className="text-right">Est. Savings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(assessment.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {assessment.student_name || 'Anonymous'}
                      </TableCell>
                      <TableCell>
                        {assessment.school_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(assessment.tuition_amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assessment.credit_score_range || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.open_to_business_cards ? (
                          <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {assessment.recommendations?.[0]?.card_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        {formatCurrency(assessment.recommendations?.[0]?.estimated_savings || 0)}
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
