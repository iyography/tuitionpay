'use client'

import { useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { REWARDS_PREFERENCES, AIRLINE_PARTNERS, HOTEL_PARTNERS, type RewardsPreference } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { Banknote, Plane, CreditCard, Shuffle, Building2 } from 'lucide-react'

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
  const showTravelPreferences = data.preferredRewardsType === 'travel_points' || data.preferredRewardsType === 'flexible'

  useEffect(() => {
    setCanProceed(!!data.preferredRewardsType)
  }, [data.preferredRewardsType, setCanProceed])

  const handleChange = (value: RewardsPreference) => {
    updateData({
      preferredRewardsType: value,
      // Clear travel preferences if not travel/flexible
      ...(value !== 'travel_points' && value !== 'flexible' ? { preferredAirlines: [], preferredHotels: [] } : {})
    })
  }

  const toggleAirline = (airline: string) => {
    const current = data.preferredAirlines || []
    const updated = current.includes(airline)
      ? current.filter(a => a !== airline)
      : [...current, airline]
    updateData({ preferredAirlines: updated })
  }

  const toggleHotel = (hotel: string) => {
    const current = data.preferredHotels || []
    const updated = current.includes(hotel)
      ? current.filter(h => h !== hotel)
      : [...current, hotel]
    updateData({ preferredHotels: updated })
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

      {/* Travel Partner Preferences */}
      {showTravelPreferences && (
        <div className="space-y-6 pt-4 border-t">
          <h3 className="font-medium text-lg">Travel Partner Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred airlines and hotels to help us find the best travel rewards cards for you.
          </p>

          {/* Airline Preferences */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Preferred Airlines
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AIRLINE_PARTNERS.map((airline) => {
                const isSelected = data.preferredAirlines?.includes(airline)
                return (
                  <div
                    key={airline}
                    className={cn(
                      'flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => toggleAirline(airline)}
                  >
                    <Checkbox
                      id={`airline-${airline}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleAirline(airline)}
                    />
                    <Label htmlFor={`airline-${airline}`} className="flex-1 cursor-pointer font-normal text-sm">
                      {airline}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hotel Preferences */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Preferred Hotels
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HOTEL_PARTNERS.map((hotel) => {
                const isSelected = data.preferredHotels?.includes(hotel)
                return (
                  <div
                    key={hotel}
                    className={cn(
                      'flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => toggleHotel(hotel)}
                  >
                    <Checkbox
                      id={`hotel-${hotel}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleHotel(hotel)}
                    />
                    <Label htmlFor={`hotel-${hotel}`} className="flex-1 cursor-pointer font-normal text-sm">
                      {hotel}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
