'use client'

import { useEffect } from 'react'
import { SchoolSelector } from '@/components/forms/school-selector'
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
