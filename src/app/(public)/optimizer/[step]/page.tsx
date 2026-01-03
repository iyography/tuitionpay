'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAssessment } from '@/hooks/use-assessment'
import { AssessmentWizard } from '@/components/forms/assessment-wizard'
import { WIZARD_TOTAL_STEPS } from '@/types/assessment'
import { useState, useEffect } from 'react'

// Step Components
import { StepSchool } from './steps/step-school'
import { StepStudent } from './steps/step-student'
import { StepTuition } from './steps/step-tuition'
import { StepRecentApplications } from './steps/step-recent-applications'
import { StepCurrentCards } from './steps/step-current-cards'
import { StepRewardsType } from './steps/step-rewards-type'
import { StepBusinessCards } from './steps/step-business-cards'

export default function WizardStepPage() {
  const params = useParams()
  const router = useRouter()
  const { data, updateData, isLoaded } = useAssessment()
  const [canProceed, setCanProceed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const step = parseInt(params.step as string, 10)

  // Validate step number
  useEffect(() => {
    if (isNaN(step) || step < 1 || step > WIZARD_TOTAL_STEPS) {
      router.replace('/optimizer/1')
    }
  }, [step, router])

  const handleBack = () => {
    if (step > 1) {
      router.push(`/optimizer/${step - 1}`)
    } else {
      router.push('/optimizer')
    }
  }

  const handleNext = async () => {
    if (step < WIZARD_TOTAL_STEPS) {
      router.push(`/optimizer/${step + 1}`)
    } else {
      // Final step - submit and go to results
      setIsSubmitting(true)
      try {
        // Store session data to be retrieved on results page
        router.push('/optimizer/results')
      } catch (error) {
        console.error('Error submitting assessment:', error)
        setIsSubmitting(false)
      }
    }
  }

  if (!isLoaded) {
    return (
      <div className="container pt-28 pb-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    )
  }

  const renderStep = () => {
    const stepProps = {
      data,
      updateData,
      setCanProceed,
    }

    switch (step) {
      case 1:
        return <StepSchool {...stepProps} />
      case 2:
        return <StepStudent {...stepProps} />
      case 3:
        return <StepTuition {...stepProps} />
      case 4:
        return <StepRecentApplications {...stepProps} />
      case 5:
        return <StepCurrentCards {...stepProps} />
      case 6:
        return <StepRewardsType {...stepProps} />
      case 7:
        return <StepBusinessCards {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className="container pt-28 pb-12">
      <AssessmentWizard
        currentStep={step}
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed}
        isSubmitting={isSubmitting}
        nextLabel={step === WIZARD_TOTAL_STEPS ? 'See My Results' : 'Continue'}
      >
        {renderStep()}
      </AssessmentWizard>
    </div>
  )
}
