'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { WIZARD_TOTAL_STEPS, ASSESSMENT_STEPS } from '@/types/assessment'

interface AssessmentWizardProps {
  currentStep: number
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  canProceed?: boolean
  isSubmitting?: boolean
  nextLabel?: string
}

export function AssessmentWizard({
  currentStep,
  children,
  onBack,
  onNext,
  canProceed = true,
  isSubmitting = false,
  nextLabel = 'Continue',
}: AssessmentWizardProps) {
  const progress = (currentStep / WIZARD_TOTAL_STEPS) * 100
  const step = ASSESSMENT_STEPS[currentStep - 1]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep} of {WIZARD_TOTAL_STEPS}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Header */}
      <motion.div
        key={`header-${currentStep}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-2xl font-bold mb-2">{step?.title}</h1>
        <p className="text-muted-foreground">{step?.description}</p>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={`content-${currentStep}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {children}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 1 || isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            'Processing...'
          ) : (
            <>
              {nextLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
