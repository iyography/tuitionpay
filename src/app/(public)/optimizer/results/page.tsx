'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAssessment } from '@/hooks/use-assessment'
import type { CardRecommendationResult } from '@/types/cards'
import { formatCurrency, generateSavingsExplanation, type SplitStrategy } from '@/lib/matching/card-engine'

export default function ResultsPage() {
  const router = useRouter()
  const { data, isLoaded, getSessionId } = useAssessment()
  const [recommendations, setRecommendations] = useState<CardRecommendationResult[]>([])
  const [splitStrategy, setSplitStrategy] = useState<SplitStrategy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !data.schoolId) {
      // No assessment data, redirect to start
      router.replace('/optimizer')
      return
    }

    if (isLoaded && data.schoolId) {
      fetchRecommendations()
    }
  }, [isLoaded, data, router])

  const fetchRecommendations = async () => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
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

  const totalPotentialSavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedSavings,
    0
  ) / recommendations.length

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

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-primary-foreground/80 text-sm">Estimated First-Year Savings</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(totalPotentialSavings)}
                  </p>
                </div>
                <div className="text-sm text-primary-foreground/80">
                  <p>That&apos;s {Math.round((totalPotentialSavings / data.tuitionAmount) * 100)}% back on tuition</p>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Split Strategy Section */}
        {splitStrategy && splitStrategy.totalSavings > (recommendations[0]?.estimatedSavings || 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">Split Payment Strategy</CardTitle>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Maximum Savings
                      </Badge>
                    </div>
                    <CardDescription>
                      Split your ${data.tuitionAmount.toLocaleString()} tuition across 2 cards for bigger rewards
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Split Summary */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Combined First-Year Savings</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(splitStrategy.totalSavings)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">That&apos;s {splitStrategy.savingsPercentage}% back!</p>
                      <p className="text-sm font-medium text-green-600">
                        +{formatCurrency(splitStrategy.totalSavings - (recommendations[0]?.estimatedSavings || 0))} more than single card
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cards in Strategy */}
                <div className="grid md:grid-cols-2 gap-4">
                  {splitStrategy.cards.map((cardInfo, idx) => (
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
                          <span className="text-muted-foreground">Pay on this card:</span>
                          <span className="font-medium">{formatCurrency(cardInfo.allocatedAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Signup bonus:</span>
                          <span className="font-medium text-green-600">+{formatCurrency(cardInfo.breakdown.signupBonusValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rewards earned:</span>
                          <span className="font-medium">+{formatCurrency(cardInfo.breakdown.rewardsEarned)}</span>
                        </div>
                        {cardInfo.card.signup_bonus_requirement && (
                          <div className="pt-2 mt-2 border-t text-xs text-muted-foreground">
                            Bonus requirement: {cardInfo.card.signup_bonus_requirement}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* How it works */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-4 w-4" />
                    How split payments work
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 p-4 bg-muted rounded-lg text-sm space-y-2">
                    <p><strong>1. Apply for both cards</strong> - Most approvals take just minutes.</p>
                    <p><strong>2. Split your tuition payment</strong> - Pay {formatCurrency(splitStrategy.cards[0]?.allocatedAmount || 0)} on Card 1, {formatCurrency(splitStrategy.cards[1]?.allocatedAmount || 0)} on Card 2.</p>
                    <p><strong>3. Earn both signup bonuses</strong> - Each payment counts toward its card&apos;s bonus requirement.</p>
                    <p><strong>4. Maximize your rewards</strong> - Get {formatCurrency(splitStrategy.totalSavings)} total in first-year value!</p>
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

        {/* Single Card Recommendations */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {splitStrategy && splitStrategy.totalSavings > (recommendations[0]?.estimatedSavings || 0)
              ? 'Or Choose a Single Card'
              : 'Top Card Recommendations'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {splitStrategy && splitStrategy.totalSavings > (recommendations[0]?.estimatedSavings || 0)
              ? 'If you prefer using just one card, here are your best options:'
              : 'Based on your profile, these cards will maximize your rewards:'}
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-6 mb-12">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className={index === 0 ? 'border-primary shadow-lg' : ''}>
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
                    {index === 0 && (
                      <Badge className="bg-primary">Best Match</Badge>
                    )}
                    {rec.card.is_business_card && (
                      <Badge variant="outline">Business</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Gift className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{formatCurrency(rec.breakdown.signupBonusValue)}</p>
                      <p className="text-xs text-muted-foreground">Signup Bonus</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Percent className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{rec.card.rewards_rate}%</p>
                      <p className="text-xs text-muted-foreground">Rewards Rate</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">
                        {rec.card.annual_fee === 0 ? '$0' : formatCurrency(rec.card.annual_fee)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Annual Fee {rec.card.first_year_waived && rec.card.annual_fee > 0 && '(waived Y1)'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <Calculator className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-primary">{formatCurrency(rec.estimatedSavings)}</p>
                      <p className="text-xs text-muted-foreground">Your Savings</p>
                    </div>
                  </div>

                  {/* Bonus Requirement */}
                  {rec.card.signup_bonus_requirement && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <span className="font-medium">To earn the bonus: </span>
                      <span className="text-muted-foreground">
                        {rec.card.signup_bonus_requirement} in {rec.card.signup_bonus_timeframe || 'the first 3 months'}
                      </span>
                    </div>
                  )}

                  {/* How We Calculated */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="h-4 w-4" />
                      How we calculated your savings
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 p-4 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {generateSavingsExplanation(rec, data.tuitionAmount)}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>

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
          ))}
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

        {/* Important Warnings */}
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
                <li>Don&apos;t apply for too many cards at once - space applications 30-90 days apart if possible</li>
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  )
}
