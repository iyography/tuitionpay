'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Clock, CheckCircle, ArrowRight } from 'lucide-react'
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
        className="max-w-3xl mx-auto text-center"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          See How Much You Can Save
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Answer a few quick questions and we&apos;ll show you which credit cards
          will give you the best rewards on your tuition payment.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">2 Minutes</p>
                  <p className="text-sm text-muted-foreground">Quick assessment</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Top 3 Cards</p>
                  <p className="text-sm text-muted-foreground">Personalized picks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">No Credit Check</p>
                  <p className="text-sm text-muted-foreground">Just recommendations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" onClick={handleStart} className="gap-2">
          Start Assessment
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          Already have a card recommendation?{' '}
          <a href="/pay" className="text-primary hover:underline">
            Make a payment
          </a>
        </p>
      </motion.div>
    </div>
  )
}
