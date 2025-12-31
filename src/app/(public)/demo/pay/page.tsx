'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  School,
  User,
  DollarSign,
  CreditCard,
  CheckCircle2,
  Shield,
  Lock,
  Sparkles,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_SCHOOLS = [
  { id: 'demo-1', name: 'Demo Catholic School', city: 'Chicago', state: 'IL' },
  { id: 'demo-2', name: 'Demo Christian Academy', city: 'Dallas', state: 'TX' },
  { id: 'demo-3', name: 'Demo Montessori School', city: 'Los Angeles', state: 'CA' },
]

const TOTAL_STEPS = 4

export default function DemoPayPage() {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    schoolId: '',
    schoolName: '',
    studentName: '',
    studentId: '',
    parentEmail: '',
    parentName: '',
    amount: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  })

  const progress = (step / TOTAL_STEPS) * 100

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const selectSchool = (school: typeof DEMO_SCHOOLS[0]) => {
    updateForm({ schoolId: school.id, schoolName: school.name })
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.schoolId
      case 2: return !!formData.studentName && !!formData.parentEmail && !!formData.parentName
      case 3: return !!formData.amount && parseInt(formData.amount) > 0 &&
                     !!formData.cardNumber && !!formData.cardExpiry && !!formData.cardCvc && !!formData.cardName
      default: return true
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else if (step === 3) {
      // Process demo payment
      setIsProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsProcessing(false)
      setStep(4)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const processingFee = formData.amount ? (parseFloat(formData.amount) * 0.029 + 0.30).toFixed(2) : '0.00'
  const totalAmount = formData.amount ? (parseFloat(formData.amount) + parseFloat(processingFee)).toFixed(2) : '0.00'

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <School className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Select Your School</h2>
              <p className="text-muted-foreground">Choose a demo school to continue</p>
            </div>
            <div className="space-y-3">
              {DEMO_SCHOOLS.map((school) => (
                <div
                  key={school.id}
                  className={cn(
                    'border rounded-lg p-4 cursor-pointer transition-all',
                    formData.schoolId === school.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'hover:border-emerald-300'
                  )}
                  onClick={() => selectSchool(school)}
                >
                  <p className="font-medium">{school.name}</p>
                  <p className="text-sm text-muted-foreground">{school.city}, {school.state}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Student & Parent Information</h2>
              <p className="text-muted-foreground">Enter demo details to continue</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="e.g., John Smith Jr."
                  value={formData.studentName}
                  onChange={(e) => updateForm({ studentName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="studentId">Student ID (Optional)</Label>
                <Input
                  id="studentId"
                  placeholder="e.g., STU-12345"
                  value={formData.studentId}
                  onChange={(e) => updateForm({ studentId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input
                  id="parentName"
                  placeholder="e.g., John Smith"
                  value={formData.parentName}
                  onChange={(e) => updateForm({ parentName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="e.g., parent@email.com"
                  value={formData.parentEmail}
                  onChange={(e) => updateForm({ parentEmail: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Payment Details</h2>
              <p className="text-muted-foreground">Enter demo payment information</p>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Payment Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 5000"
                value={formData.amount}
                onChange={(e) => updateForm({ amount: e.target.value })}
                className="text-2xl h-14"
              />
            </div>

            {/* Fee Breakdown */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuition Amount:</span>
                  <span className="font-medium">${parseFloat(formData.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee (2.9% + $0.30):</span>
                  <span className="font-medium">${processingFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-emerald-600">${parseFloat(totalAmount).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Card Details */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Lock className="h-4 w-4" />
                <span>Demo mode - no real charges will be made</span>
              </div>

              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="John Smith"
                  value={formData.cardName}
                  onChange={(e) => updateForm({ cardName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={(e) => updateForm({ cardNumber: formatCardNumber(e.target.value) })}
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">Expiry Date</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={(e) => updateForm({ cardExpiry: formatExpiry(e.target.value) })}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input
                    id="cardCvc"
                    placeholder="123"
                    value={formData.cardCvc}
                    onChange={(e) => updateForm({ cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>256-bit SSL encryption</span>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 mx-auto"
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground">
                Demo payment of <span className="font-semibold text-foreground">${parseFloat(totalAmount).toLocaleString()}</span> processed
              </p>
            </div>

            {/* Receipt Summary */}
            <Card className="text-left">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Payment Receipt (Demo)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School:</span>
                  <span className="font-medium">{formData.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{formData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parent:</span>
                  <span className="font-medium">{formData.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuition:</span>
                  <span className="font-medium">${parseFloat(formData.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee:</span>
                  <span className="font-medium">${processingFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Charged:</span>
                  <span className="text-emerald-600">${parseFloat(totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card:</span>
                  <span className="font-medium">**** {formData.cardNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium font-mono text-xs">DEMO-{Date.now()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Callout */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-6">
                <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Maximize Your Rewards!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  With the right credit card, you could have earned up to <span className="font-semibold text-amber-600">${Math.round(parseFloat(formData.amount) * 0.15).toLocaleString()}</span> in rewards on this payment!
                </p>
                <Button asChild className="gap-2">
                  <Link href="/demo/optimizer">
                    Find Your Best Card
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Back to Demo */}
            <Button variant="outline" asChild className="w-full">
              <Link href="/demo">
                Back to Demo Home
              </Link>
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container pt-28 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Demo Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
            <Lock className="h-4 w-4" />
            Demo Mode - No Real Charges
          </span>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {TOTAL_STEPS - 1}</span>
              <span>{Math.round((step / (TOTAL_STEPS - 1)) * 100)}% complete</span>
            </div>
            <Progress value={(step / (TOTAL_STEPS - 1)) * 100} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-8">
                {renderStep()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isProcessing}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </>
              ) : step === 3 ? (
                <>
                  Pay ${totalAmount}
                  <CreditCard className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
