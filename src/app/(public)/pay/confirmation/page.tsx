'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Receipt, Mail, ArrowRight, Home } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transactionId') || 'N/A'

  return (
    <div className="container pt-28 pb-12 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto"
            >
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your tuition payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-600 font-medium">Completed</span>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-center">What Happens Next?</h3>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    A receipt has been sent to your email address
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">School Notification</p>
                  <p className="text-sm text-muted-foreground">
                    The school has been notified of your payment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Funds Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    Funds will be deposited to the school within 2-3 business days
                  </p>
                </div>
              </div>
            </div>

            {/* Rewards Reminder */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-primary mb-1">
                Don&apos;t forget your rewards!
              </p>
              <p className="text-sm text-muted-foreground">
                This payment counts toward your credit card signup bonus requirements.
                Check your card issuer&apos;s app to track your progress.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
              </Button>
              <Button className="flex-1 gap-2" asChild>
                <Link href="/pay">
                  Make Another Payment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
