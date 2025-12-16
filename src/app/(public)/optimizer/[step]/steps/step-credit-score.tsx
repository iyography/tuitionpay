'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CREDIT_SCORE_RANGES, type CreditScoreRange } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface StepCreditScoreProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepCreditScore({ data, updateData, setCanProceed }: StepCreditScoreProps) {
  useEffect(() => {
    setCanProceed(!!data.creditScoreRange)
  }, [data.creditScoreRange, setCanProceed])

  const handleChange = (value: CreditScoreRange) => {
    updateData({ creditScoreRange: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          This helps us recommend cards you&apos;re likely to be approved for.
          Don&apos;t worry - this won&apos;t affect your credit score.
        </p>
      </div>

      <RadioGroup
        value={data.creditScoreRange}
        onValueChange={handleChange}
        className="space-y-3"
      >
        {(Object.entries(CREDIT_SCORE_RANGES) as [CreditScoreRange, typeof CREDIT_SCORE_RANGES[CreditScoreRange]][]).map(
          ([value, { label }]) => (
            <div
              key={value}
              className={cn(
                'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors',
                data.creditScoreRange === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => handleChange(value)}
            >
              <RadioGroupItem value={value} id={value} />
              <Label htmlFor={value} className="flex-1 cursor-pointer font-normal">
                {label}
              </Label>
            </div>
          )
        )}
      </RadioGroup>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Not sure of your score?</strong> You can check for free at Credit Karma,
          or through your bank&apos;s mobile app. Most banks now offer free credit score access.
        </p>
      </div>
    </div>
  )
}
