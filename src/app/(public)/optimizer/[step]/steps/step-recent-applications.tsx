'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RECENT_CARD_OPTIONS, type RecentCardApplications } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { CreditCard, AlertTriangle } from 'lucide-react'

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

  const showChaseWarning = data.recentCardApplications === '5+'

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Personal Credit Card Applications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            How many <strong>personal</strong> credit cards have you applied for in the last 24 months?
            (Do not include business cards in this count)
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

        {showChaseWarning && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Chase has a &quot;5/24 rule&quot; - if you&apos;ve opened 5+ personal cards in the last 24 months,
                you likely won&apos;t be approved for Chase cards. We&apos;ll exclude Chase from your recommendations.
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Why does this matter?</strong> Some issuers like Chase have restrictions
            (like the 5/24 rule) that limit approvals if you&apos;ve opened too many personal cards recently.
          </p>
        </div>
      </div>
    </div>
  )
}
