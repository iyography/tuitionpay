'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SchoolSelector } from '@/components/forms/school-selector'
import { StripePaymentForm } from '@/components/forms/stripe-payment-form'
import { ArrowLeft, ArrowRight, DollarSign, School, User } from 'lucide-react'

type PaymentStep = 'school' | 'student' | 'amount' | 'payment'

interface PaymentInfo {
  schoolId: string
  schoolName: string
  studentName: string
  studentIdentifier: string
  parentEmail: string
  amount: number
}

const STEPS: PaymentStep[] = ['school', 'student', 'amount', 'payment']

function PayPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<PaymentStep>('school')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    schoolId: '',
    schoolName: '',
    studentName: '',
    studentIdentifier: '',
    parentEmail: '',
    amount: 0,
  })

  // Pre-fill from URL params if coming from optimizer
  useEffect(() => {
    const schoolId = searchParams.get('schoolId')
    const schoolName = searchParams.get('schoolName')
    if (schoolId && schoolName) {
      setPaymentInfo(prev => ({
        ...prev,
        schoolId,
        schoolName: decodeURIComponent(schoolName),
      }))
    }
  }, [searchParams])

  const stepIndex = STEPS.indexOf(currentStep)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const updatePaymentInfo = (updates: Partial<PaymentInfo>) => {
    setPaymentInfo(prev => ({ ...prev, ...updates }))
  }

  const handleSchoolSelect = (schoolId: string, schoolName: string) => {
    updatePaymentInfo({ schoolId, schoolName })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'school':
        return !!paymentInfo.schoolId
      case 'student':
        return paymentInfo.studentName.length >= 2 && paymentInfo.parentEmail.includes('@')
      case 'amount':
        return paymentInfo.amount >= 1
      case 'payment':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    const nextIndex = stepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  const handlePaymentSuccess = (transactionId: string) => {
    router.push(`/pay/confirmation?transactionId=${transactionId}`)
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'school':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <School className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select Your School</h2>
              <p className="text-muted-foreground text-sm">
                Choose the school you&apos;re making a payment to
              </p>
            </div>
            <SchoolSelector
              value={paymentInfo.schoolId}
              onSelect={handleSchoolSelect}
            />
            {paymentInfo.schoolName && (
              <p className="text-sm text-center text-muted-foreground">
                Paying to: <span className="font-medium text-foreground">{paymentInfo.schoolName}</span>
              </p>
            )}
          </div>
        )

      case 'student':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Student Information</h2>
              <p className="text-muted-foreground text-sm">
                Enter the student&apos;s details for this payment
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student&apos;s Full Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student's name"
                  value={paymentInfo.studentName}
                  onChange={(e) => updatePaymentInfo({ studentName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID (optional)</Label>
                <Input
                  id="studentId"
                  placeholder="e.g., 12345"
                  value={paymentInfo.studentIdentifier}
                  onChange={(e) => updatePaymentInfo({ studentIdentifier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Your Email *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={paymentInfo.parentEmail}
                  onChange={(e) => updatePaymentInfo({ parentEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send your payment confirmation here
                </p>
              </div>
            </div>
          </div>
        )

      case 'amount':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Payment Amount</h2>
              <p className="text-muted-foreground text-sm">
                Enter the amount you want to pay
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={paymentInfo.amount || ''}
                    onChange={(e) => updatePaymentInfo({ amount: parseFloat(e.target.value) || 0 })}
                    className="pl-8 text-lg"
                  />
                </div>
              </div>
              {paymentInfo.amount > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Amount</span>
                    <span>${paymentInfo.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Processing Fee (3%)</span>
                    <span>${(paymentInfo.amount * 0.03).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>${(paymentInfo.amount + paymentInfo.amount * 0.03).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'payment':
        return (
          <StripePaymentForm
            amount={paymentInfo.amount}
            schoolId={paymentInfo.schoolId}
            studentName={paymentInfo.studentName}
            studentIdentifier={paymentInfo.studentIdentifier}
            parentEmail={paymentInfo.parentEmail}
            onSuccess={() => handlePaymentSuccess('stripe-payment')}
            onError={handlePaymentError}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="container pt-28 pb-12 max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {stepIndex + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              {renderStep()}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentStep !== 'payment' && (
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PayPageContent />
    </Suspense>
  )
}
