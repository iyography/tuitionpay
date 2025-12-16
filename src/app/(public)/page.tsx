'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
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
} from 'lucide-react'

const features = [
  {
    icon: CreditCard,
    title: 'Smart Card Matching',
    description: 'Our algorithm analyzes your profile to recommend the best credit cards for maximum tuition savings.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: PiggyBank,
    title: 'Save 10-12%',
    description: 'Earn signup bonuses and rewards that can offset a significant portion of your tuition costs.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Funds flow directly to schools through our PCI-compliant payment system. We never touch your money.',
    gradient: 'from-emerald-500 to-teal-500',
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
  { value: '$3,500', label: 'Avg. Annual Savings' },
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
          <div className="blob blob-delay-1 absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-400/30 to-purple-500/20 blur-3xl" />
          <div className="blob blob-delay-2 absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-400/25 to-cyan-500/15 blur-3xl" />
          <div className="blob blob-delay-3 absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-pink-400/20 to-rose-500/10 blur-3xl" />
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
                  <span className="text-foreground/80">Parents are saving an average of <span className="font-semibold text-primary">$3,500</span> per year</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
              >
                Save{' '}
                <span className="text-gradient">10-12%</span>
                <br />
                on Private School Tuition
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Discover which credit cards will maximize your rewards when paying tuition.
                Turn your largest annual expense into significant savings.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button size="lg" className="h-14 px-8 text-base gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" asChild>
                  <Link href="/optimizer">
                    See How Much You Can Save
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-300" asChild>
                  <Link href="/pay">Already Have a Card? Pay Now</Link>
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

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-violet-600" />

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
    </div>
  )
}
