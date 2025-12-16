'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Lock, CreditCard, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentFormProps {
  amount: number
  schoolName: string
  studentName: string
  onSubmit: (paymentData: PaymentData) => Promise<void>
  isProcessing: boolean
}

export interface PaymentData {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
}

export function PaymentForm({
  amount,
  schoolName,
  studentName,
  onSubmit,
  isProcessing,
}: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    const cardNumberClean = cardNumber.replace(/\s/g, '')
    if (cardNumberClean.length < 15) {
      setError('Please enter a valid card number')
      return
    }
    if (!expiryMonth || !expiryYear) {
      setError('Please enter the expiry date')
      return
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV')
      return
    }
    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name')
      return
    }

    try {
      await onSubmit({
        cardNumber: cardNumberClean,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName: cardholderName.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    }
  }

  // Processing fee calculation (2.9% + $0.30)
  const processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100
  const totalAmount = amount + processingFee

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">School</span>
            <span className="font-medium">{schoolName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Student</span>
            <span className="font-medium">{studentName}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tuition Amount</span>
            <span>${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee (2.9% + $0.30)</span>
            <span>${processingFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Secure Payment</CardTitle>
          </div>
          <CardDescription>
            Your payment information is encrypted and secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="pl-10"
                  disabled={isProcessing}
                />
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  maxLength={2}
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ''))}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year</Label>
                <Input
                  id="expiryYear"
                  placeholder="YY"
                  maxLength={2}
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ''))}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="Name as it appears on card"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </motion.div>
              ) : (
                `Pay $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Payments are processed securely through Helcim. We never store your card details.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
