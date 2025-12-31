'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Star,
  DollarSign,
  Plane,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { demoCreditCards } from '@/lib/demo-data'

export default function DemoResultsPage() {
  const searchParams = useSearchParams()
  const tuition = parseInt(searchParams.get('tuition') || '15000')
  const creditScore = searchParams.get('score') || 'good'
  const includeBusiness = searchParams.get('business') === 'yes'
  const rewardsPreference = searchParams.get('rewards') || 'cash_back'
  const existingIssuers = (searchParams.get('issuers') || '').split(',').filter(Boolean)

  // Filter and rank cards based on preferences
  const filteredCards = demoCreditCards
    .filter(card => {
      // Filter by business preference
      if (!includeBusiness && card.is_business_card) return false

      // Filter by existing issuers (avoid recommending same issuer)
      // For demo, we'll still show them but rank lower

      // Filter by credit score
      const minScore = card.min_credit_score || 650
      const scoreMap: Record<string, number> = {
        excellent: 780,
        good: 720,
        fair: 670,
        below: 620,
      }
      if (minScore > scoreMap[creditScore] + 50) return false

      return true
    })
    .map(card => {
      // Calculate estimated value for this user
      let estimatedValue = card.signup_bonus_value || 0

      // Boost travel cards if preference is travel
      if (rewardsPreference === 'travel_points') {
        if (card.hyatt_value) estimatedValue = Math.max(estimatedValue, card.hyatt_value)
        if (card.southwest_value) estimatedValue = Math.max(estimatedValue, card.southwest_value)
        if (card.delta_value) estimatedValue = Math.max(estimatedValue, card.delta_value)
      }

      // Use cash value for cash back preference
      if (rewardsPreference === 'cash_back' && card.cash_value) {
        estimatedValue = Math.max(estimatedValue, card.cash_value)
      }

      // Calculate net value (minus annual fee if not waived first year)
      const netValue = card.first_year_waived
        ? estimatedValue
        : estimatedValue - card.annual_fee

      // Penalize if user already has this issuer
      const issuerPenalty = existingIssuers.includes(card.issuer) ? 200 : 0

      return {
        ...card,
        estimatedValue,
        netValue: netValue - issuerPenalty,
        hasIssuer: existingIssuers.includes(card.issuer),
      }
    })
    .sort((a, b) => b.netValue - a.netValue)

  const topCards = filteredCards.slice(0, 3)
  const otherCards = filteredCards.slice(3)

  const totalPotentialSavings = topCards.reduce((sum, card) => sum + card.estimatedValue, 0)
  const savingsPercentage = ((totalPotentialSavings / tuition) * 100).toFixed(1)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="container pt-28 pb-12 md:pt-32 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-xl"
          >
            <Trophy className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Card Recommendations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your ${tuition.toLocaleString()} tuition, here are the best cards for you
          </p>
        </div>

        {/* Savings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <p className="text-emerald-100 mb-2">Total Potential Savings with Top 3 Cards</p>
              <p className="text-5xl font-bold mb-2">{formatCurrency(totalPotentialSavings)}</p>
              <p className="text-emerald-100">
                That's <span className="font-semibold text-white">{savingsPercentage}%</span> of your tuition back!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top 3 Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Top Recommendations
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className={cn(
                  'h-full relative overflow-hidden',
                  index === 0 && 'border-2 border-amber-400 shadow-xl'
                )}>
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 px-3 py-1 text-sm font-semibold rounded-bl-lg">
                      Best Match
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      {card.is_business_card ? (
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-emerald-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {card.is_business_card ? 'Business' : 'Personal'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{card.card_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{card.issuer}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-emerald-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-emerald-600 mb-1">Estimated Value</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formatCurrency(card.estimatedValue)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signup Bonus:</span>
                        <span className="font-medium">{formatCurrency(card.signup_bonus_value || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Requirement:</span>
                        <span className="font-medium text-right">{card.signup_bonus_requirement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Fee:</span>
                        <span className="font-medium">
                          {card.annual_fee === 0 ? '$0' : formatCurrency(card.annual_fee)}
                          {card.first_year_waived && card.annual_fee > 0 && (
                            <span className="text-emerald-600 text-xs ml-1">(1st yr free)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {card.benefits && (
                      <p className="text-xs text-muted-foreground border-t pt-3">
                        {card.benefits}
                      </p>
                    )}

                    {card.hasIssuer && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        Note: You already have a {card.issuer} card
                      </p>
                    )}

                    <Button className="w-full gap-2" asChild>
                      <a href={card.application_url || '#'} target="_blank" rel="noopener noreferrer">
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other Cards */}
        {otherCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              Other Options ({otherCards.length} more cards)
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherCards.map((card, index) => (
                <Card key={card.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{card.card_name}</p>
                        <p className="text-sm text-muted-foreground">{card.issuer}</p>
                      </div>
                      <Badge variant={card.is_business_card ? 'default' : 'secondary'} className="text-xs">
                        {card.is_business_card ? 'Biz' : 'Personal'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-semibold">
                        {formatCurrency(card.estimatedValue)}
                      </span>
                      <span className="text-muted-foreground">
                        {card.annual_fee === 0 ? 'No fee' : `${formatCurrency(card.annual_fee)}/yr`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
            <CardContent className="p-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Ready to Pay Your Tuition?</h3>
              <p className="text-white/80 mb-6">
                Apply for your chosen card, then return to make your tuition payment and earn those rewards!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <Link href="/demo/pay">
                    Try Payment Demo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/demo/cards">
                    View All 20 Cards
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
