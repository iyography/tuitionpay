'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  School,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Users,
  DollarSign,
  Loader2,
  Building,
} from 'lucide-react'
import type { SchoolApplication } from '@/types/database'

type ApplicationWithAddress = SchoolApplication & {
  parsedAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithAddress | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('school_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Parse address JSON for each application
      const parsed = (data || []).map((app: SchoolApplication) => ({
        ...app,
        parsedAddress: typeof app.address === 'string'
          ? JSON.parse(app.address)
          : app.address as ApplicationWithAddress['parsedAddress'],
      }))

      setApplications(parsed)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('school_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      // If approved, create the school record
      if (status === 'approved' && selectedApplication) {
        const { error: schoolError } = await supabase
          .from('schools')
          .insert({
            name: selectedApplication.school_name,
            contact_email: selectedApplication.contact_email,
            address: selectedApplication.address,
            status: 'pending', // Will be 'active' after Helcim setup
            revenue_share_percentage: 1.5,
          })

        if (schoolError) {
          console.error('Error creating school:', schoolError)
        }
      }

      // Refresh list
      await fetchApplications()
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error updating application:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      case 'onboarding':
        return <Badge className="bg-blue-500 gap-1"><Building className="h-3 w-3" /> Onboarding</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSchoolTypeName = (type: string) => {
    switch (type) {
      case 'catholic': return 'Catholic'
      case 'christian': return 'Christian'
      case 'private_secular': return 'Private Secular'
      case 'montessori': return 'Montessori'
      default: return 'Other'
    }
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Applications</h1>
          <p className="text-muted-foreground">
            Review and approve schools that want to partner with TuitionPay
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              School applications will appear here when schools apply to partner.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.school_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.parsedAddress?.city}, {app.parsedAddress?.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getSchoolTypeName(app.school_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{app.contact_name}</p>
                        <p className="text-muted-foreground">{app.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.estimated_students}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              {selectedApplication?.school_name}
            </DialogTitle>
            <DialogDescription>
              Application submitted on {selectedApplication && new Date(selectedApplication.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedApplication.status)}
                <Badge variant="outline">{getSchoolTypeName(selectedApplication.school_type)}</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApplication.contact_name}</span>
                      <span className="text-muted-foreground">({selectedApplication.contact_title})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedApplication.contact_email}`} className="text-primary hover:underline">
                        {selectedApplication.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApplication.contact_phone}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Address</h4>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{selectedApplication.parsedAddress?.street}</p>
                      <p>
                        {selectedApplication.parsedAddress?.city}, {selectedApplication.parsedAddress?.state} {selectedApplication.parsedAddress?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* School Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold">School Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Est. {selectedApplication.estimated_students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Avg. tuition: {selectedApplication.average_tuition}</span>
                    </div>
                  </div>
                </div>

                {/* Current System */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Current Payment System</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.current_payment_system || 'Not specified'}
                  </p>
                </div>
              </div>

              {selectedApplication.additional_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedApplication.additional_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedApplication?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
                <Button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve & Create School
                </Button>
              </>
            )}
            {selectedApplication?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
