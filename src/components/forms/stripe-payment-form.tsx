'use client'

import React, { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getStripe } from '@/lib/stripe/client'

interface PaymentFormProps {
  clientSecret: string
  amount: number
  processingFee: number
  onSuccess: () => void
  onError: (error: string) => void
}

function PaymentForm({ clientSecret, amount, processingFee, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pay/confirmation`,
      },
    })

    if (result.error) {
      onError(result.error.message || 'Payment failed')
    } else {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement />
          
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Tuition Amount:</span>
              <span>${(amount - processingFee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Processing Fee (3%):</span>
              <span>${processingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Important:</strong> Make sure you can pay off this balance in full to maximize your rewards benefits.
        </AlertDescription>
      </Alert>

      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full" 
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

interface StripePaymentFormProps {
  amount: number
  schoolId: string
  studentName: string
  studentIdentifier?: string
  parentEmail: string
  onSuccess: () => void
  onError: (error: string) => void
}

export function StripePaymentForm({
  amount,
  schoolId,
  studentName,
  studentIdentifier,
  parentEmail,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [processingFee, setProcessingFee] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const stripePromise = getStripe()

  // Create payment intent on mount
  React.useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            schoolId,
            studentName,
            studentIdentifier,
            parentEmail,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }

        setClientSecret(data.clientSecret)
        setTotalAmount(data.totalAmount)
        setProcessingFee(data.processingFee)
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [amount, schoolId, studentName, studentIdentifier, parentEmail, onError])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Initializing payment...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!clientSecret || !stripePromise) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Failed to initialize payment. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <PaymentForm
        clientSecret={clientSecret}
        amount={totalAmount}
        processingFee={processingFee}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}