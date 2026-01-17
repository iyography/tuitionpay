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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react'
import type { SchoolApplication } from '@/types/database'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<SchoolApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<SchoolApplication | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data } = await supabase
        .from('school_applications')
        .select('*')
        .order('created_at', { ascending: false })

      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      await supabase
        .from('school_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      setApplications(applications.map(app =>
        app.id === id ? { ...app, status, reviewed_at: new Date().toISOString() } : app
      ))
      setSelectedApp(null)
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Pending Review</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'onboarding':
        return <Badge className="bg-blue-100 text-blue-800">Onboarding</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSchoolTypeName = (type: string) => {
    const types: Record<string, string> = {
      catholic: 'Catholic',
      christian: 'Christian',
      private_secular: 'Private Secular',
      montessori: 'Montessori',
      other: 'Other',
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">School Applications</h1>
        <p className="text-muted-foreground">
          Review and manage school partnership applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-sm text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>
        <Card className={pendingCount > 0 ? 'border-amber-500' : ''}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              Click on an application to review details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>School Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Est. Students</TableHead>
                    <TableHead>Avg. Tuition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedApp(app)}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(app.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">{app.school_name}</TableCell>
                      <TableCell>{getSchoolTypeName(app.school_type)}</TableCell>
                      <TableCell>{app.contact_name}</TableCell>
                      <TableCell>{app.estimated_students}</TableCell>
                      <TableCell>{app.average_tuition}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
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

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedApp?.school_name}</DialogTitle>
            <DialogDescription>
              Application submitted {selectedApp && formatDate(selectedApp.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">School Type</p>
                  <p>{getSchoolTypeName(selectedApp.school_type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Contact Information</p>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.contact_name} - {selectedApp.contact_title}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedApp.contact_email}`} className="text-primary hover:underline">
                      {selectedApp.contact_email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.contact_phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Students</p>
                  <p>{selectedApp.estimated_students}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Tuition</p>
                  <p>{selectedApp.average_tuition}</p>
                </div>
              </div>

              {selectedApp.current_payment_system && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Payment System</p>
                  <p>{selectedApp.current_payment_system}</p>
                </div>
              )}

              {selectedApp.additional_notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                  <p className="text-sm">{selectedApp.additional_notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedApp?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
