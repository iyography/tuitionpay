'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RECENT_CARD_OPTIONS, type RecentCardApplications } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { CreditCard } from 'lucide-react'

interface StepRecentApplicationsProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepRecentApplications({ data, updateData, setCanProceed }: StepRecentApplicationsProps) {
  useEffect(() => {
    setCanProceed(!!data.recentCardApplications)
  }, [data.recentCardApplications, setCanProceed])

  const handleChange = (value: RecentCardApplications) => {
    updateData({ recentCardApplications: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          How many credit cards have you applied for in the last 24 months?
          This helps us recommend cards you&apos;re most likely to be approved for.
        </p>
      </div>

      <RadioGroup
        value={data.recentCardApplications}
        onValueChange={handleChange}
        className="space-y-3"
      >
        {(Object.entries(RECENT_CARD_OPTIONS) as [RecentCardApplications, string][]).map(
          ([value, label]) => {
            return (
              <div
                key={value}
                className={cn(
                  'flex items-center space-x-4 border rounded-lg p-4 cursor-pointer transition-colors',
                  data.recentCardApplications === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => handleChange(value)}
              >
                <RadioGroupItem value={value} id={`recent-${value}`} />
                <div className="flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <Label htmlFor={`recent-${value}`} className="cursor-pointer font-medium flex-1">
                  {label}
                </Label>
              </div>
            )
          }
        )}
      </RadioGroup>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Why does this matter?</strong> Some issuers like Chase have restrictions
          (like the 5/24 rule) that limit approvals if you&apos;ve opened too many cards recently.
          Knowing your recent history helps us recommend cards you can actually get.
        </p>
      </div>
    </div>
  )
}
