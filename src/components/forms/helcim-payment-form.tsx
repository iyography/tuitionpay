'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface HelcimPaymentFormProps {
  amount: number
  schoolId: string
  schoolName: string
  studentName: string
  studentIdentifier?: string
  parentEmail: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    appendHelcimPayIframe?: (config: HelcimPayConfig) => void
    removeHelcimPayIframe?: () => void
  }
}

interface HelcimPayConfig {
  checkoutToken: string
  secretToken: string
  amount: number
  currency: string
  amountHide?: boolean
  customerCodeHide?: boolean
  invoiceNumberHide?: boolean
  customerCode?: string
  invoiceNumber?: string
  targetElement?: string
}

export function HelcimPaymentForm({
  amount,
  schoolId,
  schoolName,
  studentName,
  studentIdentifier,
  parentEmail,
  onSuccess,
  onError,
}: HelcimPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutInitialized, setCheckoutInitialized] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  // Processing fee calculation (2.9% + $0.30)
  const processingFee = Math.round((amount * 0.029 + 0.30) * 100) / 100
  const totalAmount = amount + processingFee

  // Handle message from HelcimPay.js iframe
  const handleHelcimMessage = useCallback(async (event: MessageEvent) => {
    // Verify origin is from Helcim
    if (!event.origin.includes('helcim.com') && !event.origin.includes('myhelcim.com')) {
      return
    }

    const eventData = event.data

    if (eventData.eventName === 'helcimPayJsPaymentSuccess') {
      setIsProcessing(true)
      try {
        // Complete the payment on our backend
        const response = await fetch('/api/checkout/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            transactionId: eventData.data?.transactionId,
            hash: eventData.data?.hash,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to complete payment')
        }

        const result = await response.json()
        onSuccess(result.transactionId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment completion failed')
        onError(err instanceof Error ? err.message : 'Payment completion failed')
      } finally {
        setIsProcessing(false)
      }
    } else if (eventData.eventName === 'helcimPayJsPaymentError') {
      setError(eventData.data?.message || 'Payment failed')
      setIsProcessing(false)
    } else if (eventData.eventName === 'helcimPayJsPaymentCancel') {
      setError('Payment was cancelled')
      setIsProcessing(false)
    }
  }, [paymentId, onSuccess, onError])

  // Initialize HelcimPay.js
  useEffect(() => {
    let mounted = true

    const initializeCheckout = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get checkout token from our API
        const response = await fetch('/api/checkout/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolId,
            studentName,
            studentIdentifier,
            parentEmail,
            amount,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to initialize checkout')
        }

        const data = await response.json()

        if (!mounted) return

        setPaymentId(data.paymentId)

        // Load HelcimPay.js script if not already loaded
        if (!document.getElementById('helcim-pay-js')) {
          const script = document.createElement('script')
          script.id = 'helcim-pay-js'
          script.src = 'https://myhelcim.com/js/version2/helcimPayCustom.js'
          script.async = true
          document.body.appendChild(script)

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load HelcimPay.js'))
          })
        }

        // Wait for the library to be available
        await new Promise<void>((resolve) => {
          const checkLibrary = () => {
            if (window.appendHelcimPayIframe) {
              resolve()
            } else {
              setTimeout(checkLibrary, 100)
            }
          }
          checkLibrary()
        })

        if (!mounted) return

        // Initialize the payment form
        window.appendHelcimPayIframe?.({
          checkoutToken: data.checkoutToken,
          secretToken: data.secretToken,
          amount: totalAmount,
          currency: 'USD',
          amountHide: true,
          customerCodeHide: true,
          invoiceNumberHide: true,
          targetElement: 'helcim-pay-container',
        })

        setCheckoutInitialized(true)
        setIsLoading(false)
      } catch (err) {
        if (!mounted) return
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment'
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    initializeCheckout()

    // Add message listener for HelcimPay.js events
    window.addEventListener('message', handleHelcimMessage)

    return () => {
      mounted = false
      window.removeEventListener('message', handleHelcimMessage)
      window.removeHelcimPayIframe?.()
    }
  }, [schoolId, studentName, studentIdentifier, parentEmail, amount, totalAmount, handleHelcimMessage])

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
            Your payment information is encrypted and processed securely by Helcim
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Initializing secure payment...</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium">Processing payment...</p>
                <p className="text-sm text-muted-foreground">Please do not close this window</p>
              </motion.div>
            </div>
          )}

          {/* HelcimPay.js iframe container */}
          <div
            id="helcim-pay-container"
            className={`min-h-[400px] ${isLoading || isProcessing ? 'hidden' : ''}`}
          />

          {checkoutInitialized && !isLoading && !isProcessing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Secure payment powered by Helcim</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
