'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RECENT_CARD_OPTIONS, AMEX_HISTORY_CARDS, type RecentCardApplications } from '@/types/assessment'
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

  const toggleAmexCard = (card: string) => {
    const current = data.amexHistoryCards || []

    // If selecting "None of the above", clear all others
    if (card === 'None of the above') {
      updateData({ amexHistoryCards: current.includes(card) ? [] : [card] })
      return
    }

    // If selecting a specific card, remove "None of the above"
    const filtered = current.filter(c => c !== 'None of the above')
    const updated = filtered.includes(card)
      ? filtered.filter(c => c !== card)
      : [...filtered, card]
    updateData({ amexHistoryCards: updated })
  }

  const showChaseWarning = data.recentCardApplications === '5+'

  return (
    <div className="space-y-8">
      {/* Recent Applications Section */}
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

      {/* AMEX History Section */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <h3 className="font-semibold text-lg mb-2">American Express History</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Have you ever had any of these AMEX cards? (Select all that apply)
            This helps us identify which signup bonuses you may still be eligible for.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {AMEX_HISTORY_CARDS.map((card) => {
            const isSelected = data.amexHistoryCards?.includes(card)
            const isNoneSelected = data.amexHistoryCards?.includes('None of the above')
            const isDisabled = card !== 'None of the above' && isNoneSelected

            return (
              <div
                key={card}
                className={cn(
                  'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isDisabled && toggleAmexCard(card)}
              >
                <Checkbox
                  id={`amex-${card}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => !isDisabled && toggleAmexCard(card)}
                />
                <Label
                  htmlFor={`amex-${card}`}
                  className={cn(
                    'flex-1 cursor-pointer font-normal',
                    isDisabled && 'cursor-not-allowed'
                  )}
                >
                  {card}
                </Label>
              </div>
            )
          })}
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Why does this matter?</strong> AMEX typically only offers signup bonuses to new cardholders.
            If you&apos;ve had certain AMEX cards before, you may not be eligible for their signup bonus again.
          </p>
        </div>
      </div>
    </div>
  )
}
