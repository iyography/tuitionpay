'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  Circle,
  Building2,
  CreditCard,
  BanknoteIcon,
  Mail,
  MapPin,
} from 'lucide-react'
import type { School } from '@/types/database'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  icon: React.ComponentType<{ className?: string }>
}

export default function SettingsPage() {
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchoolData()
  }, [])

  const fetchSchoolData = async () => {
    try {
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

      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', adminData.school_id)
        .single()

      setSchool(schoolData)
    } catch (error) {
      console.error('Error fetching school data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOnboardingSteps = (): OnboardingStep[] => {
    if (!school) return []

    return [
      {
        id: 'profile',
        title: 'Complete School Profile',
        description: 'Add your school name and contact information',
        completed: !!school.name && !!school.contact_email,
        icon: Building2,
      },
      {
        id: 'address',
        title: 'Add School Address',
        description: 'Provide your school address for receipts',
        completed: !!school.address,
        icon: MapPin,
      },
      {
        id: 'stripe',
        title: 'Connect Payment Processing',
        description: 'Set up your Stripe payment processing account',
        completed: !!school.stripe_account_id,
        icon: CreditCard,
      },
      {
        id: 'bank',
        title: 'Verify Bank Account',
        description: 'Connect your bank account for fund deposits',
        completed: !!school.bank_account_info,
        icon: BanknoteIcon,
      },
    ]
  }

  const onboardingSteps = getOnboardingSteps()
  const completedSteps = onboardingSteps.filter((s) => s.completed).length
  const onboardingProgress = onboardingSteps.length > 0 ? (completedSteps / onboardingSteps.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your school&apos;s account and preferences
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* School Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Your school&apos;s profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">School Name</label>
                <p className="font-medium">{school?.name || 'Not set'}</p>
              </div>

              <Separator />

              <div>
                <label className="text-sm text-muted-foreground">Contact Email</label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {school?.contact_email || 'Not set'}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                {school?.address && typeof school.address === 'object' ? (
                  <p className="font-medium">
                    {(school.address as Record<string, string>).street}<br />
                    {(school.address as Record<string, string>).city}, {(school.address as Record<string, string>).state} {(school.address as Record<string, string>).zip}
                  </p>
                ) : (
                  <p className="text-muted-foreground">Not set</p>
                )}
              </div>

              <Separator />

              <div>
                <label className="text-sm text-muted-foreground">Account Status</label>
                <div className="mt-1">
                  {school?.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : school?.status === 'pending' ? (
                    <Badge variant="outline">Pending</Badge>
                  ) : (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Onboarding Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Onboarding Checklist</span>
                <Badge variant="outline">
                  {completedSteps}/{onboardingSteps.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Complete these steps to start accepting payments
              </CardDescription>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${onboardingProgress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      step.completed ? 'bg-green-50' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? 'text-green-800' : ''}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    <step.icon className={`h-5 w-5 ${step.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>
                ))}
              </div>

              {completedSteps < onboardingSteps.length && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Need help?</strong> Contact our support team to complete your account setup
                    and start accepting tuition payments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Processing
            </CardTitle>
            <CardDescription>
              Your Stripe payment processing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground">Account ID</label>
                <p className="font-mono font-medium">
                  {school?.stripe_account_id || 'Not connected'}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Processing Status</label>
                <div className="mt-1">
                  {school?.stripe_account_id ? (
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  ) : (
                    <Badge variant="outline">Not Connected</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
