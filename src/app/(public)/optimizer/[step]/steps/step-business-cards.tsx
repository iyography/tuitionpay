'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { Briefcase, User } from 'lucide-react'

interface StepBusinessCardsProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepBusinessCards({ data, updateData, setCanProceed }: StepBusinessCardsProps) {
  useEffect(() => {
    // Default to false if not set, then proceed
    setCanProceed(true)
  }, [setCanProceed])

  const handleChange = (value: string) => {
    updateData({ openToBusinessCards: value === 'yes' })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Business credit cards often have the best signup bonuses and rewards.
          You don&apos;t need a formal business - freelancers, side hustlers, and even eBay sellers qualify.
        </p>
      </div>

      <RadioGroup
        value={data.openToBusinessCards ? 'yes' : 'no'}
        onValueChange={handleChange}
        className="space-y-3"
      >
        <div
          className={cn(
            'flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-colors',
            data.openToBusinessCards
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => handleChange('yes')}
        >
          <RadioGroupItem value="yes" id="business-yes" className="mt-1" />
          <div className="flex-shrink-0">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <Label htmlFor="business-yes" className="cursor-pointer font-medium block">
              Yes, include business cards
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              I have a business, side income, freelance work, or sell items online
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-colors',
            !data.openToBusinessCards
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => handleChange('no')}
        >
          <RadioGroupItem value="no" id="business-no" className="mt-1" />
          <div className="flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <Label htmlFor="business-no" className="cursor-pointer font-medium block">
              No, personal cards only
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              I prefer to stick with personal credit cards
            </p>
          </div>
        </div>
      </RadioGroup>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Did you know?</strong> Many people qualify for business cards without realizing it.
          If you&apos;ve ever sold items online, done freelance work, or have any side income, you likely qualify.
        </p>
      </div>
    </div>
  )
}
