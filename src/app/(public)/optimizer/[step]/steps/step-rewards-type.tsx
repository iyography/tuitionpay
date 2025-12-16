'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { REWARDS_PREFERENCES, type RewardsPreference } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { Banknote, Plane, CreditCard, Shuffle } from 'lucide-react'

interface StepRewardsTypeProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

const REWARD_ICONS = {
  cash_back: Banknote,
  travel_points: Plane,
  statement_credits: CreditCard,
  flexible: Shuffle,
}

const REWARD_DESCRIPTIONS = {
  cash_back: 'Get money back on purchases, deposited to your account',
  travel_points: 'Earn points/miles redeemable for flights, hotels, and travel',
  statement_credits: 'Reduce your card balance with automatic credits',
  flexible: 'Show me all options - I want to compare everything',
}

export function StepRewardsType({ data, updateData, setCanProceed }: StepRewardsTypeProps) {
  useEffect(() => {
    setCanProceed(!!data.preferredRewardsType)
  }, [data.preferredRewardsType, setCanProceed])

  const handleChange = (value: RewardsPreference) => {
    updateData({ preferredRewardsType: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          What type of rewards would you prefer to earn on your tuition payment?
        </p>
      </div>

      <RadioGroup
        value={data.preferredRewardsType}
        onValueChange={handleChange}
        className="space-y-3"
      >
        {(Object.entries(REWARDS_PREFERENCES) as [RewardsPreference, string][]).map(
          ([value, label]) => {
            const Icon = REWARD_ICONS[value]
            const description = REWARD_DESCRIPTIONS[value]
            return (
              <div
                key={value}
                className={cn(
                  'flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-colors',
                  data.preferredRewardsType === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => handleChange(value)}
              >
                <RadioGroupItem value={value} id={value} className="mt-1" />
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={value} className="cursor-pointer font-medium block">
                    {label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            )
          }
        )}
      </RadioGroup>
    </div>
  )
}
