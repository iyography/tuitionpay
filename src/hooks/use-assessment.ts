'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AssessmentData } from '@/types/assessment'

const STORAGE_KEY = 'tuitionpay_assessment'

const defaultAssessment: AssessmentData = {
  schoolId: '',
  schoolName: '',
  studentName: '',
  studentIdentifier: '',
  parentEmail: '',
  tuitionAmount: 0,
  creditScoreRange: 'good',
  recentCardApplications: '0',
  currentCards: [],
  monthlySpendCapacity: 0,
  preferredRewardsType: 'flexible',
  preferredAirlines: [],
  preferredHotels: [],
  openToBusinessCards: false,
}

export function useAssessment() {
  const [data, setData] = useState<AssessmentData>(defaultAssessment)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setData(JSON.parse(stored))
        } catch {
          // Invalid JSON, use default
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to sessionStorage when data changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoaded])

  const updateData = useCallback((updates: Partial<AssessmentData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const resetData = useCallback(() => {
    setData(defaultAssessment)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const getSessionId = useCallback(() => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('tuitionpay_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem('tuitionpay_session_id', sessionId)
      }
      return sessionId
    }
    return `session_${Date.now()}`
  }, [])

  return {
    data,
    isLoaded,
    updateData,
    resetData,
    getSessionId,
  }
}
