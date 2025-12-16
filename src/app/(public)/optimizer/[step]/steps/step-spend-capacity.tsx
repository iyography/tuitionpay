'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface StepSpendCapacityProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

const SPEND_RANGES = [
  { value: 500, label: 'Under $500/month' },
  { value: 1500, label: '$500 - $2,000/month' },
  { value: 3500, label: '$2,000 - $5,000/month' },
  { value: 7500, label: '$5,000 - $10,000/month' },
  { value: 15000, label: 'Over $10,000/month' },
]

export function StepSpendCapacity({ data, updateData, setCanProceed }: StepSpendCapacityProps) {
  const [selectedRange, setSelectedRange] = useState<number | null>(
    SPEND_RANGES.find(r => r.value === data.monthlySpendCapacity)?.value || null
  )

  useEffect(() => {
    setCanProceed(data.monthlySpendCapacity > 0)
  }, [data.monthlySpendCapacity, setCanProceed])

  const handleRangeSelect = (value: string) => {
    const numValue = parseInt(value, 10)
    setSelectedRange(numValue)
    updateData({ monthlySpendCapacity: numValue })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Many cards offer signup bonuses when you spend a certain amount in the first few months.
          What&apos;s your typical monthly spending on everyday purchases (groceries, gas, bills)?
        </p>
      </div>

      <RadioGroup
        value={selectedRange?.toString() || ''}
        onValueChange={handleRangeSelect}
        className="space-y-3"
      >
        {SPEND_RANGES.map((range) => (
          <div
            key={range.value}
            className={cn(
              'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors',
              selectedRange === range.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => handleRangeSelect(range.value.toString())}
          >
            <RadioGroupItem value={range.value.toString()} id={`spend-${range.value}`} />
            <Label htmlFor={`spend-${range.value}`} className="flex-1 cursor-pointer font-normal">
              {range.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Why does this matter?</strong> Your tuition payment counts toward signup bonus requirements!
          Combined with your normal spending, even large bonuses become achievable.
        </p>
      </div>
    </div>
  )
}
