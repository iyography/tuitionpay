'use client'

import { useEffect } from 'react'
import { SchoolSelector } from '@/components/forms/school-selector'
import { Lightbulb } from 'lucide-react'
import type { AssessmentData } from '@/types/assessment'

interface StepSchoolProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepSchool({ data, updateData, setCanProceed }: StepSchoolProps) {
  useEffect(() => {
    setCanProceed(!!data.schoolId)
  }, [data.schoolId, setCanProceed])

  const handleSelect = (schoolId: string, schoolName: string) => {
    updateData({ schoolId, schoolName })
  }

  return (
    <div className="space-y-6">
      {/* Important tip banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">Complete this before paying tuition</p>
          <p className="text-amber-700 mt-1">
            Finish this quick assessment to find your best credit card <span className="font-medium">before</span> making your tuition payment.
            Applying for the right card first could save you 10-12% on your payment.
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Which school will you be paying tuition to?
        </label>
        <SchoolSelector
          value={data.schoolId}
          onSelect={handleSelect}
        />
      </div>
      {data.schoolName && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{data.schoolName}</span>
        </p>
      )}
    </div>
  )
}
