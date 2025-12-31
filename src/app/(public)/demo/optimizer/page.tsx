'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  School,
  User,
  DollarSign,
  CreditCard,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Plane,
  Banknote,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_SCHOOLS = [
  { id: 'demo-1', name: 'Demo Catholic School', city: 'Chicago', state: 'IL' },
  { id: 'demo-2', name: 'Demo Christian Academy', city: 'Dallas', state: 'TX' },
  { id: 'demo-3', name: 'Demo Montessori School', city: 'Los Angeles', state: 'CA' },
]

const CREDIT_SCORE_OPTIONS = [
  { value: 'excellent', label: 'Excellent (750+)' },
  { value: 'good', label: 'Good (700-749)' },
  { value: 'fair', label: 'Fair (650-699)' },
  { value: 'below', label: 'Below 650' },
]

const CARD_ISSUERS = ['Chase', 'American Express', 'Capital One', 'Citi']

const RECENT_CARDS_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1-2', label: '1-2 cards' },
  { value: '3-4', label: '3-4 cards' },
  { value: '5+', label: '5 or more' },
]

const TOTAL_STEPS = 7

export default function DemoOptimizerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    schoolId: '',
    studentName: '',
    parentEmail: '',
    tuitionAmount: '',
    creditScore: '',
    recentCards: '',
    currentIssuers: [] as string[],
    rewardsPreference: '',
    openToBusinessCards: true,
  })

  const progress = (step / TOTAL_STEPS) * 100

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.schoolId
      case 2: return !!formData.studentName && !!formData.parentEmail
      case 3: return !!formData.tuitionAmount && parseInt(formData.tuitionAmount) > 0
      case 4: return !!formData.creditScore
      case 5: return !!formData.recentCards
      case 6: return true // Current issuers optional
      case 7: return !!formData.rewardsPreference
      default: return true
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      // Go to results with form data in URL params
      const params = new URLSearchParams({
        tuition: formData.tuitionAmount,
        score: formData.creditScore,
        business: formData.openToBusinessCards ? 'yes' : 'no',
        rewards: formData.rewardsPreference,
        issuers: formData.currentIssuers.join(','),
      })
      router.push(`/demo/optimizer/results?${params.toString()}`)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <School className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Select Your School</h2>
              <p className="text-muted-foreground">Choose a demo school to continue</p>
            </div>
            <div className="space-y-3">
              {DEMO_SCHOOLS.map((school) => (
                <div
                  key={school.id}
                  className={cn(
                    'border rounded-lg p-4 cursor-pointer transition-all',
                    formData.schoolId === school.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => updateForm({ schoolId: school.id })}
                >
                  <p className="font-medium">{school.name}</p>
                  <p className="text-sm text-muted-foreground">{school.city}, {school.state}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Student Information</h2>
              <p className="text-muted-foreground">Enter demo student details</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="e.g., John Smith"
                  value={formData.studentName}
                  onChange={(e) => updateForm({ studentName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="e.g., parent@email.com"
                  value={formData.parentEmail}
                  onChange={(e) => updateForm({ parentEmail: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Tuition Amount</h2>
              <p className="text-muted-foreground">How much tuition are you paying?</p>
            </div>
            <div>
              <Label htmlFor="tuition">Annual Tuition Amount ($)</Label>
              <Input
                id="tuition"
                type="number"
                placeholder="e.g., 15000"
                value={formData.tuitionAmount}
                onChange={(e) => updateForm({ tuitionAmount: e.target.value })}
                className="text-2xl h-14"
              />
              {formData.tuitionAmount && (
                <p className="text-sm text-muted-foreground mt-2">
                  Potential savings: <span className="text-emerald-600 font-semibold">
                    ${Math.round(parseInt(formData.tuitionAmount) * 0.12).toLocaleString()} - ${Math.round(parseInt(formData.tuitionAmount) * 0.25).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Credit Score Range</h2>
              <p className="text-muted-foreground">What's your approximate credit score?</p>
            </div>
            <RadioGroup
              value={formData.creditScore}
              onValueChange={(value) => updateForm({ creditScore: value })}
              className="space-y-3"
            >
              {CREDIT_SCORE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all',
                    formData.creditScore === option.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => updateForm({ creditScore: option.value })}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Recent Applications</h2>
              <p className="text-muted-foreground">How many credit cards have you applied for in the last 24 months?</p>
            </div>
            <RadioGroup
              value={formData.recentCards}
              onValueChange={(value) => updateForm({ recentCards: value })}
              className="space-y-3"
            >
              {RECENT_CARDS_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all',
                    formData.recentCards === option.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => updateForm({ recentCards: option.value })}
                >
                  <RadioGroupItem value={option.value} id={`recent-${option.value}`} />
                  <Label htmlFor={`recent-${option.value}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Current Cards</h2>
              <p className="text-muted-foreground">Which card issuers do you already have cards from?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CARD_ISSUERS.map((issuer) => {
                const isSelected = formData.currentIssuers.includes(issuer)
                return (
                  <div
                    key={issuer}
                    className={cn(
                      'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all',
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    )}
                    onClick={() => {
                      const updated = isSelected
                        ? formData.currentIssuers.filter(i => i !== issuer)
                        : [...formData.currentIssuers, issuer]
                      updateForm({ currentIssuers: updated })
                    }}
                  >
                    <Checkbox checked={isSelected} />
                    <Label className="flex-1 cursor-pointer">{issuer}</Label>
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Don't have any? No problem - just continue!
            </p>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Rewards Preference</h2>
              <p className="text-muted-foreground">What type of rewards do you prefer?</p>
            </div>
            <RadioGroup
              value={formData.rewardsPreference}
              onValueChange={(value) => updateForm({ rewardsPreference: value })}
              className="space-y-3"
            >
              <div
                className={cn(
                  'flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-all',
                  formData.rewardsPreference === 'cash_back'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
                onClick={() => updateForm({ rewardsPreference: 'cash_back' })}
              >
                <RadioGroupItem value="cash_back" id="cash_back" className="mt-1" />
                <Banknote className="h-6 w-6 text-emerald-600" />
                <div className="flex-1">
                  <Label htmlFor="cash_back" className="cursor-pointer font-medium block">Cash Back</Label>
                  <p className="text-sm text-muted-foreground">Get money back directly on purchases</p>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-all',
                  formData.rewardsPreference === 'travel_points'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
                onClick={() => updateForm({ rewardsPreference: 'travel_points' })}
              >
                <RadioGroupItem value="travel_points" id="travel_points" className="mt-1" />
                <Plane className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="travel_points" className="cursor-pointer font-medium block">Travel Points</Label>
                  <p className="text-sm text-muted-foreground">Earn points for flights, hotels, and more</p>
                </div>
              </div>
            </RadioGroup>

            {/* Business Cards Toggle */}
            <div className="pt-4 border-t">
              <div
                className={cn(
                  'flex items-start space-x-4 border rounded-lg p-4 cursor-pointer transition-all',
                  formData.openToBusinessCards
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
                onClick={() => updateForm({ openToBusinessCards: !formData.openToBusinessCards })}
              >
                <Checkbox checked={formData.openToBusinessCards} />
                <Briefcase className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium block">Include Business Cards</Label>
                  <p className="text-sm text-muted-foreground">
                    Business cards often have higher bonuses. You can apply as a sole proprietor using your SSN.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container pt-28 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-8">
                {renderStep()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {step === TOTAL_STEPS ? 'See My Results' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
