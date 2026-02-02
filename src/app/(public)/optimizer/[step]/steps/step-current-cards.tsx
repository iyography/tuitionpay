'use client'

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { MAJOR_CARD_ISSUERS } from '@/types/assessment'
import type { AssessmentData } from '@/types/assessment'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface StepCurrentCardsProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

// Cards available per issuer (these should match the database)
const CARDS_BY_ISSUER: Record<string, string[]> = {
  'Chase': [
    'Chase Sapphire Preferred',
    'Chase Sapphire Reserve',
    'Chase Freedom Unlimited',
    'Chase Freedom Flex',
    'Chase Ink Business Preferred',
    'Chase Ink Business Cash',
    'Chase Ink Business Unlimited',
    'United Quest Card',
    'United Explorer Card',
    'Southwest Rapid Rewards Priority',
    'Southwest Rapid Rewards Plus',
    'IHG One Rewards Premier',
    'World of Hyatt Credit Card',
    'Marriott Bonvoy Boundless',
  ],
  'American Express': [
    'AMEX Platinum Card',
    'AMEX Gold Card',
    'AMEX Green Card',
    'AMEX Blue Cash Preferred',
    'AMEX Blue Cash Everyday',
    'AMEX Business Platinum',
    'AMEX Business Gold',
    'AMEX Delta SkyMiles Gold',
    'AMEX Delta SkyMiles Platinum',
    'AMEX Delta SkyMiles Reserve',
    'AMEX Hilton Honors',
    'AMEX Hilton Honors Surpass',
    'AMEX Marriott Bonvoy Brilliant',
  ],
  'Capital One': [
    'Capital One Venture X',
    'Capital One Venture',
    'Capital One VentureOne',
    'Capital One Savor',
    'Capital One SavorOne',
    'Capital One Quicksilver',
    'Capital One Spark Cash Plus',
    'Capital One Spark Miles',
  ],
  'Citi': [
    'Citi Premier',
    'Citi Strata Premier',
    'Citi Double Cash',
    'Citi Custom Cash',
    'Citi AAdvantage Platinum Select',
    'Citi AAdvantage Executive',
    'Costco Anywhere Visa',
  ],
  'Wells Fargo': [
    'Wells Fargo Signify Business Cash',
    'Wells Fargo Autograph Journey',
    'Wells Fargo Active Cash',
    'Wells Fargo Autograph',
  ],
  'US Bank': [
    'US Bank Triple Cash Rewards Visa',
    'US Bank Altitude Reserve',
    'US Bank Altitude Go',
  ],
}

export function StepCurrentCards({ data, updateData, setCanProceed }: StepCurrentCardsProps) {
  const [expandedIssuers, setExpandedIssuers] = useState<string[]>([])

  useEffect(() => {
    // This step is always valid (can have 0 cards)
    setCanProceed(true)
  }, [setCanProceed])

  const toggleIssuerExpansion = (issuer: string) => {
    setExpandedIssuers(prev =>
      prev.includes(issuer)
        ? prev.filter(i => i !== issuer)
        : [...prev, issuer]
    )
  }

  const toggleCard = (cardName: string) => {
    const current = data.currentCards || []
    const updated = current.includes(cardName)
      ? current.filter(c => c !== cardName)
      : [...current, cardName]
    updateData({ currentCards: updated })
  }

  const getSelectedCardsForIssuer = (issuer: string) => {
    const issuerCards = CARDS_BY_ISSUER[issuer] || []
    return (data.currentCards || []).filter(card => issuerCards.includes(card))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Select the credit cards you currently have. Click on an issuer to see their cards,
          then check the specific cards you own. Cards you already have will be excluded from
          recommendations (since you can&apos;t get the signup bonus again).
        </p>
      </div>

      <div className="space-y-3">
        {MAJOR_CARD_ISSUERS.map((issuer) => {
          const isExpanded = expandedIssuers.includes(issuer)
          const selectedCards = getSelectedCardsForIssuer(issuer)
          const hasSelectedCards = selectedCards.length > 0

          return (
            <div key={issuer} className="border rounded-lg overflow-hidden">
              {/* Issuer Header */}
              <div
                className={cn(
                  'flex items-center justify-between p-4 cursor-pointer transition-colors',
                  hasSelectedCards ? 'bg-primary/5' : 'hover:bg-muted/50'
                )}
                onClick={() => toggleIssuerExpansion(issuer)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{issuer}</span>
                  {hasSelectedCards && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {selectedCards.length} selected
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Card List (Expanded) */}
              {isExpanded && (
                <div className="border-t bg-muted/30 p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {CARDS_BY_ISSUER[issuer]?.map((cardName) => {
                      const isSelected = data.currentCards?.includes(cardName)
                      return (
                        <div
                          key={cardName}
                          className={cn(
                            'flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors bg-white',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                          onClick={() => toggleCard(cardName)}
                        >
                          <Checkbox
                            id={cardName}
                            checked={isSelected}
                            onCheckedChange={() => toggleCard(cardName)}
                          />
                          <Label htmlFor={cardName} className="flex-1 cursor-pointer font-normal text-sm">
                            {cardName}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Don&apos;t have any credit cards?</strong> No problem!
          Just continue without selecting any. We&apos;ll recommend great cards for you.
        </p>
      </div>

      {data.currentCards && data.currentCards.length > 0 && (
        <div className="p-4 bg-primary/5 rounded-lg">
          <p className="text-sm font-medium mb-2">Cards you have ({data.currentCards.length}):</p>
          <div className="flex flex-wrap gap-2">
            {data.currentCards.map(card => (
              <span key={card} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {card}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
