'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  DollarSign,
  ArrowRight,
  CreditCard,
  Coins,
} from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="container pt-28 pb-12 md:pt-32 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-xl"
          >
            <Coins className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            TuitionPay Demo Mode
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the full TuitionPay flow without needing to sign in.
            Perfect for exploring all features and seeing how it works.
          </p>
        </div>

        {/* Two Paths */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* See Your Savings */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/demo/optimizer" className="block group">
              <Card className="h-full border-2 border-primary/20 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-amber-50/50 overflow-hidden relative">
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Demo
                  </div>
                </div>
                <CardContent className="p-10 pt-16 text-center">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">See Your Savings</h3>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    Take the card optimizer quiz and see personalized recommendations from all 20 credit cards in our database.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">20 Cards</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Full Quiz</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">No Login</span>
                  </div>
                  <Button size="lg" className="h-14 px-8 text-base gap-2 rounded-full w-full md:w-auto group-hover:gap-4 transition-all">
                    Start Demo Quiz
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Pay Your Tuition */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/demo/pay" className="block group">
              <Card className="h-full border-2 border-emerald-200 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-emerald-50/50 overflow-hidden relative">
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Demo
                  </div>
                </div>
                <CardContent className="p-10 pt-16 text-center">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <DollarSign className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Pay Your Tuition</h3>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    Experience the payment flow with a demo school. See exactly how parents will pay tuition with their credit card.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Full Flow</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Demo School</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">No Charge</span>
                  </div>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base gap-2 rounded-full w-full md:w-auto border-emerald-300 hover:bg-emerald-50 group-hover:gap-4 transition-all">
                    Try Payment Flow
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* View All Cards Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link href="/demo/cards" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <CreditCard className="h-5 w-5" />
            View All 20 Credit Cards in Database
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
