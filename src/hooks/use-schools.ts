'use client'

import { useState, useEffect } from 'react'
import { DEMO_MODE, getActiveDemoSchools, getDemoSchool } from '@/lib/demo-data'
import type { School } from '@/types/database'

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSchools() {
      try {
        if (DEMO_MODE) {
          // Use demo data
          await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
          setSchools(getActiveDemoSchools() as School[])
          setIsLoading(false)
          return
        }

        // Real Supabase fetch
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('status', 'active')
          .order('name')

        if (error) throw error
        setSchools(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schools')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchools()
  }, [])

  return { schools, isLoading, error }
}

export function useSchool(schoolId: string | null) {
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!schoolId) {
      setSchool(null)
      return
    }

    const id = schoolId // Capture non-null value

    async function fetchSchool() {
      setIsLoading(true)
      try {
        if (DEMO_MODE) {
          // Use demo data
          await new Promise(resolve => setTimeout(resolve, 300)) // Simulate loading
          setSchool(getDemoSchool(id) as School)
          setIsLoading(false)
          return
        }

        // Real Supabase fetch
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setSchool(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load school')
        setSchool(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchool()
  }, [schoolId])

  return { school, isLoading, error }
}
