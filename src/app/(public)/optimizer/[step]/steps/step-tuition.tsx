'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
          Enter the annual tuition amount or the total you plan to pay.
        </p>
      </div>

      {data.tuitionAmount > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg">
          <p className="text-sm">
            <span className="text-muted-foreground">Tuition amount: </span>
            <span className="font-semibold">
              ${data.tuitionAmount.toLocaleString()}
            </span>
          </p>
          <p className="text-sm mt-1">
            <span className="text-muted-foreground">Potential savings (10-12%): </span>
            <span className="font-semibold text-primary">
              ${Math.round(data.tuitionAmount * 0.1).toLocaleString()} - ${Math.round(data.tuitionAmount * 0.12).toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
