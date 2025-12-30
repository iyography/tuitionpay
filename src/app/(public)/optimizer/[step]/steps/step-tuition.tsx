'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DollarSign, TrendingUp } from 'lucide-react'
import type { AssessmentData } from '@/types/assessment'

interface StepTuitionProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepTuition({ data, updateData, setCanProceed }: StepTuitionProps) {
  const [displayValue, setDisplayValue] = useState(
    data.tuitionAmount ? data.tuitionAmount.toLocaleString() : ''
  )

  useEffect(() => {
    setCanProceed(data.tuitionAmount >= 100)
  }, [data.tuitionAmount, setCanProceed])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal point
    const rawValue = e.target.value.replace(/[^0-9.]/g, '')
    setDisplayValue(rawValue)

    const numericValue = parseFloat(rawValue) || 0
    updateData({ tuitionAmount: numericValue })
  }

  const handleBlur = () => {
    // Format display value on blur
    if (data.tuitionAmount) {
      setDisplayValue(data.tuitionAmount.toLocaleString())
    }
  }

  const handleFocus = () => {
    // Remove formatting on focus
    setDisplayValue(data.tuitionAmount.toString())
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Bigger payments = Bigger rewards!</strong> Credit card signup bonuses are maximized when you make large, one-time payments like tuition. Paying in full (or as much as possible at once) helps you hit bonus requirements faster.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="tuition">Total Tuition Amount You&apos;re Paying *</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="tuition"
            type="text"
            inputMode="numeric"
            placeholder="25,000"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className="h-12 pl-8 text-lg"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the full amount you plan to pay with your credit card. The larger the payment, the more rewards you can earn.
        </p>
      </div>

      {data.tuitionAmount > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <p className="text-sm">
              <span className="text-muted-foreground">Payment amount: </span>
              <span className="font-semibold">
                ${data.tuitionAmount.toLocaleString()}
              </span>
            </p>
          </div>
          <p className="text-sm">
            <span className="text-muted-foreground">Potential savings (10-12%): </span>
            <span className="font-semibold text-primary">
              ${Math.round(data.tuitionAmount * 0.1).toLocaleString()} - ${Math.round(data.tuitionAmount * 0.12).toLocaleString()}
            </span>
          </p>
          {data.tuitionAmount >= 5000 && (
            <p className="text-xs text-green-600 font-medium mt-1">
              Great! With ${data.tuitionAmount.toLocaleString()}, you can likely meet most signup bonus requirements.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
