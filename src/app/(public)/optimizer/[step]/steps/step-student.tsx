'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users } from 'lucide-react'
import type { AssessmentData } from '@/types/assessment'

interface StepStudentProps {
  data: AssessmentData
  updateData: (updates: Partial<AssessmentData>) => void
  setCanProceed: (can: boolean) => void
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function StepStudent({ data, updateData, setCanProceed }: StepStudentProps) {
  useEffect(() => {
    const hasValidName = data.studentName.length >= 2
    const hasValidEmail = isValidEmail(data.parentEmail || '')
    setCanProceed(hasValidName && hasValidEmail)
  }, [data.studentName, data.parentEmail, setCanProceed])

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Users className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Two parents?</strong> Each parent should fill out this survey separately to maximize your family&apos;s credit card rewards potential.
        </AlertDescription>
      </Alert>

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
        <Label htmlFor="parentEmail">Your Email Address *</Label>
        <Input
          id="parentEmail"
          type="email"
          placeholder="your.email@example.com"
          value={data.parentEmail || ''}
          onChange={(e) => updateData({ parentEmail: e.target.value })}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll send your personalized card recommendations to this email.
        </p>
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
