'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, ArrowRight, Banknote, Plane, CheckCircle2, DollarSign, Gift, Sparkles } from 'lucide-react'
import { useAssessment } from '@/hooks/use-assessment'

export default function OptimizerPage() {
  const router = useRouter()
  const { resetData } = useAssessment()

  const handleStart = () => {
    resetData() // Clear any previous assessment data
    router.push('/optimizer/1')
  }

  return (
    <div className="container pt-28 pb-12 md:pt-32 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find the Best Credit Card for Your Tuition
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Maximize your rewards by paying tuition with the right credit card.
            <strong className="block mt-2 text-foreground">Pay in full to get the discount!</strong>
          </p>
        </div>

        {/* Two Simple Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Two Simple Steps</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Complete a Short Survey</h3>
                <p className="text-muted-foreground">
                  Tell us about your tuition amount, credit profile, and reward preferences to get personalized recommendations.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Get Your Card Recommendations</h3>
                <p className="text-muted-foreground">
                  Receive a customized list of credit cards ranked by how much value they&apos;ll give you on your tuition payment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Back vs Travel Rewards Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-2">Cash Back vs Travel Rewards</h2>
          <p className="text-center text-muted-foreground mb-8">
            Understanding your options helps you choose the best card
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cash Back Card */}
            <Card className="border-2 hover:border-emerald-500 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">Cash Back</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Get money back directly on your purchases. Simple, straightforward, and deposited into your account.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Typically 1.5-2% back on all purchases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Easy to understand - no complicated redemption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Best for: People who want simplicity</span>
                  </li>
                </ul>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Example: $10,000 tuition = $150-200 cash back</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel Rewards Card */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Plane className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Travel Rewards</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Earn points or miles redeemable for flights, hotels, and more. Higher value potential but requires strategy.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Points worth 1.5-2.3 cents when transferred to partners</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Huge signup bonuses (often 50,000-100,000 points)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Best for: Travelers who want maximum value</span>
                  </li>
                </ul>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Gift className="h-5 w-5" />
                    <span className="font-medium">Example: 75K points = $1,500+ in travel value</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex gap-4">
            <Sparkles className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Maximize Your Discount</h3>
              <p className="text-amber-700">
                To get the full discount, <strong>pay your tuition in full</strong> with your new credit card and pay off the card balance before the due date. This way you earn maximum rewards and pay no interest!
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" onClick={handleStart} className="gap-2 text-lg px-8 py-6">
            Start Assessment
            <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes about 2 minutes. No credit check required.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Already have a card recommendation?{' '}
            <a href="/pay" className="text-primary hover:underline">
              Make a payment
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
