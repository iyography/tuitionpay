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
} from 'lucide-react'
import { useAssessment } from '@/hooks/use-assessment'
import type { CardRecommendationResult } from '@/types/cards'
import { formatCurrency, generateSavingsExplanation } from '@/lib/matching/card-engine'

export default function ResultsPage() {
  const router = useRouter()
  const { data, isLoaded, getSessionId } = useAssessment()
  const [recommendations, setRecommendations] = useState<CardRecommendationResult[]>([])
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
      </div>
    </div>
  )
}
