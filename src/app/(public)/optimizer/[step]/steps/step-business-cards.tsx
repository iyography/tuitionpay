'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { Briefcase, User, Lightbulb, CheckCircle2 } from 'lucide-react'

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
          You don&apos;t need a formal business to qualify!
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

      <Alert className="bg-amber-50 border-amber-200">
        <Lightbulb className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong className="block mb-2">Who qualifies for a business card?</strong>
          <p className="mb-2">
            You do NOT need an LLC, EIN, or formal business structure. If you have <em>any</em> of the following, you likely qualify:
          </p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Sell items online (eBay, Etsy, Amazon, Facebook Marketplace)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Do freelance or consulting work of any kind</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Rent out property, even just a room on Airbnb</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Drive for Uber, Lyft, DoorDash, or similar</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Have any side hustle, hobby business, or plan to start one</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Tutor, babysit, pet sit, or do odd jobs for income</span>
            </li>
          </ul>
          <p className="mt-3 text-sm">
            <strong>When applying:</strong> Use your own name as the business name (sole proprietorship),
            your Social Security Number, and your home address. Business income can be $0 if you&apos;re just starting out.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
