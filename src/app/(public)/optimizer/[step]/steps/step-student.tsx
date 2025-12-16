'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AssessmentData } from '@/types/assessment'

interface StepStudentProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

export function StepStudent({ data, updateData, setCanProceed }: StepStudentProps) {
  useEffect(() => {
    setCanProceed(data.studentName.length >= 2)
  }, [data.studentName, setCanProceed])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="studentName">Student&apos;s Full Name *</Label>
        <Input
          id="studentName"
          placeholder="Enter student's name"
          value={data.studentName}
          onChange={(e) => updateData({ studentName: e.target.value })}
          className="h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="studentId">
          Student ID <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="studentId"
          placeholder="e.g., 12345 or leave blank"
          value={data.studentIdentifier || ''}
          onChange={(e) => updateData({ studentIdentifier: e.target.value })}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          If your school provided a student ID or account number, enter it here.
        </p>
      </div>
    </div>
  )
}
