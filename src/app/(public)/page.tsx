'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CreditCard,
  DollarSign,
  Shield,
  ArrowRight,
  CheckCircle,
  School,
  TrendingUp,
  Lock,
  Sparkles,
  Zap,
  PiggyBank,
  Plane,
  Banknote,
  ChevronDown,
  HelpCircle,
  Coins,
} from 'lucide-react'

const faqData = [
  {
    question: 'How do I redeem my credit card rewards?',
    answer: 'Redemption varies by card issuer. For cash back cards, rewards typically appear as statement credits or direct deposits. For travel rewards, you can book through the card\'s travel portal or transfer points to airline/hotel partners. Chase, Amex, and Capital One all have user-friendly redemption portals. We recommend redeeming travel points for flights or hotels where you often get 1.5-2+ cents per point value.',
  },
  {
    question: 'What credit score do I need to qualify?',
    answer: 'Most premium rewards cards require good to excellent credit (typically 670+). Cash back cards often have more flexible requirements (620+). Our recommendation engine filters cards based on your credit score range, so you\'ll only see cards you\'re likely to be approved for. If you\'re unsure of your score, check free at Credit Karma or through your bank\'s app.',
  },
  {
    question: 'How does the payment process work?',
    answer: 'First, use our Card Optimizer to find the best credit card for your situation. Apply for that card directly with the issuer. Once approved, return to TuitionPay, select your school, enter your payment details, and pay using your new card. Funds go directly to your school through our secure Helcim payment system.',
  },
  {
    question: 'Are there any fees for using TuitionPay?',
    answer: 'There\'s a standard credit card processing fee (around 3%) that applies to all credit card tuition payments. However, the rewards you earn (10-30%+ back) far exceed this fee. Schools receive 100% of the tuition amount - the fee comes from the payment processing side, not from what you pay.',
  },
  {
    question: 'How long does it take for payments to reach the school?',
    answer: 'Schools typically receive funds within 2-3 business days after your payment is processed. You\'ll receive a confirmation email immediately after your payment is completed, and can track the status in your payment history.',
  },
  {
    question: 'Can I split my tuition across multiple cards?',
    answer: 'Yes! This is actually a great strategy for maximizing rewards. You can meet multiple signup bonus requirements by splitting your tuition payment across 2-3 cards. Our Card Optimizer can help you plan this strategy based on your spending capacity and the cards you qualify for.',
  },
]

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {faqData.map((faq, index) => (
        <Card
          key={index}
          className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <ChevronDown
                  className={`h-4 w-4 text-primary transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{faq.question}</h3>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground text-sm leading-relaxed mt-2">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const features = [
  {
    icon: CreditCard,
    subtitle: 'Get Rewarded',
    title: 'Smart Card Matching',
    description: 'Our algorithm analyzes your profile to recommend the best credit cards for maximum tuition savings.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: PiggyBank,
    title: 'Save 12% on Average',
    description: 'Earn signup bonuses and rewards that can offset a significant portion of your tuition costs.',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    icon: Shield,
    title: 'School Benefits',
    description: 'Funds flow directly to schools through our PCI-compliant payment system. Schools receive donations when TuitionPay is utilized.',
    gradient: 'from-yellow-500 to-amber-600',
  },
]

const howItWorks = [
  {
    step: 1,
    title: 'Take Our Quick Assessment',
    description: 'Answer a few questions about your credit profile and tuition needs.',
    icon: Sparkles,
  },
  {
    step: 2,
    title: 'Get Personalized Recommendations',
    description: 'See which credit cards will give you the best rewards on your tuition payment.',
    icon: CreditCard,
  },
  {
    step: 3,
    title: 'Apply for Your Card',
    description: 'Apply for your recommended card and get approved (usually within minutes).',
    icon: Zap,
  },
  {
    step: 4,
    title: 'Pay Your Tuition',
    description: 'Return to TuitionPay to make your payment using your new card.',
    icon: DollarSign,
  },
]

const stats = [
  { value: '$2M+', label: 'Tuition Processed' },
  { value: '500+', label: 'Happy Families' },
  { value: '50+', label: 'Partner Schools' },
  { value: '12%', label: 'Avg. Yearly Savings' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section with Mesh Gradient */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 mesh-gradient" />

        {/* Floating Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-delay-1 absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 blur-3xl" />
          <div className="blob blob-delay-2 absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-yellow-400/25 to-amber-500/15 blur-3xl" />
          <div className="blob blob-delay-3 absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/10 blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <motion.div style={{ y, opacity }} className="relative z-10 w-full">
          <div className="container mx-auto px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-sm px-5 py-2 text-sm font-medium shadow-lg shadow-primary/5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-foreground/80">Parents are saving <span className="font-semibold text-primary">12%</span> on yearly tuition costs</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
              >
                <span className="text-gradient">Save Thousands</span>
                <br />
                on Private School Tuition
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Turn your tuition payments into credit card rewards worth thousands.
                Large, one-time payments like tuition are <strong>perfect</strong> for hitting signup bonus requirements.
              </motion.p>

              {/* CTA Buttons - Two Distinct Paths */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-5 justify-center items-center"
              >
                <Button size="lg" className="h-16 px-10 text-lg gap-3 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-semibold" asChild>
                  <Link href="/optimizer">
                    Find Your Best Card
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full bg-white/60 backdrop-blur-sm border-2 border-primary/30 hover:bg-white/80 hover:border-primary/50 transition-all duration-300 font-semibold" asChild>
                  <Link href="/pay">Pay Your Tuition Now</Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={itemVariants}
                className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
              >
                {['PCI Compliant', 'Bank-Level Security', 'No Hidden Fees'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-foreground/20 flex justify-center pt-2"
          >
            <div className="w-1.5 h-2.5 rounded-full bg-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Two Paths Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Two Simple Steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              First, discover your best credit card. Then, come back to pay your tuition.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Path 1: Card Optimizer */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/optimizer" className="block group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-amber-50/50 overflow-hidden relative">
                  {/* Step Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      <span>Step 1</span>
                    </div>
                  </div>
                  <CardContent className="p-10 pt-16 text-center">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Credit Card AI Tool</h3>
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed min-h-[84px]">
                      Answer a few quick questions and our AI will recommend the best credit cards to maximize your tuition savings.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">2 Min Quiz</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Personalized Results</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Free</span>
                    </div>
                    <Button size="lg" className="h-14 px-8 text-base gap-2 rounded-full w-full md:w-auto group-hover:gap-4 transition-all">
                      Find Your Best Card
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Path 2: Pay Tuition */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href="/pay" className="block group">
                <Card className="h-full border-2 border-emerald-200 hover:border-emerald-400 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-emerald-50/50 overflow-hidden relative">
                  {/* Step Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <span>Step 2</span>
                    </div>
                  </div>
                  <CardContent className="p-10 pt-16 text-center">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <DollarSign className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Pay Your Tuition</h3>
                    <p className="text-muted-foreground text-lg mb-6 leading-relaxed min-h-[84px]">
                      Already have your card? Use our secure payment portal to pay tuition directly to your school with your credit card.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Secure</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Direct to School</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Instant</span>
                    </div>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base gap-2 rounded-full w-full md:w-auto border-emerald-300 hover:bg-emerald-50 group-hover:gap-4 transition-all">
                      Pay Your Tuition
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>

          {/* Connector Arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="hidden md:flex justify-center mt-8"
          >
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-muted-foreground/30" />
              <span className="text-sm font-medium">Apply for your card, then return to pay</span>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-muted-foreground/30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why TuitionPay?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We help you find the best credit cards for your situation and make paying tuition easy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Card className="h-full border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 bg-white/80 backdrop-blur-sm group overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    {'subtitle' in feature && feature.subtitle && (
                      <p className="text-sm font-medium text-primary mb-1">{feature.subtitle}</p>
                    )}
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-blue-500/[0.02]" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Two simple visits: First, find your perfect card. Then, come back to pay.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step Number with Icon */}
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                      <item.icon className="h-9 w-9 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>

                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+50px)] w-[calc(100%-60px)] h-[2px]">
                    <div className="w-full h-full bg-gradient-to-r from-primary/30 to-primary/10" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Comparison Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cash Back vs. Travel Rewards</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Our 10-12% estimate is based on cash back. But travel rewards can be worth <span className="font-semibold text-primary">2-3x more</span>, potentially pushing your savings even higher.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Cash Back Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50/50 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                      <Banknote className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Cash Back</h3>
                      <p className="text-emerald-600 font-semibold">Simple & Straightforward</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Points redeemed for cash back after purchase</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Signup bonuses typically $500-$2,500</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">No points program to learn</span>
                    </div>
                  </div>

                  <div className="bg-emerald-100 rounded-xl p-5">
                    <div className="text-sm text-emerald-800 font-medium mb-1">On $30,000 tuition</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-emerald-700">$3,000-$3,600</span>
                      <span className="text-emerald-600">savings</span>
                    </div>
                    <div className="text-sm text-emerald-600 mt-1">10-12% effective return</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Travel Rewards Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full border-2 border-blue-200 shadow-xl bg-gradient-to-br from-white to-blue-50/50 overflow-hidden relative">
                {/* Popular Badge */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    <TrendingUp className="h-3 w-3" />
                    Higher Value
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Plane className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Travel Rewards</h3>
                      <p className="text-blue-600 font-semibold">Worth 2-3x More</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Points can be redeemed for travel, typically 1.5 to 3+ cents per point in value</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Transfer partners vary, recommendation based on your preferences</span>
                    </div>
                  </div>

                  <div className="bg-blue-100 rounded-xl p-5">
                    <div className="text-sm text-blue-800 font-medium mb-1">On $30,000 tuition</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-700">$6,000-$9,000+</span>
                      <span className="text-blue-600">in travel value</span>
                    </div>
                    <div className="text-sm text-blue-600 mt-1">20-30%+ effective return</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-3xl mx-auto mt-12 text-center"
          >
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Not a traveler?</span> Cash back is still excellent—getting 10-12% back on tuition is a significant savings.
              Our tool recommends the best option based on <span className="font-medium">your</span> preferences.
            </p>
            <p className="text-sm text-green-600 mt-3 font-medium">
              Best of all: credit card rewards are tax-free!
            </p>
          </motion.div>

          {/* Pay in Full Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-3xl mx-auto mt-6 text-center"
          >
            <p className="text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
              <strong>Note:</strong> These savings assume you pay off your credit card balance in full to avoid interest charges.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-muted/30 to-muted/50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Trusted by Schools & Parents</h2>
              <ul className="space-y-5">
                {[
                  'Funds go directly to schools - we never touch the money',
                  'PCI-compliant payment processing through Helcim',
                  'No hidden fees - transparent pricing always',
                  'Schools receive funds within 2-3 business days',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center p-8 border-0 shadow-lg shadow-black/5 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                    <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Schools Section */}
      <section id="schools" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-8 shadow-lg shadow-primary/25">
              <School className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Schools</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
              Join TuitionPay to offer your families a better way to pay while earning revenue share
              on every transaction. Our sub-merchant architecture means funds flow directly to your
              account with no compliance hassle.
            </p>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full" asChild>
              <Link href="/partner">Apply to Partner</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <HelpCircle className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Common questions about credit card rewards, redemption, and our platform.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {/* FAQ Items - Placeholder for now */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <FAQAccordion />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center mt-10"
            >
              <p className="text-muted-foreground">
                Have more questions?{' '}
                <Link href="mailto:support@tuitionpay.ai" className="text-primary hover:underline font-medium">
                  Contact us
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-orange-600" />

        {/* Animated Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blob absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="blob blob-delay-2 absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-8">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Start Saving?</h2>
            <p className="text-white/80 mb-10 text-lg leading-relaxed">
              Take our 2-minute assessment to discover your personalized card recommendations
              and see exactly how much you could save on tuition.
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-base gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link href="/optimizer">
                Get Your Recommendations
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Floating Demo Button */}
      <Link href="/demo" className="fixed bottom-6 right-6 z-50 group">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Coins className="h-8 w-8 text-white" />
            </motion.div>
          </div>
          <div className="absolute -top-12 right-0 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Try Full Demo
          </div>
        </motion.div>
      </Link>
    </div>
  )
}
