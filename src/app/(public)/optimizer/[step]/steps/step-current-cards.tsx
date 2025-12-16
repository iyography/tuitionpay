'use client'

import { useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MAJOR_CARD_ISSUERS } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'

interface StepCurrentCardsProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepCurrentCards({ data, updateData, setCanProceed }: StepCurrentCardsProps) {
  useEffect(() => {
    // This step is always valid (can have 0 cards)
    setCanProceed(true)
  }, [setCanProceed])

  const toggleIssuer = (issuer: string) => {
    const current = data.currentCards || []
    const updated = current.includes(issuer)
      ? current.filter(c => c !== issuer)
      : [...current, issuer]
    updateData({ currentCards: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Select the credit card issuers you already have cards from.
          This helps us avoid recommending cards you can&apos;t get due to issuer limits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MAJOR_CARD_ISSUERS.map((issuer) => {
          const isSelected = data.currentCards?.includes(issuer)
          return (
            <div
              key={issuer}
              className={cn(
                'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => toggleIssuer(issuer)}
            >
              <Checkbox
                id={issuer}
                checked={isSelected}
                onCheckedChange={() => toggleIssuer(issuer)}
              />
              <Label htmlFor={issuer} className="flex-1 cursor-pointer font-normal">
                {issuer}
              </Label>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Don&apos;t have any credit cards?</strong> No problem!
          Just continue without selecting any. We&apos;ll recommend great starter cards.
        </p>
      </div>

      {data.currentCards && data.currentCards.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Selected: {data.currentCards.join(', ')}
        </p>
      )}
    </div>
  )
}
