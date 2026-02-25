'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  CreditCard,
  Trophy,
  ChevronDown,
  ArrowRight,
  DollarSign,
  Gift,
  Percent,
  Calculator,
  ExternalLink,
  Layers,
  Sparkles,
  Users,
  AlertCircle,
  Mail,
  CheckCircle,
  Plane,
  Banknote,
  Star,
  TrendingUp,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAssessment } from '@/hooks/use-assessment'
import type { CardRecommendationResult } from '@/types/cards'
import { formatCurrency, generateSavingsExplanation, getRewardsDisplayType, getPartnerValuations, checkIsFlexiblePointsCard, type SplitStrategy, type EnhancedSavingsBreakdown } from '@/lib/matching/card-engine'

export default function ResultsPage() {
  const router = useRouter()
  const { data, isLoaded, getSessionId } = useAssessment()
  const [recommendations, setRecommendations] = useState<CardRecommendationResult[]>([])
  const [splitStrategy, setSplitStrategy] = useState<SplitStrategy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const result = await response.json()
      setRecommendations(result.recommendations)
      setSplitStrategy(result.splitStrategy)
      if (result.emailSent) {
        setEmailSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [data, getSessionId])

  useEffect(() => {
    if (isLoaded && !data.schoolId) {
      router.replace('/optimizer')
      return
    }

    if (isLoaded && data.schoolId) {
      fetchRecommendations()
    }
  }, [isLoaded, data, router, fetchRecommendations])

  const handleEmailResults = async () => {
    if (!data.parentEmail) return
    setEmailSending(true)
    try {
      await fetch('/api/recommendations/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          ...data,
        }),
      })
      setEmailSent(true)
    } catch {
      // Silently fail
    } finally {
      setEmailSending(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container pt-28 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container pt-28 pb-12">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/optimizer')}>
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  // Get top recommendation's savings for display
  const topRecommendation = recommendations[0]
  const topSavings = topRecommendation?.estimatedSavings || 0
  const topBreakdown = topRecommendation?.breakdown as EnhancedSavingsBreakdown | undefined

  return (
    <div className="container pt-28 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Personalized Recommendations</h1>
          <p className="text-muted-foreground">
            Based on your ${data.tuitionAmount.toLocaleString()} tuition at {data.schoolName}
          </p>
        </motion.div>

        {/* Business Cards Value Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Alert className="bg-green-50 border-green-200 border-l-4 border-l-green-500">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Pro Tip:</strong> Business credit cards typically offer the highest signup bonuses and best rewards rates. 
              You can apply using your name as the business name and your SSN - no business license required!
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-primary-foreground/80 text-sm mb-1">
                    Simple and Straightforward Option (1 Card)
                  </p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(topSavings)}
                  </p>
                </div>
                {splitStrategy && splitStrategy.totalSavings > topSavings && (
                  <div>
                    <p className="text-primary-foreground/80 text-sm mb-1">
                      Maximum Value (2 Cards)
                    </p>
                    <p className="text-4xl font-bold">
                      {formatCurrency(splitStrategy.totalSavings)}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-primary-foreground/70 mt-4 pt-4 border-t border-primary-foreground/20">
                *Values shown are net of the 3% payment processing fee. {topBreakdown?.isTravel ? 'Travel valuations are estimated based on typical redemption values.' : 'Actual savings may vary slightly based on specific card terms.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Results Button (M) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="mb-8"
        >
          {emailSent ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>Results have been sent to <strong>{data.parentEmail}</strong></span>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleEmailResults}
              disabled={emailSending || !data.parentEmail}
            >
              <Mail className="h-4 w-4" />
              {emailSending ? 'Sending...' : 'Email My Results'}
            </Button>
          )}
        </motion.div>

        {/* Pay in Full Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-8"
        >
          <Alert className="bg-red-50 border-red-200 border-l-4 border-l-red-500">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> These savings assume you pay off your credit card balance in full each month.
              Paying interest on a balance will significantly reduce or eliminate your rewards savings.
              Only charge what you can afford to pay off immediately.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Split Strategy Section - Maximum Value */}
        {splitStrategy && splitStrategy.totalSavings > (recommendations[0]?.estimatedSavings || 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">Maximum Value</CardTitle>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        2-Card Strategy
                      </Badge>
                    </div>
                    <CardDescription>
                      Split your payment across 2 cards for the highest rewards
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Split Summary */}
                <div className="p-4 bg-white/80 rounded-lg border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total First-Year Value</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(splitStrategy.totalSavings)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{splitStrategy.savingsPercentage}% return on card payments</p>
                      <p className="text-sm font-medium text-green-600">
                        +{formatCurrency(splitStrategy.totalSavings - (recommendations[0]?.estimatedSavings || 0))} more than single card
                      </p>
                    </div>
                  </div>
                  {splitStrategy.totalOnACH > 0 && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                      <Banknote className="h-4 w-4 text-blue-600" />
                      <span className="text-muted-foreground">
                        Pay remaining <strong className="text-foreground">{formatCurrency(splitStrategy.totalOnACH)}</strong> via ACH (no fee)
                      </span>
                    </div>
                  )}
                </div>

                {/* Cards in Strategy - Enhanced breakdown */}
                <div className="grid md:grid-cols-2 gap-4">
                  {splitStrategy.cards.map((cardInfo, idx) => {
                    const breakdown = cardInfo.breakdown as EnhancedSavingsBreakdown
                    const isTravel = breakdown.isTravel
                    return (
                      <div key={cardInfo.card.id} className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{cardInfo.card.card_name}</p>
                            <p className="text-sm text-muted-foreground">{cardInfo.card.issuer}</p>
                          </div>
                          <Badge variant="outline">Card {idx + 1}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pay on card:</span>
                            <span className="font-medium">{formatCurrency(breakdown.payOnCardWithFee)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Signup bonus:</span>
                            <span className="font-medium text-green-600">+{formatCurrency(breakdown.signupBonusValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rewards earned:</span>
                            <span className="font-medium text-green-600">+{formatCurrency(breakdown.rewardsEarned)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Processing fee (3%):</span>
                            <span className="font-medium text-red-600">-{formatCurrency(breakdown.processingFee)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Net {isTravel ? 'Travel Value' : 'Cash Back'}:</span>
                            <span className="text-primary">{formatCurrency(breakdown.netFirstYearValue)}</span>
                          </div>
                          {cardInfo.card.signup_bonus_requirement && (
                            <div className="pt-2 mt-1 border-t text-xs text-muted-foreground">
                              {cardInfo.card.signup_bonus_requirement} in {cardInfo.card.signup_bonus_timeframe || '3 months'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* How it works */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-4 w-4" />
                    How split payments work
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 p-4 bg-white/80 rounded-lg text-sm space-y-2">
                    <p><strong>1. Apply for both cards</strong> - Most approvals take just minutes.</p>
                    <p><strong>2. Split your tuition payment</strong> - Pay {formatCurrency(splitStrategy.cards[0]?.allocatedAmount || 0)} on Card 1, {formatCurrency(splitStrategy.cards[1]?.allocatedAmount || 0)} on Card 2.</p>
                    {splitStrategy.totalOnACH > 0 && (
                      <p><strong>3. Pay the rest via ACH</strong> - Send {formatCurrency(splitStrategy.totalOnACH)} directly to your school (no fee).</p>
                    )}
                    <p><strong>{splitStrategy.totalOnACH > 0 ? '4' : '3'}. Earn both signup bonuses</strong> - Each payment counts toward its card&apos;s bonus requirement.</p>
                    <p><strong>{splitStrategy.totalOnACH > 0 ? '5' : '4'}. Maximize your rewards</strong> - Get {formatCurrency(splitStrategy.totalSavings)} total in first-year value!</p>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex flex-col sm:flex-row gap-3">
                  {splitStrategy.cards.map((cardInfo, idx) => (
                    <Button
                      key={cardInfo.card.id}
                      variant={idx === 0 ? 'default' : 'outline'}
                      className="flex-1"
                      asChild
                    >
                      <a href={cardInfo.card.application_url || '#'} target="_blank" rel="noopener noreferrer">
                        Apply for {cardInfo.card.card_name.split(' ').slice(0, 2).join(' ')}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Single Card Recommendations - Simple & Straightforward */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              Simple & Straightforward (1 Card)
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Start here if you prefer simplicity. This single card will maximize your rewards with one easy payment.
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-6 mb-12">
          {recommendations.map((rec, index) => {
            const displayType = getRewardsDisplayType(rec.card)
            const partnerValuations = getPartnerValuations(rec.card)
            const isMilesOrPoints = displayType === 'airline_miles' || displayType === 'hotel_points'
            const isTravelPoints = displayType === 'travel_points'
            const breakdown = rec.breakdown as EnhancedSavingsBreakdown
            const isTravel = breakdown.isTravel

            return (
              <motion.div
                key={rec.card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className={index === 0 ? 'border-primary border-2 shadow-lg' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {index === 0 ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">#{rec.rank}</span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{rec.card.card_name}</CardTitle>
                          <CardDescription>{rec.card.issuer}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {index === 0 && (
                          <Badge className="bg-blue-600">Best Single Card</Badge>
                        )}
                        {rec.card.is_business_card && (
                          <Badge variant="outline">Business</Badge>
                        )}
                        {isTravel && (
                          <Badge variant="outline" className="gap-1 text-blue-700 border-blue-300">
                            <Plane className="h-3 w-3" />
                            Travel
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* New Fee Breakdown Display */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      {/* Pay on Card */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          Pay on card (includes fee):
                        </span>
                        <span className="font-semibold">{formatCurrency(breakdown.payOnCardWithFee)}</span>
                      </div>

                      {/* ACH if applicable */}
                      {breakdown.tuitionOnACH > 0 && (
                        <div className="flex justify-between items-center text-blue-700 bg-blue-50 p-2 rounded -mx-2">
                          <span className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Pay via ACH (no fee):
                          </span>
                          <span className="font-semibold">{formatCurrency(breakdown.tuitionOnACH)}</span>
                        </div>
                      )}

                      <div className="border-t pt-3 space-y-2">
                        {/* Signup Bonus */}
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Gift className="h-4 w-4" />
                            Signup bonus:
                          </span>
                          <span className="font-medium text-green-600">+{formatCurrency(breakdown.signupBonusValue)}</span>
                        </div>

                        {/* Rewards Earned */}
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Percent className="h-4 w-4" />
                            Rewards earned ({rec.card.rewards_rate || 1}%):
                          </span>
                          <span className="font-medium text-green-600">+{formatCurrency(breakdown.rewardsEarned)}</span>
                        </div>

                        {/* Processing Fee */}
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            Processing fee (3%):
                          </span>
                          <span className="font-medium text-red-600">-{formatCurrency(breakdown.processingFee)}</span>
                        </div>

                        {/* Annual Fee if applicable */}
                        {rec.card.annual_fee > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Annual fee:</span>
                            <span className={rec.card.first_year_waived ? 'text-muted-foreground' : 'font-medium text-red-600'}>
                              {rec.card.first_year_waived
                                ? `${formatCurrency(rec.card.annual_fee)} (waived Y1)`
                                : `-${formatCurrency(rec.card.annual_fee)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Net Value + Percentage */}
                      <div className="border-t pt-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Net {isTravel ? 'Travel Value' : 'Cash Back'}:</span>
                          <span className="text-xl font-bold text-primary">{formatCurrency(breakdown.netFirstYearValue)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">% {isTravel ? 'Travel Value' : 'Savings'}:</span>
                          <span className="font-semibold text-primary">{isTravel ? breakdown.fullTuitionPercentage : breakdown.savingsPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Redemption Values - Show for flexible cards AND travel/miles cards */}
                    {(() => {
                      const isFlexible = checkIsFlexiblePointsCard(rec.card.card_name.toLowerCase(), rec.card.issuer.toLowerCase())
                      const hasMultipleValues = partnerValuations.length > 1
                      const showValuations = (isMilesOrPoints || isTravelPoints || isFlexible) && partnerValuations.length > 0

                      if (!showValuations) return null

                      const cashOption = partnerValuations.find(v => v.partner === 'Cash Back')
                      const travelOptions = partnerValuations.filter(v => v.partner !== 'Cash Back')
                      const bestTravel = travelOptions[0]

                      return (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            {isFlexible && hasMultipleValues ? (
                              <>
                                <Sparkles className="h-4 w-4" />
                                How to Use Your Points
                              </>
                            ) : (
                              <>
                                <Plane className="h-4 w-4" />
                                Estimated Reward Values
                              </>
                            )}
                          </h4>

                          {/* Cash Back Option (baseline) */}
                          {cashOption && (
                            <div className="mb-3 p-3 bg-white rounded-lg border border-green-200">
                              <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-green-800 font-medium">
                                  <Banknote className="h-4 w-4" />
                                  Cash Back (Statement Credit)
                                </span>
                                <span className="font-bold text-green-700 text-lg">
                                  {formatCurrency(cashOption.value)}
                                </span>
                              </div>
                              {isFlexible && hasMultipleValues && (
                                <p className="text-xs text-green-600 mt-1">Simplest option - redeem as statement credit</p>
                              )}
                            </div>
                          )}

                          {/* Travel Transfer Options */}
                          {travelOptions.length > 0 && (
                            <div className="space-y-2">
                              {isFlexible && cashOption && (
                                <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">Or transfer to travel partners for more value:</p>
                              )}
                              {travelOptions.map((v) => (
                                <div key={v.partner} className="flex justify-between items-center text-sm p-2 bg-white/60 rounded">
                                  <span className="text-blue-800">
                                    <Plane className="h-3 w-3 inline mr-1.5" />
                                    {v.partner}
                                    {v.totalPoints && v.totalPoints > 0 && (
                                      <span className="text-blue-600 text-xs ml-1">({Math.round(v.totalPoints/1000)}k pts)</span>
                                    )}
                                  </span>
                                  <span className="font-semibold text-blue-900">
                                    {formatCurrency(v.value)}
                                    <span className="text-blue-600 text-xs ml-1">({v.centsPerPoint}c/pt)</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Best value callout for flexible cards */}
                          {isFlexible && bestTravel && cashOption && bestTravel.value > cashOption.value && (
                            <div className="mt-3 pt-2 border-t border-blue-200">
                              <p className="text-xs text-blue-800 font-medium">
                                Transferring to {bestTravel.partner} gives you {formatCurrency(bestTravel.value - cashOption.value)} more value than cash back!
                              </p>
                            </div>
                          )}

                          {/* Miles disclaimer */}
                          {isMilesOrPoints && !isFlexible && (
                            <p className="text-xs text-blue-700 mt-3 pt-2 border-t border-blue-200">
                              Note: These miles/points cannot be redeemed for cash. Values shown are estimated travel redemption values and may vary based on availability and booking.
                            </p>
                          )}
                        </div>
                      )
                    })()}

                    {/* Bonus Requirement */}
                    {rec.card.signup_bonus_requirement && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                        <span className="font-medium text-amber-900">To earn the bonus: </span>
                        <span className="text-amber-800">
                          {rec.card.signup_bonus_requirement} in {rec.card.signup_bonus_timeframe || 'the first 3 months'}
                        </span>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1" variant={index === 0 ? 'default' : 'outline'} asChild>
                        <a href={rec.card.application_url || '#'} target="_blank" rel="noopener noreferrer">
                          Learn More About This Card
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Apply for your chosen card</p>
                  <p className="text-sm text-muted-foreground">
                    Click the button above to apply. Most approvals take just minutes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Wait for your card to arrive</p>
                  <p className="text-sm text-muted-foreground">
                    Most cards arrive within 7-10 business days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Return to pay your tuition</p>
                  <p className="text-sm text-muted-foreground">
                    Come back to TuitionPay and use your new card to pay. Your tuition counts toward your signup bonus!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium text-red-700">Pay off your balance in full</p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Critical:</strong> Pay your credit card bill in full before interest charges. Carrying a balance will reduce or eliminate your savings.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto gap-2">
                  <Link href="/pay">
                    Ready to Pay Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Parents Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Alert className="bg-blue-50 border-blue-200">
            <Users className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Two Parents?</strong> Each parent can fill out this survey separately to see which parent has access to the best credit card sign up offers! Have them visit{' '}
              <Link href="/optimizer" className="underline font-medium">
                TuitionPay.ai/optimizer
              </Link>{' '}
              to get their personalized recommendations.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Important Warnings (L - removed last tip) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 space-y-2">
              <p><strong>Important Application Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Apply for cards before making your tuition payment to ensure approval</li>
                <li>If applying for business cards: use your legal name as business name, your SSN, and home address</li>
                <li>Wait until you receive your physical card before making the tuition payment</li>
                <li>Pay off your balance in full to avoid interest charges that would reduce your savings</li>
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  )
}
