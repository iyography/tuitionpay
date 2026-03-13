'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Banknote,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

interface StripeStatus {
  hasAccount: boolean
  accountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  schoolName: string | null
  schoolId: string | null
}

export default function StripeSetupPage() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/connect/account-status')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch account status')
      }
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error('Error fetching Stripe status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load Stripe status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create Stripe account')
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect with Stripe')
      setIsConnecting(false)
    }
  }

  const handleOpenDashboard = async () => {
    setIsOpeningDashboard(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/connect/create-login-link', {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create dashboard link')
      }
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (err) {
      console.error('Error opening dashboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to open Stripe dashboard')
    } finally {
      setIsOpeningDashboard(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    )
  }

  const isComplete = status?.chargesEnabled && status?.payoutsEnabled
  const isInProgress = status?.hasAccount && status?.detailsSubmitted && !isComplete
  const isStarted = status?.hasAccount && !status?.detailsSubmitted

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stripe Setup</h1>
          <p className="text-muted-foreground">
            Connect your bank account to receive tuition payments
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStatus}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl">
        {/* State: Complete */}
        {isComplete && (
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Your Stripe account is connected!</CardTitle>
                  <CardDescription>
                    You are ready to receive tuition payments
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Charges</p>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Payouts</p>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </div>

              {status.accountId && (
                <p className="text-sm text-muted-foreground">
                  Account ID: {status.accountId}
                </p>
              )}

              <Button onClick={handleOpenDashboard} disabled={isOpeningDashboard}>
                {isOpeningDashboard ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                View Stripe Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* State: In Progress (details submitted but not fully verified) */}
        {isInProgress && (
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Your Stripe account setup is in progress</CardTitle>
                  <CardDescription>
                    Stripe is reviewing your information. This usually takes 1-2 business days.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Charges</p>
                    {status.chargesEnabled ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Payouts</p>
                    {status.payoutsEnabled ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleConnectStripe} disabled={isConnecting}>
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* State: Started but details not submitted */}
        {isStarted && (
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Continue your Stripe setup</CardTitle>
                  <CardDescription>
                    Your account has been created but you haven&apos;t finished providing your details yet.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={handleConnectStripe} disabled={isConnecting}>
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* State: Not started */}
        {!status?.hasAccount && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle>Connect your bank account to start receiving payments</CardTitle>
                  <CardDescription>
                    Set up your Stripe account to securely receive tuition payments directly to your bank account.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>By connecting with Stripe, you will be able to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Accept credit and debit card payments from parents</li>
                  <li>Receive payouts directly to your bank account</li>
                  <li>View transaction history and manage refunds</li>
                </ul>
              </div>

              <Button onClick={handleConnectStripe} disabled={isConnecting} size="lg">
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Connect with Stripe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
